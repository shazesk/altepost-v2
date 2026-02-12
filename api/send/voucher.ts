import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { sendEmail } from './_lib/resend.js';
import { generateRequestId, log } from './_lib/logger.js';
import { voucherNotification, voucherConfirmation } from './_lib/templates.js';
import { readVouchers, writeVouchers, VoucherOrder, readNewsletterSubscribers, writeNewsletterSubscribers } from '../admin/_lib/data.js';

const ADMIN_EMAIL = 'shahzad.esc@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  log(requestId, 'Voucher request received', { method: req.method, hasBody: !!req.body, bodyKeys: req.body ? Object.keys(req.body) : [] });

  if (cors(req, res)) {
    log(requestId, 'CORS preflight handled');
    return;
  }

  if (req.method !== 'POST') {
    log(requestId, 'Method not allowed', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }

  try {
    const { voucherType, amount, customAmount, eventName, buyerName, buyerEmail, buyerPhone, recipientName, recipientEmail, message, delivery, newsletterOptIn } = req.body || {};

    log(requestId, 'Validating fields', { buyerName: !!buyerName, buyerEmail: !!buyerEmail, buyerPhone: !!buyerPhone, voucherType });

    if (!buyerName || !buyerEmail || !buyerPhone) {
      log(requestId, 'Validation failed - missing fields');
      return res.status(400).json({ error: 'Missing required fields', requestId });
    }

    const finalAmount = voucherType === 'amount' ? (amount === 'custom' ? customAmount : amount) : null;

    // Store voucher order
    log(requestId, 'Storing voucher order');
    const vouchers = await readVouchers();
    const newVoucher: VoucherOrder = {
      id: vouchers.length > 0 ? Math.max(...vouchers.map(v => v.id)) + 1 : 1,
      voucherType,
      amount: finalAmount,
      eventName: voucherType === 'event' ? eventName : null,
      buyerName,
      buyerEmail,
      buyerPhone,
      recipientName: recipientName || '',
      recipientEmail: recipientEmail || '',
      message: message || '',
      delivery: delivery || 'email',
      status: 'active',
      createdAt: new Date().toISOString(),
      notes: ''
    };
    vouchers.push(newVoucher);
    await writeVouchers(vouchers);
    log(requestId, 'Voucher stored', { voucherId: newVoucher.id });

    // Build email details
    let voucherDetails: string;
    let voucherValue: string;
    if (voucherType === 'amount') {
      voucherDetails = `Wertgutschein über ${finalAmount}€`;
      voucherValue = `${finalAmount} EUR`;
    } else {
      voucherDetails = `Gutschein für Veranstaltung: ${eventName}`;
      voucherValue = 'Nach Veranstaltung';
    }

    // Send emails
    log(requestId, 'Sending notification + confirmation emails');
    await Promise.all([
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `Neue Gutschein-Bestellung: ${voucherDetails} – ${buyerName}`,
        html: voucherNotification({ buyerName, buyerEmail, buyerPhone, voucherDetails, voucherValue, delivery, recipientName, recipientEmail, message }),
        replyTo: buyerEmail,
        requestId,
      }),
      sendEmail({
        to: buyerEmail,
        subject: 'Ihre Gutschein-Bestellung – Alte Post Brensbach',
        html: voucherConfirmation({ buyerName, voucherDetails, voucherValue }),
        requestId,
      }),
    ]);

    // Newsletter subscription (server-side)
    if (newsletterOptIn && buyerEmail) {
      try {
        const subscribers = await readNewsletterSubscribers();
        const existing = subscribers.find(s => s.email.toLowerCase() === buyerEmail.toLowerCase());
        if (!existing) {
          subscribers.push({
            id: subscribers.length > 0 ? Math.max(...subscribers.map(s => s.id)) + 1 : 1,
            email: buyerEmail, name: buyerName || '', source: 'voucher',
            subscribedAt: new Date().toISOString(), status: 'active'
          });
          await writeNewsletterSubscribers(subscribers);
        } else if (existing.status === 'unsubscribed') {
          existing.status = 'active';
          existing.subscribedAt = new Date().toISOString();
          await writeNewsletterSubscribers(subscribers);
        }
      } catch (e) { log(requestId, 'Newsletter subscription error', { error: (e as Error).message }); }
    }

    log(requestId, 'Voucher handler completed successfully');
    return res.status(200).json({ success: true, requestId });
  } catch (error: any) {
    log(requestId, 'Voucher handler ERROR', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, error: error.message, requestId });
  }
}
