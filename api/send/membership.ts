import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { sendEmail } from './_lib/resend.js';
import { generateRequestId, log } from './_lib/logger.js';
import { membershipNotification, membershipConfirmation } from './_lib/templates.js';
import { readMemberships, writeMemberships, MembershipApplication, readNewsletterSubscribers, writeNewsletterSubscribers } from '../admin/_lib/data.js';

const ADMIN_EMAIL = 'shahzad.esc@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  log(requestId, 'Membership request received', { method: req.method, hasBody: !!req.body, bodyKeys: req.body ? Object.keys(req.body) : [] });

  if (cors(req, res)) {
    log(requestId, 'CORS preflight handled');
    return;
  }

  if (req.method !== 'POST') {
    log(requestId, 'Method not allowed', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }

  try {
    const { name, email, phone, birthdate, address, postalCode, city, membershipType, memberSince, iban, message, newsletterOptIn } = req.body || {};

    log(requestId, 'Validating fields', { name: !!name, email: !!email, birthdate: !!birthdate, address: !!address, postalCode: !!postalCode, city: !!city, membershipType });

    if (!name || !email || !birthdate || !address || !postalCode || !city || !membershipType) {
      log(requestId, 'Validation failed - missing fields');
      return res.status(400).json({ error: 'Missing required fields', requestId });
    }

    // Store membership application
    log(requestId, 'Storing membership application');
    const memberships = await readMemberships();
    const newMembership: MembershipApplication = {
      id: memberships.length > 0 ? Math.max(...memberships.map(m => m.id)) + 1 : 1,
      name,
      email,
      phone: phone || '',
      address,
      postalCode,
      city,
      membershipType,
      birthdate,
      memberSince: memberSince || '',
      iban: iban || '',
      ibanLast4: iban ? iban.replace(/\s/g, '').slice(-4) : '',
      message: message || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      notes: ''
    };
    memberships.push(newMembership);
    await writeMemberships(memberships);
    log(requestId, 'Membership stored', { membershipId: newMembership.id });

    // Newsletter subscription (server-side, before emails so it always runs)
    if (newsletterOptIn && email) {
      try {
        const subscribers = await readNewsletterSubscribers();
        const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
        if (!existing) {
          subscribers.push({
            id: subscribers.length > 0 ? Math.max(...subscribers.map(s => s.id)) + 1 : 1,
            email, name: name || '', source: 'membership',
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
    await Promise.all([
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `Neuer Mitgliedsantrag: ${membershipType} – ${name}`,
        html: membershipNotification({ name, email, phone, birthdate, address, postalCode, city, message, membershipType, memberSince, iban }),
        replyTo: email,
        requestId,
      }),
      sendEmail({
        to: email,
        subject: 'Ihr Mitgliedsantrag – Alte Post Brensbach',
        html: membershipConfirmation({ name, membershipType }),
        requestId,
      }),
    ]);

    log(requestId, 'Membership handler completed successfully');
    return res.status(200).json({ success: true, requestId });
  } catch (error: any) {
    log(requestId, 'Membership handler ERROR', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, error: error.message, requestId });
  }
}
