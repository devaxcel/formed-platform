import { Router, Response } from 'express'
import { authenticate, requireRole, AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import * as emailService from "../services/emailService";  // Add this import

const router = Router()

router.use(authenticate)

// GET /api/sessions — filtered by role automatically
router.get('/', async (req: AuthRequest, res: Response) => {
  const { status, from, to } = req.query
  const role = req.user!.role

  let query = supabase
    .from('sessions')
    .select(`
      *,
      clients ( id, full_name ),
      trainers ( id, full_name, headshot_url ),
      session_notes ( * )
    `)
    .order('date_time', { ascending: true })

  // Scope to user's own sessions unless admin
  if (role === 'client') {
    const { data: client } = await supabase
      .from('clients').select('id').eq('user_id', req.user!.id).single()
    if (client) query = query.eq('client_id', client.id)
  } else if (role === 'trainer') {
    const { data: trainer } = await supabase
      .from('trainers').select('id').eq('user_id', req.user!.id).single()
    if (trainer) query = query.eq('trainer_id', trainer.id)
  }

  if (status) query = query.eq('status', status)
  if (from) query = query.gte('date_time', from)
  if (to) query = query.lte('date_time', to)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

// POST /api/sessions — admin creates session
router.post('/', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert(req.body)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  return res.status(201).json(data)
})

// PATCH /api/sessions/:id/status — trainer accepts/declines
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  const { status } = req.body

  const { data, error } = await supabase
    .from('sessions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  // Send cancellation email if status is "cancelled"
  if (status === "cancelled") {
    try {
      // Fetch session details for email
      const { data: sessionData } = await supabase
        .from("sessions")
        .select(`
          date_time,
          clients (full_name, email),
          trainers (full_name)
        `)
        .eq("id", req.params.id)
        .single();

      if (sessionData) {
        const client = sessionData.clients as any;
        const cancelledBy = req.user!.role === "trainer" ? "trainer" : "admin";

        const dateStr = new Date(sessionData.date_time).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });

        await emailService.sendClientSessionCancelled(
          client.email,
          client.full_name,
          dateStr,
          cancelledBy
        );
        
        console.log(`Cancellation email sent to ${client.email} for session ${req.params.id}`);
      }
    } catch (emailError) {
      // Log error but don't fail the request
      console.error("Failed to send cancellation email:", emailError);
    }
  }

  return res.json(data)
})

// POST /api/sessions/:id/notes — trainer submits session notes
router.post('/:id/notes', requireRole('trainer'), async (req: AuthRequest, res: Response) => {
  const session_id = req.params.id

  // Check if notes already exist
  const { data: existing } = await supabase
    .from('session_notes')
    .select('id')
    .eq('session_id', session_id)
    .single()

  if (existing) return res.status(400).json({ error: 'Notes already submitted for this session' })

  // Check if late (> 12hrs after session)
  const { data: session } = await supabase
    .from('sessions').select('date_time').eq('id', session_id).single()

  const sessionTime = new Date(session!.date_time)
  const now = new Date()
  const hoursElapsed = (now.getTime() - sessionTime.getTime()) / (1000 * 60 * 60)

  const { data: trainer } = await supabase
    .from('trainers').select('id').eq('user_id', req.user!.id).single()

  const { data, error } = await supabase
    .from('session_notes')
    .insert({
      session_id,
      trainer_id: trainer!.id,
      ...req.body,
      is_late: hoursElapsed > 12
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  // Mark session as notes submitted
  await supabase
    .from('sessions')
    .update({ notes_submitted: true, notes_submitted_at: new Date().toISOString() })
    .eq('id', session_id)

  return res.status(201).json(data)
})

export default router