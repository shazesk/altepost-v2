import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { cors } from './_lib/cors.js';
import { sendEmail } from './_lib/resend.js';
import { generateRequestId, log } from './_lib/logger.js';
import { infoPostEmail } from './_lib/templates.js';
import { validateSession } from '../admin/_lib/auth.js';
import {
  readNewsletterIssues,
  writeNewsletterIssues,
  readNewsletterSubscribers,
  writeNewsletterSubscribers,
  readMemberships,
  readEvents,
} from '../admin/_lib/data.js';

const BASE_URL = 'https://friedrichholdings.de';

function ensureUnsubscribeToken(subscriber: { unsubscribeToken?: string }): string {
  if (subscriber.unsubscribeToken) return subscriber.unsubscribeToken;
  const token = crypto.randomBytes(24).toString('hex');
  subscriber.unsubscribeToken = token;
  return token;
}

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
    const { issueId, testEmail, action } = req.body || {};

    // Count recipients without sending
    if (action === 'count') {
      const issues = await readNewsletterIssues();
      const issue = issues.find(i => i.id === issueId);
      if (!issue) return res.status(404).json({ error: 'Issue not found', requestId });

      const count = await getRecipientCount(issue.audience || 'newsletter');
      return res.status(200).json({ success: true, count, requestId });
    }

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

    if (testEmail) {
      // Send test email to single address
      log(requestId, 'Sending test newsletter issue', { to: testEmail, issueId });
      const html = infoPostEmail({
        title: issue.title,
        introText: issue.introText,
        events: selectedEvents,
      });
      await sendEmail({
        to: testEmail,
        subject: `[TEST] Info-Post: ${issue.title}`,
        html,
        requestId,
      });
      log(requestId, 'Test newsletter issue sent');
      return res.status(200).json({ success: true, message: 'Test-E-Mail gesendet', requestId });
    }

    // Send to recipients based on audience
    const audience = issue.audience || 'newsletter';
    const recipients = await getRecipients(audience);

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'Keine Empfänger gefunden', requestId });
    }

    log(requestId, 'Sending newsletter issue', {
      issueId,
      audience,
      recipientCount: recipients.length
    });

    // Ensure all newsletter subscribers have unsubscribe tokens
    const subscribers = await readNewsletterSubscribers();
    let tokensUpdated = false;
    for (const sub of subscribers) {
      if (!sub.unsubscribeToken) {
        ensureUnsubscribeToken(sub);
        tokensUpdated = true;
      }
    }
    if (tokensUpdated) {
      await writeNewsletterSubscribers(subscribers);
    }

    // Build a map of email -> unsubscribe token
    const tokenMap = new Map<string, string>();
    for (const sub of subscribers) {
      if (sub.unsubscribeToken) {
        tokenMap.set(sub.email.toLowerCase(), sub.unsubscribeToken);
      }
    }

    // Send in batches of 10
    const batchSize = 10;
    let sent = 0;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      await Promise.all(
        batch.map(email => {
          const token = tokenMap.get(email.toLowerCase());
          const unsubscribeUrl = token
            ? `${BASE_URL}/api/admin/data?type=newsletter-unsubscribe&token=${token}`
            : undefined;
          const html = infoPostEmail({
            title: issue.title,
            introText: issue.introText,
            events: selectedEvents,
            unsubscribeUrl,
          });
          return sendEmail({
            to: email,
            subject: `Info-Post: ${issue.title}`,
            html,
            requestId,
          }).catch(err => {
            log(requestId, 'Failed to send to recipient', { email, error: err.message });
          });
        })
      );
      sent += batch.length;
    }

    // Mark issue as sent
    const issueIndex = issues.findIndex(i => i.id === issueId);
    issues[issueIndex].status = 'sent';
    issues[issueIndex].sentAt = new Date().toISOString();
    issues[issueIndex].recipientCount = recipients.length;
    await writeNewsletterIssues(issues);

    log(requestId, 'Newsletter issue sent', { sent, total: recipients.length });
    return res.status(200).json({
      success: true,
      message: `An ${recipients.length} Empfänger gesendet`,
      sent: recipients.length,
      requestId
    });
  } catch (error: any) {
    log(requestId, 'Newsletter issue send ERROR', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, error: error.message, requestId });
  }
}

async function getRecipientCount(audience: string): Promise<number> {
  return (await getRecipients(audience)).length;
}

async function getRecipients(audience: string): Promise<string[]> {
  const emails = new Set<string>();

  if (audience === 'newsletter' || audience === 'both') {
    const subscribers = await readNewsletterSubscribers();
    for (const s of subscribers) {
      if (s.status === 'active') emails.add(s.email.toLowerCase());
    }
  }

  if (audience === 'members' || audience === 'both') {
    const memberships = await readMemberships();
    for (const m of memberships) {
      if (m.status === 'active' && m.email) emails.add(m.email.toLowerCase());
    }
  }

  return Array.from(emails);
}
