import { Resend } from 'resend';

// Use environment variable for API key (set in Vercel)
const resend = new Resend(process.env.RESEND_API_KEY);

// Use verified domain for FROM address (set in Vercel)
// Example: "Alte Post Brensbach <noreply@alte-post-brensbach.de>"
const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS || 'Alte Post Brensbach <onboarding@resend.dev>';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  const result = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  if (result.error) {
    throw new Error(`Resend error: ${result.error.message} (${result.error.name})`);
  }

  return result.data;
}
