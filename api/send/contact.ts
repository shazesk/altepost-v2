import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { sendEmail } from './_lib/resend.js';
import { generateRequestId, log } from './_lib/logger.js';
import { contactNotification, contactConfirmation, voucherNotification, voucherConfirmation, membershipNotification, membershipConfirmation, ticketNotification, ticketConfirmation } from './_lib/templates.js';
import { readContacts, writeContacts, Contact, readVouchers, writeVouchers, VoucherOrder, readNewsletterSubscribers, writeNewsletterSubscribers, readMemberships, writeMemberships, MembershipApplication, readReservations, writeReservations, readEvents, Reservation } from '../admin/_lib/data.js';

const ADMIN_EMAIL = 'shahzad.esc@gmail.com';

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

  await Promise.all([
    sendEmail({
      to: ADMIN_EMAIL,
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

  await Promise.all([
    sendEmail({
      to: ADMIN_EMAIL,
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

  await Promise.all([
    sendEmail({
      to: ADMIN_EMAIL,
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

  let resolvedEventId = eventId ? parseInt(eventId) : 0;
  if (!resolvedEventId) {
    const events = await readEvents();
    const event = events.find(e => e.title === eventTitle);
    resolvedEventId = event?.id || 0;
  }

  const reservations = await readReservations();
  const newReservation: Reservation = {
    id: reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1,
    eventId: resolvedEventId, eventTitle: eventTitle || '',
    name, email, phone,
    tickets: parseInt(ticketCount), status: 'active',
    notes: message || '', createdAt: new Date().toISOString(),
  };
  reservations.push(newReservation);
  await writeReservations(reservations);

  if (newsletterOptIn && email) {
    await subscribeToNewsletter(requestId, email, name, 'ticket-reservation');
  }

  await Promise.all([
    sendEmail({
      to: ADMIN_EMAIL,
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
