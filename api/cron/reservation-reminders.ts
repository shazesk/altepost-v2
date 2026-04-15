import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readEvents, readReservations, writeReservations, readSettings } from '../_lib/data.js';
import { sendEmail, generateRequestId, log, reservationPaymentReminder } from '../_lib/send.js';

const REMINDER_AFTER_DAYS = 7;

function formatEventDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();

  // Vercel Cron auth — when CRON_SECRET is set in env, Vercel attaches it as Authorization header
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers['authorization'];
    if (auth !== `Bearer ${cronSecret}`) {
      log(requestId, 'cron unauthorized');
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  }

  log(requestId, 'cron: reservation-reminders started');

  const reservations = await readReservations();
  const events = await readEvents();
  const settings = await readSettings();
  const bank = settings.bank || { iban: 'DE00 0000 0000 0000 0000 00' } as any;

  const now = Date.now();
  const cutoff = REMINDER_AFTER_DAYS * 24 * 60 * 60 * 1000;

  const candidates = reservations.filter(r => {
    if (r.paymentStatus !== 'pending') return false;
    if (r.status === 'archived') return false;
    if (r.reminderSentAt) return false; // only send once
    const ageMs = now - new Date(r.createdAt).getTime();
    return ageMs >= cutoff;
  });

  log(requestId, 'cron: candidates found', { count: candidates.length });

  const results: Array<{ id: number; email: string; success: boolean; error?: string }> = [];
  let mutated = false;

  for (const r of candidates) {
    try {
      const event = events.find(e => e.id === r.eventId);
      const html = reservationPaymentReminder({
        name: r.name,
        eventTitle: event?.title || r.eventTitle || 'Veranstaltung',
        eventDate: formatEventDate(event?.date),
        totalPrice: String(r.totalPrice ?? ''),
        paymentReference: r.paymentReference || `RES-${r.id}`,
        iban: bank.iban,
      });
      await sendEmail({
        to: r.email,
        subject: 'Erinnerung: Ihre Reservierung wartet auf Zahlung',
        html,
        requestId,
      });
      r.reminderSentAt = new Date().toISOString();
      mutated = true;
      results.push({ id: r.id, email: r.email, success: true });
      log(requestId, 'cron: reminder sent', { id: r.id, email: r.email });
    } catch (e: any) {
      results.push({ id: r.id, email: r.email, success: false, error: e.message });
      log(requestId, 'cron: reminder FAILED', { id: r.id, error: e.message });
    }
  }

  if (mutated) {
    await writeReservations(reservations);
  }

  log(requestId, 'cron: reservation-reminders done', { sent: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length });
  return res.status(200).json({ success: true, processed: results.length, results });
}
