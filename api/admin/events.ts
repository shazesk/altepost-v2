import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { validateSession } from './_lib/auth.js';
import { readEvents, writeEvents, Event } from './_lib/data.js';

function getMonthYear(dateStr: string): string {
  const monthNames: Record<string, string> = {
    '01': 'Januar', '02': 'Februar', '03': 'März', '04': 'April',
    '05': 'Mai', '06': 'Juni', '07': 'Juli', '08': 'August',
    '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Dezember'
  };
  const date = new Date(dateStr);
  const month = monthNames[String(date.getMonth() + 1).padStart(2, '0')];
  const year = date.getFullYear();
  return `${month} ${year}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;

  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId || !validateSession(sessionId)) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  if (req.method === 'GET') {
    const events = await readEvents();
    const archived = req.query.archived === '1';
    const filteredEvents = events.filter(e => e.is_archived === archived);
    filteredEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return res.status(200).json({ success: true, data: filteredEvents });
  }

  if (req.method === 'POST') {
    const events = await readEvents();
    const body = req.body || {};

    const newEvent: Event = {
      id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
      title: body.title,
      artist: body.artist,
      date: body.date,
      time: body.time,
      price: parseFloat(body.price) || 0,
      genre: body.genre,
      month: getMonthYear(body.date),
      availability: body.availability || 'available',
      description: body.description || '',
      image: null,
      is_archived: body.is_archived === 'true' || body.is_archived === true
    };

    events.push(newEvent);
    await writeEvents(events);

    return res.status(200).json({ success: true, data: newEvent });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
