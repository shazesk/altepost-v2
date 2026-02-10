import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { validateSession } from './_lib/auth.js';
import {
  readEvents,
  readReservations,
  readSettings,
  writeSettings,
  readContacts,
  writeContacts,
  readVouchers,
  writeVouchers,
  readMemberships,
  writeMemberships,
  readPageContent,
  writePageContent,
  listPages,
  readTestimonials,
  writeTestimonials,
  readGallery,
  writeGallery,
  SiteSettings,
  Testimonial,
  GalleryImage
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
        const events = await readEvents();
        const reservations = await readReservations();
        const contacts = await readContacts();
        const vouchers = await readVouchers();
        const memberships = await readMemberships();

        return res.status(200).json({
          success: true,
          data: {
            upcoming: events.filter(e => !e.is_archived).length,
            archived: events.filter(e => e.is_archived).length,
            total: events.length,
            reservations: {
              active: reservations.filter(r => r.status === 'active').length,
              total: reservations.filter(r => r.status !== 'archived').length,
              totalTickets: reservations.filter(r => r.status !== 'archived').reduce((sum, r) => sum + r.tickets, 0)
            },
            contacts: {
              active: contacts.filter(c => c.status === 'active').length,
              total: contacts.filter(c => c.status !== 'archived').length
            },
            vouchers: {
              active: vouchers.filter(v => v.status === 'active').length,
              total: vouchers.filter(v => v.status !== 'archived').length
            },
            memberships: {
              active: memberships.filter(m => m.status === 'active').length,
              total: memberships.filter(m => m.status !== 'archived').length
            }
          }
        });
      }

      case 'settings': {
        const settings = await readSettings();
        return res.status(200).json({ success: true, data: settings });
      }

      case 'contacts': {
        const contacts = await readContacts();
        const { status } = req.query;
        let filtered = contacts;
        if (status && status !== 'all') {
          filtered = contacts.filter(c => c.status === status);
        }
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return res.status(200).json({ success: true, data: filtered });
      }

      case 'vouchers': {
        const vouchers = await readVouchers();
        const { status } = req.query;
        let filtered = vouchers;
        if (status && status !== 'all') {
          filtered = vouchers.filter(v => v.status === status);
        }
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return res.status(200).json({ success: true, data: filtered });
      }

      case 'memberships': {
        const memberships = await readMemberships();
        const { status } = req.query;
        let filtered = memberships;
        if (status && status !== 'all') {
          filtered = memberships.filter(m => m.status === status);
        }
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return res.status(200).json({ success: true, data: filtered });
      }

      case 'pages': {
        const pages = await listPages();
        return res.status(200).json({ success: true, data: pages });
      }

      case 'page': {
        const { name } = req.query;
        if (!name || typeof name !== 'string') {
          return res.status(400).json({ success: false, error: 'Missing page name' });
        }
        const content = await readPageContent(name);
        if (!content) {
          return res.status(404).json({ success: false, error: 'Page not found' });
        }
        return res.status(200).json({ success: true, data: content });
      }

      case 'testimonials': {
        const testimonials = await readTestimonials();
        return res.status(200).json({ success: true, data: testimonials });
      }

      case 'gallery': {
        const gallery = await readGallery();
        return res.status(200).json({ success: true, data: gallery });
      }

      default:
        return res.status(400).json({ success: false, error: 'Invalid type parameter. Use: stats, settings, contacts, vouchers, memberships, pages, page, testimonials, gallery' });
    }
  }

  // PUT requests
  if (req.method === 'PUT') {
    if (type === 'settings') {
      const settings = req.body as SiteSettings;
      if (!settings) {
        return res.status(400).json({ success: false, error: 'Missing settings data' });
      }
      await writeSettings(settings);
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
      await writePageContent(name, content);
      return res.status(200).json({ success: true, data: content });
    }

    if (type === 'testimonials') {
      const testimonials = req.body as Testimonial[];
      if (!testimonials) {
        return res.status(400).json({ success: false, error: 'Missing testimonials data' });
      }
      await writeTestimonials(testimonials);
      return res.status(200).json({ success: true, data: testimonials });
    }

    if (type === 'gallery') {
      const gallery = req.body as GalleryImage[];
      if (!gallery) {
        return res.status(400).json({ success: false, error: 'Missing gallery data' });
      }
      await writeGallery(gallery);
      return res.status(200).json({ success: true, data: gallery });
    }

    // Update individual contact/voucher/membership by ID
    if (type === 'contacts') {
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const contacts = await readContacts();
      const index = contacts.findIndex(c => c.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      contacts[index] = { ...contacts[index], ...req.body };
      await writeContacts(contacts);
      return res.status(200).json({ success: true, data: contacts[index] });
    }

    if (type === 'vouchers') {
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const vouchers = await readVouchers();
      const index = vouchers.findIndex(v => v.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      vouchers[index] = { ...vouchers[index], ...req.body };
      await writeVouchers(vouchers);
      return res.status(200).json({ success: true, data: vouchers[index] });
    }

    if (type === 'memberships') {
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const memberships = await readMemberships();
      const index = memberships.findIndex(m => m.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      memberships[index] = { ...memberships[index], ...req.body };
      await writeMemberships(memberships);
      return res.status(200).json({ success: true, data: memberships[index] });
    }

    return res.status(400).json({ success: false, error: 'PUT supported for: settings, page, testimonials, gallery, contacts, vouchers, memberships' });
  }

  // DELETE requests
  if (req.method === 'DELETE') {
    if (type === 'contacts') {
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const contacts = await readContacts();
      const index = contacts.findIndex(c => c.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      const deleted = contacts.splice(index, 1)[0];
      await writeContacts(contacts);
      return res.status(200).json({ success: true, data: deleted });
    }

    if (type === 'vouchers') {
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const vouchers = await readVouchers();
      const index = vouchers.findIndex(v => v.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      const deleted = vouchers.splice(index, 1)[0];
      await writeVouchers(vouchers);
      return res.status(200).json({ success: true, data: deleted });
    }

    if (type === 'memberships') {
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const memberships = await readMemberships();
      const index = memberships.findIndex(m => m.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      const deleted = memberships.splice(index, 1)[0];
      await writeMemberships(memberships);
      return res.status(200).json({ success: true, data: deleted });
    }

    return res.status(400).json({ success: false, error: 'DELETE supported for: contacts, vouchers, memberships' });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
