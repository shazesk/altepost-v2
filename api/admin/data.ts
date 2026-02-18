import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { validateSession } from './_lib/auth.js';
import {
  readEvents,
  readReservations,
  writeReservations,
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
  readSponsors,
  writeSponsors,
  readNewsletterSubscribers,
  writeNewsletterSubscribers,
  readNewsletterIssues,
  writeNewsletterIssues,
  SiteSettings,
  Testimonial,
  GalleryImage,
  Sponsor,
  NewsletterSubscriber,
  NewsletterIssue
} from './_lib/data.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;

  const { type } = req.query;

  // Public GET endpoint for sponsors (no auth required)
  if (req.method === 'GET' && type === 'sponsors-public') {
    const sponsors = await readSponsors();
    sponsors.sort((a, b) => a.position - b.position);
    return res.status(200).json({ success: true, data: sponsors });
  }

  // Public POST endpoint for newsletter subscription (no auth required)
  if (req.method === 'POST' && type === 'newsletter-subscribe') {
    const { email, name, source } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'E-Mail-Adresse ist erforderlich' });
    }
    const subscribers = await readNewsletterSubscribers();
    const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        existing.subscribedAt = new Date().toISOString();
        await writeNewsletterSubscribers(subscribers);
        return res.status(200).json({ success: true, message: 'Erfolgreich erneut angemeldet' });
      }
      return res.status(200).json({ success: true, message: 'Bereits angemeldet' });
    }
    const newSubscriber: NewsletterSubscriber = {
      id: subscribers.length > 0 ? Math.max(...subscribers.map(s => s.id)) + 1 : 1,
      email,
      name: name || '',
      source: source || 'website',
      subscribedAt: new Date().toISOString(),
      status: 'active'
    };
    subscribers.push(newSubscriber);
    await writeNewsletterSubscribers(subscribers);
    return res.status(200).json({ success: true, message: 'Erfolgreich angemeldet' });
  }

  // All other endpoints require authentication
  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId || !validateSession(sessionId)) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  // GET requests
  if (req.method === 'GET') {
    switch (type) {
      case 'stats': {
        const events = await readEvents();
        const reservations = await readReservations();
        const contacts = await readContacts();
        const vouchers = await readVouchers();
        const memberships = await readMemberships();
        const newsletter = await readNewsletterSubscribers();

        return res.status(200).json({
          success: true,
          data: {
            upcoming: events.filter(e => !e.is_archived).length,
            archived: events.filter(e => e.is_archived).length,
            total: events.length,
            reservations: {
              active: reservations.filter(r => r.status === 'active').length,
              archived: reservations.filter(r => r.status === 'archived').length,
              total: reservations.length,
              totalTickets: reservations.filter(r => r.status !== 'archived').reduce((sum, r) => sum + r.tickets, 0)
            },
            contacts: {
              active: contacts.filter(c => c.status === 'active').length,
              archived: contacts.filter(c => c.status === 'archived').length,
              total: contacts.length
            },
            vouchers: {
              active: vouchers.filter(v => v.status === 'active').length,
              archived: vouchers.filter(v => v.status === 'archived').length,
              total: vouchers.length
            },
            memberships: {
              active: memberships.filter(m => m.status === 'active').length,
              archived: memberships.filter(m => m.status === 'archived').length,
              total: memberships.length
            },
            newsletter: {
              active: newsletter.filter(n => n.status === 'active').length,
              unsubscribed: newsletter.filter(n => n.status === 'unsubscribed').length,
              total: newsletter.length
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

      case 'sponsors': {
        const sponsors = await readSponsors();
        sponsors.sort((a, b) => a.position - b.position);
        return res.status(200).json({ success: true, data: sponsors });
      }

      case 'newsletter': {
        const subscribers = await readNewsletterSubscribers();
        subscribers.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());
        return res.status(200).json({ success: true, data: subscribers });
      }

      case 'newsletter-issues': {
        const issues = await readNewsletterIssues();
        issues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return res.status(200).json({ success: true, data: issues });
      }

      default:
        return res.status(400).json({ success: false, error: 'Invalid type parameter' });
    }
  }

  // POST requests (for creating new items)
  if (req.method === 'POST') {
    if (type === 'sponsors') {
      const sponsors = await readSponsors();
      const { name, logo, url, category, position } = req.body;
      if (!name || !category) {
        return res.status(400).json({ success: false, error: 'Name und Kategorie sind erforderlich' });
      }
      const newSponsor: Sponsor = {
        id: sponsors.length > 0 ? Math.max(...sponsors.map(s => s.id)) + 1 : 1,
        name,
        logo: logo || null,
        url: url || null,
        category,
        position: position || sponsors.filter(s => s.category === category).length + 1
      };
      sponsors.push(newSponsor);
      await writeSponsors(sponsors);
      return res.status(200).json({ success: true, data: newSponsor });
    }

    if (type === 'newsletter-issues') {
      const { title, introText, selectedEventIds } = req.body;
      if (!title || !introText) {
        return res.status(400).json({ success: false, error: 'Titel und Intro-Text sind erforderlich' });
      }
      const issues = await readNewsletterIssues();
      const newIssue: NewsletterIssue = {
        id: issues.length > 0 ? Math.max(...issues.map(i => i.id)) + 1 : 1,
        createdAt: new Date().toISOString(),
        title,
        introText,
        selectedEventIds: selectedEventIds || [],
        status: 'draft'
      };
      issues.push(newIssue);
      await writeNewsletterIssues(issues);
      return res.status(200).json({ success: true, data: newIssue });
    }

    return res.status(400).json({ success: false, error: 'POST not supported for this type' });
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

    if (type === 'sponsors') {
      // If body is an array, replace all sponsors
      if (Array.isArray(req.body)) {
        const sponsors = req.body as Sponsor[];
        await writeSponsors(sponsors);
        return res.status(200).json({ success: true, data: sponsors });
      }
      // If body has an id query param, update single sponsor
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const sponsors = await readSponsors();
      const index = sponsors.findIndex(s => s.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      sponsors[index] = { ...sponsors[index], ...req.body };
      await writeSponsors(sponsors);
      return res.status(200).json({ success: true, data: sponsors[index] });
    }

    // Update individual reservation/contact/voucher/membership by ID
    if (type === 'reservations') {
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const reservations = await readReservations();
      const index = reservations.findIndex(r => r.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      reservations[index] = { ...reservations[index], ...req.body };
      await writeReservations(reservations);
      return res.status(200).json({ success: true, data: reservations[index] });
    }

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

    if (type === 'newsletter') {
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const subscribers = await readNewsletterSubscribers();
      const index = subscribers.findIndex(s => s.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      subscribers[index] = { ...subscribers[index], ...req.body };
      await writeNewsletterSubscribers(subscribers);
      return res.status(200).json({ success: true, data: subscribers[index] });
    }

    if (type === 'newsletter-issues') {
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const issues = await readNewsletterIssues();
      const index = issues.findIndex(i => i.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      issues[index] = { ...issues[index], ...req.body };
      await writeNewsletterIssues(issues);
      return res.status(200).json({ success: true, data: issues[index] });
    }

    return res.status(400).json({ success: false, error: 'PUT not supported for this type' });
  }

  // DELETE requests
  if (req.method === 'DELETE') {
    if (type === 'reservations') {
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const reservations = await readReservations();
      const index = reservations.findIndex(r => r.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      const deleted = reservations.splice(index, 1)[0];
      await writeReservations(reservations);
      return res.status(200).json({ success: true, data: deleted });
    }

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

    if (type === 'sponsors') {
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const sponsors = await readSponsors();
      const index = sponsors.findIndex(s => s.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      const deleted = sponsors.splice(index, 1)[0];
      await writeSponsors(sponsors);
      return res.status(200).json({ success: true, data: deleted });
    }

    if (type === 'newsletter') {
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const subscribers = await readNewsletterSubscribers();
      const index = subscribers.findIndex(s => s.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      const deleted = subscribers.splice(index, 1)[0];
      await writeNewsletterSubscribers(subscribers);
      return res.status(200).json({ success: true, data: deleted });
    }

    if (type === 'newsletter-issues') {
      const id = parseInt(req.query.id as string);
      if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
      const issues = await readNewsletterIssues();
      const index = issues.findIndex(i => i.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
      const deleted = issues.splice(index, 1)[0];
      await writeNewsletterIssues(issues);
      return res.status(200).json({ success: true, data: deleted });
    }

    return res.status(400).json({ success: false, error: 'DELETE not supported for this type' });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
