import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../_lib/cors.js';
import { validateSession } from '../_lib/auth.js';
import { readReservations, writeReservations, readEvents } from '../_lib/data.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;

  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId || !validateSession(sessionId)) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  // Parse slug: could be [id] or [id, 'status']
  const slug = req.query.slug as string[];
  if (!slug || slug.length === 0) {
    return res.status(400).json({ success: false, error: 'Missing reservation ID' });
  }

  const reservationId = parseInt(slug[0]);
  const action = slug[1]; // 'status' or undefined

  if (isNaN(reservationId)) {
    return res.status(400).json({ success: false, error: 'Invalid reservation ID' });
  }

  const reservations = await readReservations();
  const reservationIndex = reservations.findIndex(r => r.id === reservationId);

  if (reservationIndex === -1) {
    return res.status(404).json({ success: false, error: 'Reservation not found' });
  }

  // Handle status update action
  if (action === 'status') {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { status } = req.body || {};
    if (!status || !['active', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status. Must be: active or archived' });
    }

    reservations[reservationIndex].status = status;
    await writeReservations(reservations);

    return res.status(200).json({ success: true, data: reservations[reservationIndex] });
  }

  // Handle single reservation CRUD
  if (req.method === 'GET') {
    const events = await readEvents();
    const reservation = reservations[reservationIndex];
    const event = events.find(e => e.id === reservation.eventId);

    const enriched = {
      ...reservation,
      eventTitle: event ? event.title : (reservation.eventTitle || 'Unbekannt'),
      eventDate: event ? event.date : null,
      eventArtist: event ? event.artist : null
    };

    return res.status(200).json({ success: true, data: enriched });
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    const updatedReservation = {
      ...reservations[reservationIndex],
      name: body.name ?? reservations[reservationIndex].name,
      email: body.email ?? reservations[reservationIndex].email,
      phone: body.phone ?? reservations[reservationIndex].phone,
      tickets: body.tickets !== undefined ? parseInt(body.tickets) : reservations[reservationIndex].tickets,
      status: body.status ?? reservations[reservationIndex].status,
      notes: body.notes ?? reservations[reservationIndex].notes
    };

    reservations[reservationIndex] = updatedReservation;
    await writeReservations(reservations);

    return res.status(200).json({ success: true, data: updatedReservation });
  }

  if (req.method === 'DELETE') {
    const deletedReservation = reservations.splice(reservationIndex, 1)[0];
    await writeReservations(reservations);
    return res.status(200).json({ success: true, data: deletedReservation });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
