import { Router, Request, Response } from "express";
import { stripe } from "../lib/stripe";
import { supabase } from "../lib/supabase";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import * as emailService from "../services/emailService"; // Add this import

const router = Router();

// ── Stripe webhook (no auth — raw body, verified by signature) ────────────
router.post(
  "/webhook",
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }

    // Use 'any' to bypass all TypeScript issues
    let event: any;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    console.log(`Stripe event received: ${event.type}`);

    try {
      switch (event.type) {

        case "payment_intent.succeeded": {
          const pi = event.data.object;

          await supabase
            .from("payments")
            .update({
              status:     "paid",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", pi.id);

          // Update session billing status
          const { data: payment } = await supabase
            .from("payments")
            .select("session_id, client_id")
            .eq("stripe_payment_intent_id", pi.id)
            .single();

          if (payment?.session_id) {
            await supabase
              .from("sessions")
              .update({ booking_status: "paid" })
              .eq("id", payment.session_id);
          }

          console.log(`Payment succeeded: ${pi.id}`);

          // Send payment confirmation email
          try {
            const { data: paymentData } = await supabase
              .from("payments")
              .select(`
                amount,
                clients (full_name, email),
                sessions (date_time)
              `)
              .eq("stripe_payment_intent_id", pi.id)
              .single();

            if (paymentData) {
              const client = paymentData.clients as any;
              const session = paymentData.sessions as any;
              const sessionDate = session?.date_time
                ? new Date(session.date_time).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "Your upcoming session";

              await emailService.sendClientPaymentConfirmed(
                client.email,
                client.full_name,
                paymentData.amount,
                sessionDate
              );
              console.log(`Payment confirmation email sent to ${client.email}`);
            }
          } catch (emailError) {
            console.error("Failed to send payment confirmation email:", emailError);
          }

          break;
        }

        case "payment_intent.payment_failed": {
          const pi = event.data.object;

          await supabase
            .from("payments")
            .update({
              status:         "failed",
              failure_reason: pi.last_payment_error?.message ?? "Payment failed",
              updated_at:     new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", pi.id);

          console.log(`Payment failed: ${pi.id}`);

          // Send payment failure email
          try {
            const { data: failedPaymentData } = await supabase
              .from("payments")
              .select(`
                clients (full_name, email)
              `)
              .eq("stripe_payment_intent_id", pi.id)
              .single();

            if (failedPaymentData) {
              const client = failedPaymentData.clients as any;
              await emailService.sendClientPaymentFailed(client.email, client.full_name);
              console.log(`Payment failure email sent to ${client.email}`);
            }
          } catch (emailError) {
            console.error("Failed to send payment failure email:", emailError);
          }

          break;
        }

        case "charge.refunded": {
          const charge = event.data.object;

          await supabase
            .from("payments")
            .update({
              status:           "refunded",
              refunded_amount:  charge.amount_refunded / 100,
              refunded_at:      new Date().toISOString(),
              updated_at:       new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", charge.payment_intent as string);

          break;
        }

        case "setup_intent.succeeded": {
          const si = event.data.object;
          const clientId = si.metadata?.client_id;

          if (clientId) {
            await supabase
              .from("clients")
              .update({ billing_status: "active" })
              .eq("id", clientId);

            await supabase
              .from("client_onboarding")
              .update({
                payment_method_on_file:   true,
                payment_method_added_at:  new Date().toISOString(),
              })
              .eq("client_id", clientId);
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error("Error processing webhook event:", err);
    }

    return res.json({ received: true });
  }
);

// All routes below require authentication
router.use(authenticate);

// ── Create Stripe customer ────────────────────────────────────────────────
router.post(
  "/create-customer",
  async (req: AuthRequest, res: Response) => {
    const { client_id } = req.body;

    const { data: client } = await supabase
      .from("clients")
      .select("id, full_name, email, stripe_customer_id")
      .eq("id", client_id)
      .single();

    if (!client) return res.status(404).json({ error: "Client not found" });

    // Already has customer
    if (client.stripe_customer_id) {
      return res.json({ customer_id: client.stripe_customer_id });
    }

    const customer = await stripe.customers.create({
      email: client.email,
      name:  client.full_name,
      metadata: { client_id },
    });

    await supabase
      .from("clients")
      .update({ stripe_customer_id: customer.id })
      .eq("id", client_id);

    return res.json({ customer_id: customer.id });
  }
);

// ── Create SetupIntent (save card for future charges) ─────────────────────
router.post(
  "/setup-intent",
  requireRole("client"),
  async (req: AuthRequest, res: Response) => {
    console.log("=== SETUP-INTENT CALLED ===");
    console.log("User:", req.user);
    
    const { data: client } = await supabase
      .from("clients")
      .select("id, stripe_customer_id")
      .eq("user_id", req.user!.id)
      .single();

    if (!client) return res.status(404).json({ error: "Client not found" });

    let customerId = client.stripe_customer_id;

    // Create customer if not exists
    if (!customerId) {
      const { data: userData } = await supabase
        .from("users")
        .select("email")
        .eq("id", req.user!.id)
        .single();

      const customer = await stripe.customers.create({
        email:    userData?.email,
        metadata: { client_id: client.id },
      });

      customerId = customer.id;

      await supabase
        .from("clients")
        .update({ stripe_customer_id: customerId })
        .eq("id", client.id);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      metadata: { client_id: client.id },
    });

    return res.json({
      client_secret: setupIntent.client_secret,
      customer_id:   customerId,
    });
  }
);

// ── Create PaymentIntent for a session ───────────────────────────────────
router.post(
  "/charge-session",
  requireRole("admin"),
  async (req: AuthRequest, res: Response) => {
    const { session_id } = req.body;

    const { data: session } = await supabase
      .from("sessions")
      .select(`
        id, booking_status, billing_status,
        clients (
          id, full_name, email,
          stripe_customer_id, monthly_rate, plan_type
        )
      `)
      .eq("id", session_id)
      .single();

    if (!session) return res.status(404).json({ error: "Session not found" });

    const client = session.clients as any;

    if (!client?.stripe_customer_id) {
      return res.status(400).json({
        error: "Client has no payment method on file",
      });
    }

    // Calculate per-session rate
    const sessionsPerMonth =
      client.plan_type === "3x_week" ? 12 :
      client.plan_type === "2x_week" ? 8  : 4;

    const perSessionRate = Math.round(
      ((client.monthly_rate ?? 0) / sessionsPerMonth) * 100
    );

    // Check if payment already exists
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, status")
      .eq("session_id", session_id)
      .single();

    if (existingPayment?.status === "paid") {
      return res.status(400).json({ error: "Session already paid" });
    }

    // Get saved payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: client.stripe_customer_id,
      type:     "card",
    });

    if (paymentMethods.data.length === 0) {
      return res.status(400).json({ error: "No saved payment method found" });
    }

    const paymentMethodId = paymentMethods.data[0].id;

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount:               perSessionRate,
      currency:             process.env.STRIPE_CURRENCY ?? "usd",
      customer:             client.stripe_customer_id,
      payment_method:       paymentMethodId,
      confirm:              true,
      off_session:          true,
      return_url:           `${process.env.PORTAL_URL ?? "http://localhost:3001"}/dashboard/billing`,
      description:          `FORMED training session — ${client.full_name}`,
      metadata: {
        session_id,
        client_id: client.id,
      },
    });

    // Save or update payment record
    if (existingPayment) {
      await supabase
        .from("payments")
        .update({
          stripe_payment_intent_id: paymentIntent.id,
          amount:  perSessionRate / 100,
          status:  paymentIntent.status === "succeeded" ? "paid" : "unpaid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingPayment.id);
    } else {
      await supabase.from("payments").insert({
        client_id:                client.id,
        session_id,
        amount:                   perSessionRate / 100,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_customer_id:       client.stripe_customer_id,
        status: paymentIntent.status === "succeeded" ? "paid" : "unpaid",
      });
    }

    // Update session status
    if (paymentIntent.status === "succeeded") {
      await supabase
        .from("sessions")
        .update({ booking_status: "paid" })
        .eq("id", session_id);
    } else {
      await supabase
        .from("sessions")
        .update({ booking_status: "payment_pending" })
        .eq("id", session_id);
    }

    return res.json({
      payment_intent_id: paymentIntent.id,
      status:            paymentIntent.status,
      amount:            perSessionRate / 100,
    });
  }
);

// ── Client pays their own pending session ────────────────────────────────
router.post(
  "/pay-session",
  requireRole("client"),
  async (req: AuthRequest, res: Response) => {
    const { session_id } = req.body;

    const { data: clientRecord } = await supabase
      .from("clients")
      .select("id, stripe_customer_id, monthly_rate, plan_type")
      .eq("user_id", req.user!.id)
      .single();

    if (!clientRecord?.stripe_customer_id) {
      return res.status(400).json({ error: "No payment method on file" });
    }

    const { data: payment } = await supabase
      .from("payments")
      .select("id, amount, stripe_payment_intent_id, status")
      .eq("session_id", session_id)
      .single();

    if (!payment) return res.status(404).json({ error: "Payment record not found" });
    if (payment.status === "paid") return res.status(400).json({ error: "Already paid" });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: clientRecord.stripe_customer_id,
      type:     "card",
    });

    if (paymentMethods.data.length === 0) {
      return res.status(400).json({ error: "No saved payment method found" });
    }

    const pi = await stripe.paymentIntents.create({
      amount:         Math.round(payment.amount * 100),
      currency:       process.env.STRIPE_CURRENCY ?? "usd",
      customer:       clientRecord.stripe_customer_id,
      payment_method: paymentMethods.data[0].id,
      confirm:        true,
      off_session:    true,
      return_url:     `${process.env.PORTAL_URL ?? "http://localhost:3001"}/dashboard/billing`,
      metadata: { session_id, client_id: clientRecord.id },
    });

    await supabase
      .from("payments")
      .update({
        stripe_payment_intent_id: pi.id,
        status: pi.status === "succeeded" ? "paid" : "unpaid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (pi.status === "succeeded") {
      await supabase
        .from("sessions")
        .update({ booking_status: "paid" })
        .eq("id", session_id);
    }

    return res.json({ status: pi.status });
  }
);

// ── Issue refund ──────────────────────────────────────────────────────────
router.post(
  "/refund",
  requireRole("admin"),
  async (req: AuthRequest, res: Response) => {
    const { payment_id, reason } = req.body;

    const { data: payment } = await supabase
      .from("payments")
      .select("stripe_payment_intent_id, amount, status")
      .eq("id", payment_id)
      .single();

    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status !== "paid") {
      return res.status(400).json({ error: "Can only refund paid payments" });
    }

    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
      reason:         "requested_by_customer",
      metadata:       { reason: reason ?? "Admin refund" },
    });

    await supabase
      .from("payments")
      .update({
        status:          "refunded",
        refunded_amount: refund.amount / 100,
        refunded_at:     new Date().toISOString(),
        updated_at:      new Date().toISOString(),
      })
      .eq("id", payment_id);

    return res.json({ refund_id: refund.id, amount: refund.amount / 100 });
  }
);

// ── Get all payments (admin) or own payments (client) ────────────────────
router.get(
  "/",
  async (req: AuthRequest, res: Response) => {
    let query = supabase
      .from("payments")
      .select(`
        *,
        clients (full_name, email),
        sessions (date_time, session_type)
      `)
      .order("created_at", { ascending: false });

    if (req.user!.role === "client") {
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", req.user!.id)
        .single();

      if (client) query = query.eq("client_id", client.id);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
);

// ── Get payment by ID ─────────────────────────────────────────────────────
router.get(
  "/:id",
  requireRole("admin"),
  async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
      .from("payments")
      .select(`*, clients(*), sessions(*)`)
      .eq("id", req.params.id)
      .single();

    if (error) return res.status(404).json({ error: "Payment not found" });
    return res.json(data);
  }
);

export default router;