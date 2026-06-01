import { Router, Response } from 'express'
import { authenticate, requireRole, AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()

router.use(authenticate)

// GET /api/tickets
router.get('/', async (req: AuthRequest, res: Response) => {
  let query = supabase
    .from('support_tickets')
    .select(`*, ticket_replies(*)`)
    .order('created_at', { ascending: false })

  if (req.user!.role !== 'admin') {
    query = query.eq('submitted_by', req.user!.id)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

// POST /api/tickets
router.post('/', async (req: AuthRequest, res: Response) => {
  const { category, subject, message, priority } = req.body

  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      submitted_by: req.user!.id,
      submitted_by_role: req.user!.role,
      category, subject, message,
      priority: priority || 'normal',
      status: 'open'
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  return res.status(201).json(data)
})

// POST /api/tickets/:id/reply
router.post('/:id/reply', async (req: AuthRequest, res: Response) => {
  const { message } = req.body

  const { data, error } = await supabase
    .from('ticket_replies')
    .insert({ ticket_id: req.params.id, sender_id: req.user!.id, message })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  // Update ticket status if admin replied
  if (req.user!.role === 'admin') {
    await supabase
      .from('support_tickets')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
  }

  return res.status(201).json(data)
})

// PATCH /api/tickets/:id — admin updates ticket
router.patch('/:id', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  return res.json(data)
})

export default router