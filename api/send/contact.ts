import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { sendEmail } from './_lib/resend.js';
import { contactNotification, contactConfirmation } from './_lib/templates.js';
import { readContacts, writeContacts, Contact } from '../admin/_lib/data.js';

const ADMIN_EMAIL = 'shahzad.esc@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, phone, subject, message, formType } = req.body || {};

    if (!name || !email || !subject || !message || !formType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store contact submission
    const contacts = await readContacts();
    const newContact: Contact = {
      id: contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1,
      name,
      email,
      phone: phone || '',
      subject,
      message,
      formType,
      status: 'new',
      createdAt: new Date().toISOString(),
      notes: ''
    };
    contacts.push(newContact);
    await writeContacts(contacts);

    // Send emails
    await Promise.all([
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `Neue Kontaktanfrage: ${subject} – ${name}`,
        html: contactNotification({ name, email, phone, subject, message, formType }),
        replyTo: email,
      }),
      sendEmail({
        to: email,
        subject: 'Ihre Kontaktanfrage – Alte Post Brensbach',
        html: contactConfirmation({ name, subject }),
      }),
    ]);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
