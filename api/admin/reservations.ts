import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { validateSession } from './_lib/auth.js';
import { readEvents, readReservations, writeReservations, Reservation } from './_lib/data.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;

  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId || !validateSession(sessionId)) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  if (req.method === 'GET') {
    const reservations = await readReservations();
    const events = await readEvents();
    const { eventId, status } = req.query;

    let filtered = reservations;

    if (eventId) {
      filtered = filtered.filter(r => r.eventId === parseInt(eventId as string));
    }

    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }

    const enriched = filtered.map(r => {
      const event = events.find(e => e.id === r.eventId);
      return {
        ...r,
        eventTitle: event ? event.title : (r.eventTitle || 'Unbekannt'),
        eventDate: event ? event.date : null,
        eventArtist: event ? event.artist : null
      };
    });

    enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({ success: true, data: enriched });
  }

  if (req.method === 'POST') {
    const reservations = await readReservations();
    const { eventId, name, email, phone, tickets, notes } = req.body || {};

    if (!eventId || !name || !email || !tickets) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const newReservation: Reservation = {
      id: reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1,
      eventId: parseInt(eventId),
      name,
      email,
      phone: phone || '',
      tickets: parseInt(tickets),
      status: 'active',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    reservations.push(newReservation);
    await writeReservations(reservations);

    return res.status(200).json({ success: true, data: newReservation });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
