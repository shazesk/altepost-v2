import { Resend } from 'resend';
import { log } from './logger.js';

// Use environment variable for API key (set in Vercel)
const resend = new Resend(process.env.RESEND_API_KEY);

// Use verified domain for FROM address (set in Vercel)
// Example: "Alte Post Brensbach <noreply@alte-post-brensbach.de>"
const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS || 'Alte Post Brensbach <noreply@friedrichholdings.de>';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  requestId?: string;
}

export async function sendEmail({ to, subject, html, replyTo, requestId }: SendEmailOptions) {
  const rid = requestId || 'no-rid';
  log(rid, 'Resend: sending email', { to, subject, replyTo: replyTo || null });

  const result = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  if (result.error) {
    log(rid, 'Resend: send FAILED', { error: result.error.message, name: result.error.name });
    throw new Error(`Resend error: ${result.error.message} (${result.error.name})`);
  }

  log(rid, 'Resend: send SUCCESS', { emailId: result.data?.id });
  return result.data;
}
