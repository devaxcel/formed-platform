import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, full_name, role = 'client' } = req.body

  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'email, password and full_name are required' })
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name, role },
    email_confirm: true
  })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ message: 'User created', userId: data.user.id })
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return res.status(401).json({ error: error.message })

  return res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata.role
    }
  })
})

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1]!
  await supabase.auth.admin.signOut(token)
  return res.json({ message: 'Logged out' })
})

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, full_name, phone, created_at')
    .eq('id', req.user!.id)
    .single()

  if (error) return res.status(404).json({ error: 'User not found' })

  return res.json(data)
})

export default router