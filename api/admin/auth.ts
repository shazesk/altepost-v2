import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { authenticateAdmin, createSession, validateSession, destroySession, hashPassword } from './_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;

  const { action } = req.query;

  // POST /api/admin/auth?action=login
  if (action === 'login' && req.method === 'POST') {
    try {
      const { username, password } = req.body || {};

      if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username and password required' });
      }

      const admin = await authenticateAdmin(username, password);

      if (!admin) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const sessionId = createSession(admin.id, admin.username);

      return res.status(200).json({ success: true, sessionId, username: admin.username });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  // POST /api/admin/auth?action=logout
  if (action === 'logout' && req.method === 'POST') {
    const sessionId = req.headers['x-session-id'] as string;
    if (sessionId) {
      destroySession(sessionId);
    }
    return res.status(200).json({ success: true });
  }

  // GET /api/admin/auth?action=check
  if (action === 'check' && req.method === 'GET') {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const session = validateSession(sessionId);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Session expired' });
    }

    return res.status(200).json({ success: true, username: session.username });
  }

  // GET /api/admin/auth?action=seed — TEMPORARY: seed admin credentials into Redis
  if (action === 'seed' && req.method === 'GET') {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      const admins = [{ id: 1, username: 'admin', password: hashPassword('Golshahzad89') }];
      await redis.set('admins', admins);
      return res.status(200).json({ success: true, message: 'Admin credentials seeded' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(400).json({ success: false, error: 'Invalid action. Use: login, logout, check' });
}
