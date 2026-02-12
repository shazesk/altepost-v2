import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { sendEmail } from './_lib/resend.js';
import { generateRequestId, log } from './_lib/logger.js';
import { ticketNotification, ticketConfirmation } from './_lib/templates.js';
import { readReservations, writeReservations, readEvents, Reservation, readNewsletterSubscribers, writeNewsletterSubscribers } from '../admin/_lib/data.js';

const ADMIN_EMAIL = 'shahzad.esc@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  log(requestId, 'Ticket reservation request received', { method: req.method, hasBody: !!req.body, bodyKeys: req.body ? Object.keys(req.body) : [] });

  if (cors(req, res)) {
    log(requestId, 'CORS preflight handled');
    return;
  }

  if (req.method !== 'POST') {
    log(requestId, 'Method not allowed', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }

  try {
    const { name, email, phone, message, ticketCount, eventTitle, eventArtist, eventDate, eventTime, eventPrice, totalPrice, eventId, newsletterOptIn } = req.body || {};

    log(requestId, 'Validating fields', { name: !!name, email: !!email, phone: !!phone, ticketCount, eventTitle, eventId });

    if (!name || !email || !phone || !ticketCount || !eventTitle) {
      log(requestId, 'Validation failed - missing fields');
      return res.status(400).json({ error: 'Missing required fields', requestId });
    }

    // Resolve eventId - parse to number for consistent storage
    let resolvedEventId = eventId ? parseInt(eventId) : 0;
    if (!resolvedEventId) {
      log(requestId, 'Resolving eventId from title/date', { eventTitle, eventDate });
      const events = await readEvents();
      const event = events.find(e => e.title === eventTitle);
      resolvedEventId = event?.id || 0;
      log(requestId, 'Resolved eventId', { resolvedEventId });
    }

    // Save reservation to database
    log(requestId, 'Storing reservation');
    const reservations = await readReservations();
    const newReservation: Reservation = {
      id: reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1,
      eventId: resolvedEventId,
      eventTitle: eventTitle || '',
      name,
      email,
      phone,
      tickets: parseInt(ticketCount),
      status: 'active',
      notes: message || '',
      createdAt: new Date().toISOString(),
    };
    reservations.push(newReservation);
    await writeReservations(reservations);
    log(requestId, 'Reservation stored', { reservationId: newReservation.id, eventId: resolvedEventId });

    // Newsletter subscription (server-side, before emails so it always runs)
    if (newsletterOptIn && email) {
      try {
        const subscribers = await readNewsletterSubscribers();
        const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
        if (!existing) {
          subscribers.push({
            id: subscribers.length > 0 ? Math.max(...subscribers.map(s => s.id)) + 1 : 1,
            email, name: name || '', source: 'ticket-reservation',
            subscribedAt: new Date().toISOString(), status: 'active'
          });
          await writeNewsletterSubscribers(subscribers);
          log(requestId, 'Newsletter subscription saved');
        } else if (existing.status === 'unsubscribed') {
          existing.status = 'active';
          existing.subscribedAt = new Date().toISOString();
          await writeNewsletterSubscribers(subscribers);
          log(requestId, 'Newsletter re-subscription saved');
        }
      } catch (e) { log(requestId, 'Newsletter subscription error', { error: (e as Error).message }); }
    }

    // Send emails
    log(requestId, 'Sending notification + confirmation emails');
    const [venueResult, confirmResult] = await Promise.all([
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `Ticketreservierung: ${eventTitle} – ${ticketCount}x – ${name}`,
        html: ticketNotification({ name, email, phone, message, ticketCount, eventTitle, eventArtist, eventDate, eventTime, eventPrice, totalPrice }),
        replyTo: email,
        requestId,
      }),
      sendEmail({
        to: email,
        subject: `Ihre Ticketreservierung – ${eventTitle}`,
        html: ticketConfirmation({ name, ticketCount, eventTitle, eventDate, eventTime, totalPrice }),
        requestId,
      }),
    ]);

    log(requestId, 'Ticket reservation handler completed successfully', { reservationId: newReservation.id, emailIds: [venueResult?.id, confirmResult?.id] });
    return res.status(200).json({ success: true, reservationId: newReservation.id, requestId, ids: [venueResult?.id, confirmResult?.id] });
  } catch (error: any) {
    log(requestId, 'Ticket reservation handler ERROR', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, error: error.message, requestId });
  }
}
