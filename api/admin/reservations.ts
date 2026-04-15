import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../_lib/cors.js';
import { validateSession } from '../_lib/auth.js';
import { readEvents, readReservations, writeReservations, readSettings, Reservation } from '../_lib/data.js';
import { sendEmail, generateRequestId, log, reservationPaymentRequest, reservationPaymentConfirmed, reservationPaymentReminder } from '../_lib/send.js';

function pad2(n: number): string { return n < 10 ? `0${n}` : `${n}`; }

function generatePaymentReference(existing: Reservation[]): string {
  const now = new Date();
  const dd = pad2(now.getDate());
  const mm = pad2(now.getMonth() + 1);
  const yy = pad2(now.getFullYear() % 100);
  const prefix = `${dd}${mm}${yy}`;
  const todays = existing
    .map(r => r.paymentReference || '')
    .filter(ref => ref.startsWith(`${prefix}-`))
    .map(ref => parseInt(ref.split('-')[1] || '0', 10))
    .filter(n => !isNaN(n));
  const next = todays.length > 0 ? Math.max(...todays) + 1 : 1;
  return `${prefix}-${next}`;
}

function formatEventDate(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

function buildQrUrl(reference: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(reference)}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;

  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId || !validateSession(sessionId)) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const { id, action } = req.query;
  const requestId = generateRequestId();

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

    const reservation = reservations[reservationIndex];

    // Mark as paid: POST ?id=X&action=markPaid
    if (action === 'markPaid' && req.method === 'POST') {
      if (reservation.paymentStatus === 'paid') {
        return res.status(400).json({ success: false, error: 'Reservation already paid' });
      }
      reservation.paymentStatus = 'paid';
      reservation.paidAt = new Date().toISOString();
      await writeReservations(reservations);

      // Send payment-confirmed email
      try {
        const events = await readEvents();
        const event = events.find(e => e.id === reservation.eventId);
        const html = reservationPaymentConfirmed({
          name: reservation.name,
          eventTitle: event?.title || reservation.eventTitle || 'Veranstaltung',
          eventDate: formatEventDate(event?.date),
          eventTime: event?.time || '',
          ticketCount: String(reservation.tickets),
          paymentReference: reservation.paymentReference || `RES-${reservation.id}`,
          qrUrl: buildQrUrl(reservation.paymentReference || `RES-${reservation.id}`),
        });
        await sendEmail({
          to: reservation.email,
          subject: 'Ihre Zahlung ist eingegangen – Ticket bestätigt',
          html,
          requestId,
        });
        log(requestId, 'payment-confirmed email sent', { reservationId, to: reservation.email });
      } catch (e: any) {
        log(requestId, 'payment-confirmed email FAILED', { error: e.message });
      }

      return res.status(200).json({ success: true, data: reservation });
    }

    // Send manual reminder: POST ?id=X&action=sendReminder
    if (action === 'sendReminder' && req.method === 'POST') {
      if (reservation.paymentStatus === 'paid') {
        return res.status(400).json({ success: false, error: 'Reservation is already paid' });
      }
      try {
        const events = await readEvents();
        const event = events.find(e => e.id === reservation.eventId);
        const settings = await readSettings();
        const bank = settings.bank || { iban: 'DE00 0000 0000 0000 0000 00' } as any;
        const html = reservationPaymentReminder({
          name: reservation.name,
          eventTitle: event?.title || reservation.eventTitle || 'Veranstaltung',
          eventDate: formatEventDate(event?.date),
          totalPrice: String(reservation.totalPrice ?? ''),
          paymentReference: reservation.paymentReference || `RES-${reservation.id}`,
          iban: bank.iban,
        });
        await sendEmail({
          to: reservation.email,
          subject: 'Erinnerung: Ihre Reservierung wartet auf Zahlung',
          html,
          requestId,
        });
        reservation.reminderSentAt = new Date().toISOString();
        await writeReservations(reservations);
        log(requestId, 'reminder email sent', { reservationId, to: reservation.email });
        return res.status(200).json({ success: true, data: reservation });
      } catch (e: any) {
        log(requestId, 'reminder email FAILED', { error: e.message });
        return res.status(500).json({ success: false, error: e.message });
      }
    }

    // Status update: POST ?id=X&action=status
    if (action === 'status' && req.method === 'POST') {
      const { status } = req.body || {};
      if (!status || !['active', 'archived'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status. Must be: active or archived' });
      }
      reservation.status = status;
      await writeReservations(reservations);
      return res.status(200).json({ success: true, data: reservation });
    }

    if (req.method === 'GET') {
      const events = await readEvents();
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
        ...reservation,
        name: body.name ?? reservation.name,
        email: body.email ?? reservation.email,
        phone: body.phone ?? reservation.phone,
        tickets: body.tickets !== undefined ? parseInt(body.tickets) : reservation.tickets,
        status: body.status ?? reservation.status,
        notes: body.notes ?? reservation.notes
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
    const { eventId, status, paymentStatus } = req.query;

    let filtered = reservations;
    if (eventId) filtered = filtered.filter(r => r.eventId === parseInt(eventId as string));
    if (status) filtered = filtered.filter(r => r.status === status);
    if (paymentStatus) filtered = filtered.filter(r => r.paymentStatus === paymentStatus);

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
    const events = await readEvents();
    const { eventId: eId, name, email, phone, tickets, notes, source } = req.body || {};

    if (!eId || !name || !email || !tickets) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const event = events.find(e => e.id === parseInt(eId));
    const isAdminFlow = source === 'admin';
    const ticketsInt = parseInt(tickets);
    const totalPrice = event ? event.price * ticketsInt : 0;
    const paymentReference = isAdminFlow ? generatePaymentReference(reservations) : undefined;

    const newReservation: Reservation = {
      id: reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1,
      eventId: parseInt(eId),
      name,
      email,
      phone: phone || '',
      tickets: ticketsInt,
      status: 'active',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      source: isAdminFlow ? 'admin' : 'public',
      ...(isAdminFlow ? { paymentStatus: 'pending' as const, paymentReference, totalPrice } : {}),
    };

    reservations.push(newReservation);
    await writeReservations(reservations);

    // Send payment-request email for admin-created (phone-call) reservations
    if (isAdminFlow && event) {
      try {
        const settings = await readSettings();
        const bank = settings.bank || {
          accountHolder: 'KleinKunstKneipe Alte Post Brensbach e.V.',
          iban: 'DE00 0000 0000 0000 0000 00',
          bic: 'XXXXDEXXXXX',
          bankName: 'Sparkasse Odenwaldkreis',
        };
        const html = reservationPaymentRequest({
          name,
          eventTitle: event.title,
          eventDate: formatEventDate(event.date),
          eventTime: event.time,
          ticketCount: String(ticketsInt),
          totalPrice: String(totalPrice),
          paymentReference: paymentReference!,
          iban: bank.iban,
          bic: bank.bic,
          accountHolder: bank.accountHolder,
          bankName: bank.bankName,
        });
        await sendEmail({
          to: email,
          subject: `Ihre Reservierung – Zahlungsinformationen (${paymentReference})`,
          html,
          requestId,
        });
        log(requestId, 'payment-request email sent', { reservationId: newReservation.id, to: email, paymentReference });
      } catch (e: any) {
        log(requestId, 'payment-request email FAILED', { error: e.message });
      }
    }

    return res.status(200).json({ success: true, data: newReservation });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
