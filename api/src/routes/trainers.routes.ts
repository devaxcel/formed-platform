import { Router, Response } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { supabase } from "../lib/supabase";
import * as emailService from "../services/emailService";

const router = Router();
router.use(authenticate);

// GET /api/trainers — admin only
router.get("/", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const { status, tier, city, specialty } = req.query;

  let query = supabase
    .from("trainers")
    .select("*")
    .order("created_at", { ascending: false });

  if (status)    query = query.eq("status", status as string);
  if (tier)      query = query.eq("tier", tier as string);
  if (city)      query = query.ilike("city", `%${city}%`);
  if (specialty) query = query.contains("specialties", [specialty]);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /api/trainers/me
router.get("/me", requireRole("trainer"), async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from("trainers")
    .select(`
      *,
      trainer_availability ( * ),
      trainer_module_progress ( *, onboarding_modules(*) )
    `)
    .eq("user_id", req.user!.id)
    .single();

  if (error) return res.status(404).json({ error: "Trainer profile not found" });
  return res.json(data);
});

// GET /api/trainers/:id
router.get("/:id", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from("trainers")
    .select(`
      *,
      trainer_docs ( * ),
      trainer_availability ( * ),
      trainer_module_progress ( *, onboarding_modules(*) ),
      clients:clients ( id, full_name, status, plan_type )
    `)
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "Trainer not found" });
  return res.json(data);
});

// POST /api/trainers — trainer submits application
router.post("/", async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from("trainers")
    .insert({
      user_id: req.user!.id,
      ...req.body,
      status: "submitted",
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Emails
  await emailService.sendTrainerApplicationReceived(data.email, data.full_name);
  await emailService.sendAdminNewTrainerApplication(
    data.full_name, data.email, data.city ?? ""
  );

  return res.status(201).json(data);
});

// PATCH /api/trainers/me — trainer updates own profile
router.patch("/me", requireRole("trainer"), async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from("trainers")
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq("user_id", req.user!.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

// PATCH /api/trainers/:id — admin updates trainer
router.patch("/:id", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from("trainers")
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Status-triggered emails
  const newStatus = req.body.status;
  if (newStatus === "active")   await emailService.sendTrainerApproved(data.email, data.full_name);
  if (newStatus === "rejected") await emailService.sendTrainerRejected(data.email, data.full_name);

  return res.json(data);
});

export default router;