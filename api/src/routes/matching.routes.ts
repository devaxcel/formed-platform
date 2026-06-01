import { Router, Response } from 'express'
import { authenticate, requireRole, AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import * as emailService from "../services/emailService";
const router = Router()

router.use(authenticate, requireRole('admin'))

// GET /api/matching/queue — clients ready to be matched
router.get('/queue', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('clients')
    .select(`*, client_intake(*)`)
    .in('status', ['ready_for_match'])
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

// GET /api/matching/recommend/:clientId — top trainer recommendations
router.get('/recommend/:clientId', async (req: AuthRequest, res: Response) => {
  const { data: client } = await supabase
    .from('clients')
    .select(`*, client_intake(*)`)
    .eq('id', req.params.clientId)
    .single()

  if (!client) return res.status(404).json({ error: 'Client not found' })

  // Get active trainers with capacity
  const { data: trainers } = await supabase
    .from('trainers')
    .select(`*, trainer_availability(*)`)
    .eq('status', 'active')
    .lt('current_client_count', supabase.rpc as any)

  // Simple compatibility scoring
  const scored = (trainers || []).map((trainer: any) => {
    let score = 0

    // Location match (30%)
    if (trainer.city === client.city) score += 30

    // Specialty match (25%)
    const clientGoals: string[] = client.client_intake?.primary_goals || []
    const trainerSpecialties: string[] = trainer.specialties || []
    const overlap = clientGoals.filter((g: string) =>
      trainerSpecialties.some((s: string) => s.toLowerCase().includes(g.toLowerCase()))
    )
    score += Math.min(overlap.length * 8, 25)

    // Availability (25%) — simplified check
    if (trainer.trainer_availability?.length > 0) score += 25

    // Tier (10%)
    if (trainer.tier === 'elite_trainer') score += 10
    else if (trainer.tier === 'senior_trainer') score += 6
    else score += 3

    // Capacity (10%)
    const capacityUsed = trainer.current_client_count / (trainer.max_active_clients || 10)
    if (capacityUsed < 0.5) score += 10
    else if (capacityUsed < 0.8) score += 5

    return { ...trainer, compatibility_score: Math.round(score) }
  })

  // Return top 3
  const top3 = scored
    .sort((a: any, b: any) => b.compatibility_score - a.compatibility_score)
    .slice(0, 3)

  return res.json(top3)
})

// POST /api/matching/assign — assign trainer to client
router.post("/assign", async (req: AuthRequest, res: Response) => {
  const { client_id, trainer_id, backup_trainer_id, compatibility_score, notes } = req.body;

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      client_id, trainer_id, backup_trainer_id,
      compatibility_score, notes,
      assigned_by: req.user!.id,
    })
    .select()
    .single();

  if (matchError) return res.status(400).json({ error: matchError.message });

  // Update client
  await supabase
    .from("clients")
    .update({
      assigned_trainer_id: trainer_id,
      status:              "active",
      updated_at:          new Date().toISOString(),
    })
    .eq("id", client_id);

  // Increment trainer count
  await supabase.rpc("increment_trainer_client_count", { trainer_id });

  // Fetch details for emails
  const { data: client } = await supabase
    .from("clients")
    .select("full_name, email, city, plan_type")
    .eq("id", client_id)
    .single();

  const { data: trainer } = await supabase
    .from("trainers")
    .select("full_name, email, short_bio, specialties")
    .eq("id", trainer_id)
    .single();

  const { data: intake } = await supabase
    .from("client_intake")
    .select("primary_goals")
    .eq("client_id", client_id)
    .single();

  if (client && trainer) {
    // Email client — meet your trainer
    await emailService.sendClientTrainerMatched(
      client.email,
      client.full_name,
      trainer.full_name,
      trainer.short_bio ?? "Certified personal trainer with FORMED.",
      trainer.specialties ?? []
    );

    // Email trainer — new client assigned
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 3);

    await emailService.sendTrainerClientAssigned(
      trainer.email,
      trainer.full_name,
      client.full_name.split(" ")[0],
      client.city ?? "Tampa",
      intake?.primary_goals ?? [],
      startDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    );
  }

  return res.status(201).json(match);
});

export default router