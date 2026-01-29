import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { sendEmail } from './_lib/resend.js';
import { membershipNotification, membershipConfirmation } from './_lib/templates.js';
import { readMemberships, writeMemberships, MembershipApplication } from '../admin/_lib/data.js';

const ADMIN_EMAIL = 'shahzad.esc@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, phone, address, postalCode, city, message, membershipType, membershipPrice } = req.body || {};

    if (!name || !email || !address || !postalCode || !city || !membershipType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store membership application
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
      membershipPrice: membershipPrice || '',
      message: message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: ''
    };
    memberships.push(newMembership);
    await writeMemberships(memberships);

    // Send emails
    await Promise.all([
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `Neuer Mitgliedsantrag: ${membershipType} – ${name}`,
        html: membershipNotification({ name, email, phone, address, postalCode, city, message, membershipType, membershipPrice }),
        replyTo: email,
      }),
      sendEmail({
        to: email,
        subject: 'Ihr Mitgliedsantrag – Alte Post Brensbach',
        html: membershipConfirmation({ name, membershipType, membershipPrice }),
      }),
    ]);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
