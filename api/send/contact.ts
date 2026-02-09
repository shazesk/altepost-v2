import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { sendEmail } from './_lib/resend.js';
import { generateRequestId, log } from './_lib/logger.js';
import { contactNotification, contactConfirmation } from './_lib/templates.js';
import { readContacts, writeContacts, Contact } from '../admin/_lib/data.js';

const ADMIN_EMAIL = 'shahzad.esc@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  log(requestId, 'Contact request received', { method: req.method, hasBody: !!req.body, bodyKeys: req.body ? Object.keys(req.body) : [] });

  if (cors(req, res)) {
    log(requestId, 'CORS preflight handled');
    return;
  }

  if (req.method !== 'POST') {
    log(requestId, 'Method not allowed', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }

  try {
    const { name, email, phone, subject, message, formType } = req.body || {};

    log(requestId, 'Validating fields', { name: !!name, email: !!email, subject: !!subject, message: !!message, formType });

    if (!name || !email || !subject || !message || !formType) {
      log(requestId, 'Validation failed - missing fields');
      return res.status(400).json({ error: 'Missing required fields', requestId });
    }

    // Store contact submission
    log(requestId, 'Storing contact submission');
    const contacts = await readContacts();
    const newContact: Contact = {
      id: contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1,
      name,
      email,
      phone: phone || '',
      subject,
      message,
      formType,
      status: 'active',
      createdAt: new Date().toISOString(),
      notes: ''
    };
    contacts.push(newContact);
    await writeContacts(contacts);
    log(requestId, 'Contact stored', { contactId: newContact.id });

    // Send emails
    log(requestId, 'Sending notification + confirmation emails');
    await Promise.all([
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `Neue Kontaktanfrage: ${subject} – ${name}`,
        html: contactNotification({ name, email, phone, subject, message, formType }),
        replyTo: email,
        requestId,
      }),
      sendEmail({
        to: email,
        subject: 'Ihre Kontaktanfrage – Alte Post Brensbach',
        html: contactConfirmation({ name, subject }),
        requestId,
      }),
    ]);

    log(requestId, 'Contact handler completed successfully');
    return res.status(200).json({ success: true, requestId });
  } catch (error: any) {
    log(requestId, 'Contact handler ERROR', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, error: error.message, requestId });
  }
}
