import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readPageContent, readTestimonials, listPages, readSettings, readEvents, readReservations, readGallery } from './admin/_lib/data.js';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}. ${month} ${year}`;
}

function formatTime(timeStr: string): string {
  return `${timeStr} Uhr`;
}

function formatPrice(price: number): string {
  return price === 0 ? 'Eintritt frei' : `${price.toFixed(2).replace('.', ',')} EUR`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for public endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, type, id } = req.query;

  // Public version check - no auth required
  if (type === 'version') {
    return res.status(200).json({ success: true, version: 'v5-logging', build: 'e2e-log', timestamp: new Date().toISOString() });
  }

  // Get single event by ID
  if (type === 'event' && id && typeof id === 'string') {
    const events = await readEvents();
    const event = events.find(e => String(e.id) === id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    let availability = event.availability;
    let remainingTickets: number | undefined;
    if (event.maxTickets != null) {
      const reservations = await readReservations();
      const bookedTickets = reservations
        .filter(r => r.eventId === event.id && r.status === 'active')
        .reduce((sum, r) => sum + r.tickets, 0);
      remainingTickets = Math.max(0, event.maxTickets - bookedTickets);
      availability = remainingTickets > 5 ? 'available' : remainingTickets >= 1 ? 'few-left' : 'sold-out';
    }
    const formatted: Record<string, any> = {
      id: String(event.id),
      title: event.title,
      artist: event.artist,
      date: formatDate(event.date),
      time: formatTime(event.time),
      price: formatPrice(event.price),
      genre: event.genre,
      month: event.month,
      availability,
      description: event.description,
      image: event.image,
      is_archived: event.is_archived,
    };
    if (remainingTickets != null) formatted.remainingTickets = remainingTickets;
    return res.status(200).json({ success: true, data: formatted });
  }

  // Get public events
  if (type === 'events') {
    const events = await readEvents();
    const isArchived = req.query.archived === '1';

    if (isArchived) {
      // Return archived events grouped by year
      const archivedEvents = events
        .filter(e => e.is_archived)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(e => ({
          id: String(e.id),
          title: e.title,
          artist: e.artist,
          date: formatDate(e.date),
          genre: e.genre,
          photos: e.photos || []
        }));

      // Group by year
      const groupedByYear: Record<string, any[]> = {};
      archivedEvents.forEach(e => {
        const year = e.date.split(' ').pop() || 'Unbekannt';
        if (!groupedByYear[year]) {
          groupedByYear[year] = [];
        }
        groupedByYear[year].push(e);
      });

      return res.status(200).json({ success: true, data: groupedByYear });
    }

    // Return upcoming (non-archived) events with remaining ticket counts
    const reservations = await readReservations();
    const upcomingEvents = events
      .filter(e => !e.is_archived)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(e => {
        let availability = e.availability;
        let remainingTickets: number | undefined;
        if (e.maxTickets != null) {
          const bookedTickets = reservations
            .filter(r => r.eventId === e.id && r.status === 'active')
            .reduce((sum, r) => sum + r.tickets, 0);
          remainingTickets = Math.max(0, e.maxTickets - bookedTickets);
          availability = remainingTickets > 5 ? 'available' : remainingTickets >= 1 ? 'few-left' : 'sold-out';
        }
        const result: Record<string, any> = {
          id: String(e.id),
          title: e.title,
          artist: e.artist,
          date: formatDate(e.date),
          time: formatTime(e.time),
          price: formatPrice(e.price),
          genre: e.genre,
          month: e.month,
          availability,
          description: e.description,
          image: e.image
        };
        if (remainingTickets != null) result.remainingTickets = remainingTickets;
        return result;
      });

    return res.status(200).json({ success: true, data: upcomingEvents });
  }

  // Get gallery images
  if (type === 'gallery') {
    const gallery = await readGallery();
    return res.status(200).json({ success: true, data: gallery });
  }

  // Get site settings (replaces /api/settings)
  if (type === 'settings') {
    const settings = await readSettings();
    return res.status(200).json({ success: true, data: settings });
  }

  // Get list of all pages
  if (type === 'list') {
    const pages = await listPages();
    return res.status(200).json({ success: true, data: pages });
  }

  // Get testimonials
  if (type === 'testimonials') {
    const testimonials = await readTestimonials();
    const { page } = req.query;
    if (page && typeof page === 'string') {
      const filtered = testimonials.filter(t => t.page === page);
      return res.status(200).json({ success: true, data: filtered });
    }
    return res.status(200).json({ success: true, data: testimonials });
  }

  // Get specific page content
  if (name && typeof name === 'string') {
    const content = await readPageContent(name);
    if (!content) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    return res.status(200).json({ success: true, data: content });
  }

  return res.status(400).json({ success: false, error: 'Missing name or type parameter. Use: type=events, type=settings, type=list, type=testimonials, or name=<pagename>' });
}
