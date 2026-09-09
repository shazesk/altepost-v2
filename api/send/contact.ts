import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../_lib/cors.js';
import { sendEmail, configureEmailFooter, generateRequestId, log, contactNotification, contactConfirmation, voucherNotification, voucherConfirmation, membershipNotification, membershipConfirmation, ticketNotification, ticketConfirmation } from '../_lib/send.js';
import { readContacts, writeContacts, Contact, readVouchers, writeVouchers, VoucherOrder, readNewsletterSubscribers, writeNewsletterSubscribers, readMemberships, writeMemberships, MembershipApplication, readReservations, writeReservations, readEvents, readSettings, Reservation } from '../_lib/data.js';

type InboxKey = 'general' | 'tickets' | 'artists' | 'sponsors';

// Where staff notifications land. Editable by the Verein under Einstellungen, with
// an env override for staging. Previously this was a hardcoded personal address.
async function inbox(key: InboxKey): Promise<string> {
  const override = process.env.ADMIN_NOTIFICATION_EMAIL;
  let contact: Record<string, string> | undefined;
  try {
    const settings = await readSettings();
    // Runs even when an override is set, so e-mail footers stay correct.
    configureEmailFooter(settings);
    contact = settings?.contact as Record<string, string> | undefined;
  } catch {
    /* fall through to the defaults below */
  }
  if (override) return override;
  const byKey: Record<InboxKey, string | undefined> = {
    general: contact?.emailGeneral,
    tickets: contact?.emailTickets,
    artists: contact?.emailArtists,
    sponsors: contact?.emailSponsors,
  };
  return byKey[key] || contact?.emailGeneral || 'info@alte-post-brensbach.de';
}

function subscribeToNewsletter(requestId: string, email: string, name: string, source: string) {
  return (async () => {
    try {
      const subscribers = await readNewsletterSubscribers();
      const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
      if (!existing) {
        subscribers.push({
          id: subscribers.length > 0 ? Math.max(...subscribers.map(s => s.id)) + 1 : 1,
          email, name: name || '', source,
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
  })();
}

async function handleContact(req: VercelRequest, res: VercelResponse, requestId: string) {
  const { name, email, phone, subject, message, formType, newsletterOptIn } = req.body || {};

  if (!name || !email || !subject || !message || !formType) {
    return res.status(400).json({ error: 'Missing required fields', requestId });
  }

  const contacts = await readContacts();
  const newContact: Contact = {
    id: contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1,
    name, email, phone: phone || '', subject, message, formType,
    newsletterOptIn: !!newsletterOptIn, status: 'active',
    createdAt: new Date().toISOString(), notes: ''
  };
  contacts.push(newContact);
  await writeContacts(contacts);

  if (newsletterOptIn && email) {
    await subscribeToNewsletter(requestId, email, name, `contact-${formType}`);
  }

  const recipient = await inbox(
    formType === 'artist' ? 'artists' : formType === 'sponsor' ? 'sponsors' : 'general'
  );

  await Promise.all([
    sendEmail({
      to: recipient,
      subject: `Neue Kontaktanfrage: ${subject} – ${name}`,
      html: contactNotification({ name, email, phone, subject, message, formType }),
      replyTo: email, requestId,
    }),
    sendEmail({
      to: email,
      subject: 'Ihre Kontaktanfrage – Alte Post Brensbach',
      html: contactConfirmation({ name, subject }),
      requestId,
    }),
  ]);

  return res.status(200).json({ success: true, requestId });
}

async function handleVoucher(req: VercelRequest, res: VercelResponse, requestId: string) {
  const { voucherType, amount, customAmount, eventName, buyerName, buyerEmail, buyerPhone, recipientName, recipientEmail, message, delivery, newsletterOptIn } = req.body || {};

  if (!buyerName || !buyerEmail || !buyerPhone) {
    return res.status(400).json({ error: 'Missing required fields', requestId });
  }

  const finalAmount = voucherType === 'amount' ? (amount === 'custom' ? customAmount : amount) : null;

  const vouchers = await readVouchers();
  const newVoucher: VoucherOrder = {
    id: vouchers.length > 0 ? Math.max(...vouchers.map(v => v.id)) + 1 : 1,
    voucherType, amount: finalAmount,
    eventName: voucherType === 'event' ? eventName : null,
    buyerName, buyerEmail, buyerPhone,
    recipientName: recipientName || '', recipientEmail: recipientEmail || '',
    message: message || '', delivery: delivery || 'email',
    status: 'active', createdAt: new Date().toISOString(), notes: ''
  };
  vouchers.push(newVoucher);
  await writeVouchers(vouchers);

  if (newsletterOptIn && buyerEmail) {
    await subscribeToNewsletter(requestId, buyerEmail, buyerName, 'voucher');
  }

  let voucherDetails: string;
  let voucherValue: string;
  if (voucherType === 'amount') {
    voucherDetails = `Wertgutschein über ${finalAmount}€`;
    voucherValue = `${finalAmount} EUR`;
  } else {
    voucherDetails = `Gutschein für Veranstaltung: ${eventName}`;
    voucherValue = 'Nach Veranstaltung';
  }

  const recipient = await inbox('general');

  await Promise.all([
    sendEmail({
      to: recipient,
      subject: `Neue Gutschein-Bestellung: ${voucherDetails} – ${buyerName}`,
      html: voucherNotification({ buyerName, buyerEmail, buyerPhone, voucherDetails, voucherValue, delivery, recipientName, recipientEmail, message }),
      replyTo: buyerEmail, requestId,
    }),
    sendEmail({
      to: buyerEmail,
      subject: 'Ihre Gutschein-Bestellung – Alte Post Brensbach',
      html: voucherConfirmation({ buyerName, voucherDetails, voucherValue }),
      requestId,
    }),
  ]);

  return res.status(200).json({ success: true, requestId });
}

async function handleMembership(req: VercelRequest, res: VercelResponse, requestId: string) {
  const { name, email, phone, birthdate, address, postalCode, city, membershipType, memberSince, iban, message, newsletterOptIn } = req.body || {};

  if (!name || !email || !birthdate || !address || !postalCode || !city || !membershipType) {
    return res.status(400).json({ error: 'Missing required fields', requestId });
  }

  const memberships = await readMemberships();
  const newMembership: MembershipApplication = {
    id: memberships.length > 0 ? Math.max(...memberships.map(m => m.id)) + 1 : 1,
    name, email, phone: phone || '', address, postalCode, city, membershipType,
    birthdate, memberSince: memberSince || '', iban: iban || '',
    ibanLast4: iban ? iban.replace(/\s/g, '').slice(-4) : '',
    message: message || '', status: 'active',
    createdAt: new Date().toISOString(), notes: ''
  };
  memberships.push(newMembership);
  await writeMemberships(memberships);

  if (newsletterOptIn && email) {
    await subscribeToNewsletter(requestId, email, name, 'membership');
  }

  const recipient = await inbox('general');

  await Promise.all([
    sendEmail({
      to: recipient,
      subject: `Neuer Mitgliedsantrag: ${membershipType} – ${name}`,
      html: membershipNotification({ name, email, phone, birthdate, address, postalCode, city, message, membershipType, memberSince, iban }),
      replyTo: email, requestId,
    }),
    sendEmail({
      to: email,
      subject: 'Ihr Mitgliedsantrag – Alte Post Brensbach',
      html: membershipConfirmation({ name, membershipType }),
      requestId,
    }),
  ]);

  return res.status(200).json({ success: true, requestId });
}

async function handleTicketReservation(req: VercelRequest, res: VercelResponse, requestId: string) {
  const { name, email, phone, message, ticketCount, eventTitle, eventArtist, eventDate, eventTime, eventPrice, totalPrice, eventId, newsletterOptIn } = req.body || {};

  if (!name || !email || !phone || !ticketCount || !eventTitle) {
    return res.status(400).json({ error: 'Missing required fields', requestId });
  }

  const events = await readEvents();
  let resolvedEventId = eventId ? parseInt(eventId) : 0;
  if (!resolvedEventId) {
    const event = events.find(e => e.title === eventTitle);
    resolvedEventId = event?.id || 0;
  }

  const reservations = await readReservations();

  // The public listing computes remaining seats, but nothing used to enforce them
  // on write, so a sold-out event could still be overbooked from a stale page.
  const requestedTickets = parseInt(ticketCount);
  if (!Number.isFinite(requestedTickets) || requestedTickets < 1) {
    return res.status(400).json({ error: 'Invalid ticket count', requestId });
  }
  const targetEvent = events.find(e => e.id === resolvedEventId);
  if (targetEvent?.maxTickets != null) {
    const booked = reservations
      .filter(r => r.eventId === targetEvent.id && r.status === 'active')
      .reduce((sum, r) => sum + r.tickets, 0);
    const remaining = Math.max(0, targetEvent.maxTickets - booked);
    if (requestedTickets > remaining) {
      log(requestId, 'Reservation rejected - not enough seats', {
        eventId: targetEvent.id, requested: requestedTickets, remaining,
      });
      return res.status(409).json({
        success: false,
        error: remaining === 0
          ? 'Diese Veranstaltung ist leider ausverkauft.'
          : `Es sind nur noch ${remaining} Plätze verfügbar.`,
        remainingTickets: remaining,
        requestId,
      });
    }
  }
  const newReservation: Reservation = {
    id: reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1,
    eventId: resolvedEventId, eventTitle: eventTitle || '',
    name, email, phone,
    tickets: requestedTickets, status: 'active',
    notes: message || '', createdAt: new Date().toISOString(),
    source: 'public',
  };
  reservations.push(newReservation);
  await writeReservations(reservations);

  if (newsletterOptIn && email) {
    await subscribeToNewsletter(requestId, email, name, 'ticket-reservation');
  }

  const recipient = await inbox('tickets');

  await Promise.all([
    sendEmail({
      to: recipient,
      subject: `Ticketreservierung: ${eventTitle} – ${ticketCount}x – ${name}`,
      html: ticketNotification({ name, email, phone, message, ticketCount, eventTitle, eventArtist, eventDate, eventTime, eventPrice, totalPrice }),
      replyTo: email, requestId,
    }),
    sendEmail({
      to: email,
      subject: `Ihre Ticketreservierung – ${eventTitle}`,
      html: ticketConfirmation({ name, ticketCount, eventTitle, eventDate, eventTime, totalPrice }),
      requestId,
    }),
  ]);

  return res.status(200).json({ success: true, reservationId: newReservation.id, requestId });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  if (cors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }

  const type = req.query.type as string;

  try {
    if (type === 'voucher') return await handleVoucher(req, res, requestId);
    if (type === 'membership') return await handleMembership(req, res, requestId);
    if (type === 'reserve-tickets') return await handleTicketReservation(req, res, requestId);
    return await handleContact(req, res, requestId);
  } catch (error: any) {
    log(requestId, 'Handler ERROR', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, error: error.message, requestId });
  }
}
