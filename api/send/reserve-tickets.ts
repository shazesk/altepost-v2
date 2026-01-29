import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { sendEmail } from './_lib/resend.js';
import { ticketNotification, ticketConfirmation } from './_lib/templates.js';
import { readReservations, writeReservations, readEvents, Reservation } from '../admin/_lib/data.js';

const ADMIN_EMAIL = 'shahzad.esc@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, phone, message, ticketCount, eventTitle, eventArtist, eventDate, eventTime, eventPrice, totalPrice, eventId } = req.body || {};

    if (!name || !email || !phone || !ticketCount || !eventTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find eventId if not provided
    let resolvedEventId = eventId;
    if (!resolvedEventId) {
      const events = await readEvents();
      const event = events.find(e => e.title === eventTitle && e.date === eventDate);
      resolvedEventId = event?.id || 0;
    }

    // Save reservation to database
    const reservations = await readReservations();
    const newReservation: Reservation = {
      id: reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1,
      eventId: resolvedEventId,
      name,
      email,
      phone,
      tickets: parseInt(ticketCount),
      status: 'pending',
      notes: message || '',
      createdAt: new Date().toISOString(),
    };
    reservations.push(newReservation);
    await writeReservations(reservations);

    // Send emails
    const [venueResult, confirmResult] = await Promise.all([
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `Ticketreservierung: ${eventTitle} – ${ticketCount}x – ${name}`,
        html: ticketNotification({ name, email, phone, message, ticketCount, eventTitle, eventArtist, eventDate, eventTime, eventPrice, totalPrice }),
        replyTo: email,
      }),
      sendEmail({
        to: email,
        subject: `Ihre Ticketreservierung – ${eventTitle}`,
        html: ticketConfirmation({ name, ticketCount, eventTitle, eventDate, eventTime, totalPrice }),
      }),
    ]);

    return res.status(200).json({ success: true, reservationId: newReservation.id, ids: [venueResult?.id, confirmResult?.id] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
