import { Router, Response } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { supabase } from "../lib/supabase";
import * as emailService from "../services/emailService";

const router = Router();
router.use(authenticate);

// GET /api/clients — admin only
router.get("/", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const { status, trainer_id, plan_type, churn_risk } = req.query;

  let query = supabase
    .from("clients")
    .select(`
      *,
      trainers:assigned_trainer_id ( id, full_name, email ),
      client_onboarding ( * )
    `)
    .order("created_at", { ascending: false });

  if (status)      query = query.eq("status", status as string);
  if (trainer_id)  query = query.eq("assigned_trainer_id", trainer_id as string);
  if (plan_type)   query = query.eq("plan_type", plan_type as string);
  if (churn_risk === "true") query = query.eq("churn_risk_flag", true);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /api/clients/me
router.get("/me", requireRole("client"), async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from("clients")
    .select(`
      *,
      trainers:assigned_trainer_id (
        id, full_name, short_bio, headshot_url, specialties, certifications
      ),
      client_intake ( * ),
      client_onboarding ( * )
    `)
    .eq("user_id", req.user!.id)
    .single();

  if (error) return res.status(404).json({ error: "Client profile not found" });
  return res.json(data);
});

// GET /api/clients/:id
router.get("/:id", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from("clients")
    .select(`
      *,
      trainers:assigned_trainer_id ( * ),
      client_intake ( * ),
      client_onboarding ( * ),
      sessions ( id, date_time, booking_status, session_type ),
      support_tickets ( id, category, status, created_at ),
      payments ( id, amount, status, created_at )
    `)
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "Client not found" });
  return res.json(data);
});

// POST /api/clients — create client after application
router.post("/", async (req: AuthRequest, res: Response) => {
  const {
    full_name, email, phone, city, zip_code,
    plan_type, source, internal_notes,
  } = req.body;

  const { data, error } = await supabase
    .from("clients")
    .insert({
      user_id:  req.user!.id,
      full_name, email, phone, city, zip_code,
      plan_type, source, internal_notes,
      status: "submitted",
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Auto-create onboarding checklist row
  await supabase.from("client_onboarding").insert({ client_id: data.id });

  // Emails
  await emailService.sendClientApplicationReceived(email, full_name);
  await emailService.sendAdminNewClientApplication(
    full_name, email, city ?? "", plan_type ?? "not specified"
  );

  return res.status(201).json(data);
});

// PATCH /api/clients/:id — admin updates client
router.patch("/:id", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  console.log("\n========== PATCH REQUEST ==========");
  console.log("Client ID:", req.params.id);
  console.log("Request body:", req.body);
  console.log("req.body.status value:", req.body.status);
  console.log("Type of status:", typeof req.body.status);
  
  const { data, error } = await supabase
    .from("clients")
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) {
    console.error("Update error:", error);
    return res.status(400).json({ error: error.message });
  }

  console.log("Updated client status:", data.status);
  console.log("Client email:", data.email);
  console.log("Client user_id:", data.user_id);
  console.log("Client full_name:", data.full_name);

  const newStatus = req.body.status;
  console.log("Comparing status: newStatus === 'approved'?", newStatus === "approved");
  console.log("newStatus value:", newStatus);
  
  if (newStatus === "approved") {
    console.log("✅ STATUS MATCHED! Sending approval email...");
    try {
      await emailService.sendClientApproved(data.email, data.full_name, data.user_id);
      console.log("Email function completed");
    } catch (err: any) {
      console.error("Email error:", err.message);
    }
  } else {
    console.log("❌ Status did NOT match 'approved'");
  }

  return res.json(data);
});

// PATCH /api/clients/me/onboarding
router.patch("/me/onboarding", requireRole("client"), async (req: AuthRequest, res: Response) => {
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", req.user!.id)
    .single();

  if (!client) return res.status(404).json({ error: "Client not found" });

  const { data, error } = await supabase
    .from("client_onboarding")
    .update(req.body)
    .eq("client_id", client.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

export default router;