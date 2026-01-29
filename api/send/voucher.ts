import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { sendEmail } from './_lib/resend.js';
import { voucherNotification, voucherConfirmation } from './_lib/templates.js';
import { readVouchers, writeVouchers, VoucherOrder } from '../admin/_lib/data.js';

const ADMIN_EMAIL = 'shahzad.esc@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { voucherType, amount, customAmount, eventName, buyerName, buyerEmail, buyerPhone, recipientName, recipientEmail, message, delivery } = req.body || {};

    if (!buyerName || !buyerEmail || !buyerPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalAmount = voucherType === 'amount' ? (amount === 'custom' ? customAmount : amount) : null;

    // Store voucher order
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
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: ''
    };
    vouchers.push(newVoucher);
    await writeVouchers(vouchers);

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
    await Promise.all([
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `Neue Gutschein-Bestellung: ${voucherDetails} – ${buyerName}`,
        html: voucherNotification({ buyerName, buyerEmail, buyerPhone, voucherDetails, voucherValue, delivery, recipientName, recipientEmail, message }),
        replyTo: buyerEmail,
      }),
      sendEmail({
        to: buyerEmail,
        subject: 'Ihre Gutschein-Bestellung – Alte Post Brensbach',
        html: voucherConfirmation({ buyerName, voucherDetails, voucherValue }),
      }),
    ]);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
