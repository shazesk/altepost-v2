import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readNewsletterSubscribers, writeNewsletterSubscribers } from '../admin/_lib/data.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.query.token as string;

  if (!token) {
    return res.status(400).send(page('Ungültiger Link', 'Der Abmelde-Link ist ungültig.'));
  }

  const subscribers = await readNewsletterSubscribers();
  const subscriber = subscribers.find(s => s.unsubscribeToken === token);

  if (!subscriber) {
    return res.status(404).send(page('Nicht gefunden', 'Der Abmelde-Link ist ungültig oder wurde bereits verwendet.'));
  }

  if (subscriber.status === 'unsubscribed') {
    return res.status(200).send(page('Bereits abgemeldet', 'Sie wurden bereits vom Newsletter abgemeldet.'));
  }

  subscriber.status = 'unsubscribed';
  await writeNewsletterSubscribers(subscribers);

  return res.status(200).send(page(
    'Erfolgreich abgemeldet',
    'Sie wurden vom Newsletter der Alten Post Brensbach abgemeldet und erhalten keine weiteren Info-Post-Mails.'
  ));
}

function page(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title} – Alte Post Brensbach</title>
  <style>
    body { margin:0; padding:40px 20px; background:#faf9f7; font-family:'Inter',Arial,sans-serif; color:#2d2d2d; }
    .card { max-width:500px; margin:0 auto; background:#fff; border-radius:8px; padding:40px; text-align:center; border:1px solid rgba(107,142,111,0.2); }
    h1 { font-family:'Playfair Display',Georgia,serif; font-size:24px; margin:0 0 16px; color:#2d2d2d; }
    p { color:#666; line-height:1.6; margin:0 0 24px; }
    a { color:#6b8e6f; text-decoration:underline; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://friedrichholdings.de">Zurück zur Webseite</a>
  </div>
</body>
</html>`;
}
