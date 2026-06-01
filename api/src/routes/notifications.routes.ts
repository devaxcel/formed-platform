import { Router, Response } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { supabase } from "../lib/supabase";
import * as emailService from "../services/emailService";

const router = Router();
router.use(authenticate);

// ── Manual send endpoints (called by admin or system) ─────────────────────

// POST /api/notifications/send-approval
// Admin approves client → trigger approval email
router.post(
  "/send-approval",
  requireRole("admin"),
  async (req: AuthRequest, res: Response) => {
    const { client_id } = req.body;

    // ✅ Add user_id to select
    const { data: client } = await supabase
      .from("clients")
      .select("full_name, email, user_id")
      .eq("id", client_id)
      .single();

    if (!client) return res.status(404).json({ error: "Client not found" });

    // ✅ Pass user_id as third argument
    await emailService.sendClientApproved(client.email, client.full_name, client.user_id);

    return res.json({ sent: true });
  }
);

// POST /api/notifications/send-trainer-matched
// Admin matches client → trigger trainer reveal email
router.post(
  "/send-trainer-matched",
  requireRole("admin"),
  async (req: AuthRequest, res: Response) => {
    const { client_id, trainer_id } = req.body;

    // ✅ Add user_id to select (though not used for trainer matched, keep consistent)
    const { data: client } = await supabase
      .from("clients")
      .select("full_name, email, user_id")
      .eq("id", client_id)
      .single();

    const { data: trainer } = await supabase
      .from("trainers")
      .select("full_name, short_bio, specialties")
      .eq("id", trainer_id)
      .single();

    if (!client || !trainer) {
      return res.status(404).json({ error: "Client or trainer not found" });
    }

    await emailService.sendClientTrainerMatched(
      client.email,
      client.full_name,
      trainer.full_name,
      trainer.short_bio ?? "Certified personal trainer with FORMED.",
      trainer.specialties ?? []
    );

    return res.json({ sent: true });
  }
);

// POST /api/notifications/send-session-reminder
// Scheduled or manual — remind client 24hrs before session
router.post(
  "/send-session-reminder",
  requireRole("admin"),
  async (req: AuthRequest, res: Response) => {
    const { session_id } = req.body;

    const { data: session } = await supabase
      .from("sessions")
      .select(`
        date_time, location_notes,
        clients (full_name, email),
        trainers (full_name)
      `)
      .eq("id", session_id)
      .single();

    if (!session) return res.status(404).json({ error: "Session not found" });

    const client  = session.clients as any;
    const trainer = session.trainers as any;
    const dt      = new Date(session.date_time);

    const sessionDate = dt.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });
    const sessionTime = dt.toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });

    await emailService.sendClientSessionReminder(
      client.email,
      client.full_name,
      trainer.full_name,
      sessionDate,
      sessionTime,
      session.location_notes ?? "Your registered address"
    );

    return res.json({ sent: true });
  }
);

// GET /api/notifications/portal/:userId — in-portal notifications
router.get(
  "/portal/:userId",
  async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", req.params.userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
);

// PATCH /api/notifications/mark-read/:id
router.patch(
  "/mark-read/:id",
  async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  }
);

// PATCH /api/notifications/mark-all-read
router.patch(
  "/mark-all-read",
  async (req: AuthRequest, res: Response) => {
    const { user_id } = req.body;

    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", user_id)
      .eq("is_read", false);

    return res.json({ success: true });
  }
);

export default router;