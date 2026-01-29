import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { validateSession } from './_lib/auth.js';
import {
  readEvents,
  readReservations,
  readSettings,
  writeSettings,
  readContacts,
  readVouchers,
  readMemberships,
  readPageContent,
  writePageContent,
  listPages,
  readTestimonials,
  writeTestimonials,
  SiteSettings,
  Testimonial
} from './_lib/data.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;

  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId || !validateSession(sessionId)) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const { type } = req.query;

  // GET requests
  if (req.method === 'GET') {
    switch (type) {
      case 'stats': {
        const events = readEvents();
        const reservations = readReservations();
        const contacts = readContacts();
        const vouchers = readVouchers();
        const memberships = readMemberships();

        return res.status(200).json({
          success: true,
          data: {
            upcoming: events.filter(e => !e.is_archived).length,
            archived: events.filter(e => e.is_archived).length,
            total: events.length,
            reservations: {
              pending: reservations.filter(r => r.status === 'pending').length,
              confirmed: reservations.filter(r => r.status === 'confirmed').length,
              total: reservations.length,
              totalTickets: reservations.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + r.tickets, 0)
            },
            contacts: {
              new: contacts.filter(c => c.status === 'new').length,
              total: contacts.length
            },
            vouchers: {
              pending: vouchers.filter(v => v.status === 'pending').length,
              total: vouchers.length
            },
            memberships: {
              pending: memberships.filter(m => m.status === 'pending').length,
              total: memberships.length
            }
          }
        });
      }

      case 'settings': {
        const settings = readSettings();
        return res.status(200).json({ success: true, data: settings });
      }

      case 'contacts': {
        const contacts = readContacts();
        const { status } = req.query;
        let filtered = contacts;
        if (status && status !== 'all') {
          filtered = contacts.filter(c => c.status === status);
        }
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return res.status(200).json({ success: true, data: filtered });
      }

      case 'vouchers': {
        const vouchers = readVouchers();
        const { status } = req.query;
        let filtered = vouchers;
        if (status && status !== 'all') {
          filtered = vouchers.filter(v => v.status === status);
        }
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return res.status(200).json({ success: true, data: filtered });
      }

      case 'memberships': {
        const memberships = readMemberships();
        const { status } = req.query;
        let filtered = memberships;
        if (status && status !== 'all') {
          filtered = memberships.filter(m => m.status === status);
        }
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return res.status(200).json({ success: true, data: filtered });
      }

      case 'pages': {
        const pages = listPages();
        return res.status(200).json({ success: true, data: pages });
      }

      case 'page': {
        const { name } = req.query;
        if (!name || typeof name !== 'string') {
          return res.status(400).json({ success: false, error: 'Missing page name' });
        }
        const content = readPageContent(name);
        if (!content) {
          return res.status(404).json({ success: false, error: 'Page not found' });
        }
        return res.status(200).json({ success: true, data: content });
      }

      case 'testimonials': {
        const testimonials = readTestimonials();
        return res.status(200).json({ success: true, data: testimonials });
      }

      default:
        return res.status(400).json({ success: false, error: 'Invalid type parameter. Use: stats, settings, contacts, vouchers, memberships, pages, page, testimonials' });
    }
  }

  // PUT requests
  if (req.method === 'PUT') {
    if (type === 'settings') {
      const settings = req.body as SiteSettings;
      if (!settings) {
        return res.status(400).json({ success: false, error: 'Missing settings data' });
      }
      writeSettings(settings);
      return res.status(200).json({ success: true, data: settings });
    }

    if (type === 'page') {
      const { name } = req.query;
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ success: false, error: 'Missing page name' });
      }
      const content = req.body;
      if (!content) {
        return res.status(400).json({ success: false, error: 'Missing page content' });
      }
      writePageContent(name, content);
      return res.status(200).json({ success: true, data: content });
    }

    if (type === 'testimonials') {
      const testimonials = req.body as Testimonial[];
      if (!testimonials) {
        return res.status(400).json({ success: false, error: 'Missing testimonials data' });
      }
      writeTestimonials(testimonials);
      return res.status(200).json({ success: true, data: testimonials });
    }

    return res.status(400).json({ success: false, error: 'PUT supported for: settings, page, testimonials' });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
