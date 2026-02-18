import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { sendEmail } from './_lib/resend.js';
import { generateRequestId, log } from './_lib/logger.js';
import { infoPostEmail } from './_lib/templates.js';
import { validateSession } from '../admin/_lib/auth.js';
import {
  readNewsletterIssues,
  writeNewsletterIssues,
  readNewsletterSubscribers,
  readEvents,
  Event
} from '../admin/_lib/data.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  log(requestId, 'Newsletter issue send request', { method: req.method });

  if (cors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }

  // Require admin auth
  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId || !validateSession(sessionId)) {
    return res.status(401).json({ success: false, error: 'Not authenticated', requestId });
  }

  try {
    const { issueId, testEmail } = req.body || {};

    if (!issueId) {
      return res.status(400).json({ error: 'Missing issueId', requestId });
    }

    const issues = await readNewsletterIssues();
    const issue = issues.find(i => i.id === issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found', requestId });
    }

    // Load selected events
    const allEvents = await readEvents();
    const selectedEvents = issue.selectedEventIds.length > 0
      ? allEvents.filter(e => issue.selectedEventIds.includes(e.id))
      : [];

    const html = infoPostEmail({
      title: issue.title,
      introText: issue.introText,
      events: selectedEvents
    });

    if (testEmail) {
      // Send test email to single address
      log(requestId, 'Sending test newsletter issue', { to: testEmail, issueId });
      await sendEmail({
        to: testEmail,
        subject: `[TEST] Info-Post: ${issue.title}`,
        html,
        requestId,
      });
      log(requestId, 'Test newsletter issue sent');
      return res.status(200).json({ success: true, message: 'Test email sent', requestId });
    }

    // Send to all active subscribers
    const subscribers = await readNewsletterSubscribers();
    const activeSubscribers = subscribers.filter(s => s.status === 'active');

    if (activeSubscribers.length === 0) {
      return res.status(400).json({ error: 'No active subscribers', requestId });
    }

    log(requestId, 'Sending newsletter issue to all subscribers', {
      issueId,
      subscriberCount: activeSubscribers.length
    });

    // Send in batches of 10 to avoid rate limits
    const batchSize = 10;
    let sent = 0;
    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batch = activeSubscribers.slice(i, i + batchSize);
      await Promise.all(
        batch.map(sub =>
          sendEmail({
            to: sub.email,
            subject: `Info-Post: ${issue.title}`,
            html,
            requestId,
          }).catch(err => {
            log(requestId, 'Failed to send to subscriber', { email: sub.email, error: err.message });
          })
        )
      );
      sent += batch.length;
    }

    // Mark issue as sent
    const issueIndex = issues.findIndex(i => i.id === issueId);
    issues[issueIndex].status = 'sent';
    issues[issueIndex].sentAt = new Date().toISOString();
    await writeNewsletterIssues(issues);

    log(requestId, 'Newsletter issue sent to all', { sent, total: activeSubscribers.length });
    return res.status(200).json({
      success: true,
      message: `Sent to ${activeSubscribers.length} subscribers`,
      sent: activeSubscribers.length,
      requestId
    });
  } catch (error: any) {
    log(requestId, 'Newsletter issue send ERROR', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, error: error.message, requestId });
  }
}
