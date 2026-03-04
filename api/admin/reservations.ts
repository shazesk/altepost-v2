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

  const { id, action } = req.query;

  // Single reservation operations (when ?id=X is provided)
  if (id) {
    const reservationId = parseInt(id as string);
    if (isNaN(reservationId)) {
      return res.status(400).json({ success: false, error: 'Invalid reservation ID' });
    }

    const reservations = await readReservations();
    const reservationIndex = reservations.findIndex(r => r.id === reservationId);

    if (reservationIndex === -1) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    // Status update: POST ?id=X&action=status
    if (action === 'status' && req.method === 'POST') {
      const { status } = req.body || {};
      if (!status || !['active', 'archived'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status. Must be: active or archived' });
      }
      reservations[reservationIndex].status = status;
      await writeReservations(reservations);
      return res.status(200).json({ success: true, data: reservations[reservationIndex] });
    }

    if (req.method === 'GET') {
      const events = await readEvents();
      const reservation = reservations[reservationIndex];
      const event = events.find(e => e.id === reservation.eventId);
      return res.status(200).json({
        success: true,
        data: {
          ...reservation,
          eventTitle: event ? event.title : (reservation.eventTitle || 'Unbekannt'),
          eventDate: event ? event.date : null,
          eventArtist: event ? event.artist : null
        }
      });
    }

    if (req.method === 'PUT') {
      const body = req.body || {};
      reservations[reservationIndex] = {
        ...reservations[reservationIndex],
        name: body.name ?? reservations[reservationIndex].name,
        email: body.email ?? reservations[reservationIndex].email,
        phone: body.phone ?? reservations[reservationIndex].phone,
        tickets: body.tickets !== undefined ? parseInt(body.tickets) : reservations[reservationIndex].tickets,
        status: body.status ?? reservations[reservationIndex].status,
        notes: body.notes ?? reservations[reservationIndex].notes
      };
      await writeReservations(reservations);
      return res.status(200).json({ success: true, data: reservations[reservationIndex] });
    }

    if (req.method === 'DELETE') {
      const deleted = reservations.splice(reservationIndex, 1)[0];
      await writeReservations(reservations);
      return res.status(200).json({ success: true, data: deleted });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // List all reservations
  if (req.method === 'GET') {
    const reservations = await readReservations();
    const events = await readEvents();
    const { eventId, status } = req.query;

    let filtered = reservations;
    if (eventId) filtered = filtered.filter(r => r.eventId === parseInt(eventId as string));
    if (status) filtered = filtered.filter(r => r.status === status);

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

  // Create new reservation
  if (req.method === 'POST') {
    const reservations = await readReservations();
    const { eventId: eId, name, email, phone, tickets, notes } = req.body || {};

    if (!eId || !name || !email || !tickets) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const newReservation: Reservation = {
      id: reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1,
      eventId: parseInt(eId),
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
