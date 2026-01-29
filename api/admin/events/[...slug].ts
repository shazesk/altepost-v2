import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../_lib/cors.js';
import { validateSession } from '../_lib/auth.js';
import { readEvents, writeEvents } from '../_lib/data.js';

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

  // Parse slug: could be [id] or [id, 'toggle-archive']
  const slug = req.query.slug as string[];
  if (!slug || slug.length === 0) {
    return res.status(400).json({ success: false, error: 'Missing event ID' });
  }

  const eventId = parseInt(slug[0]);
  const action = slug[1]; // 'toggle-archive' or undefined

  if (isNaN(eventId)) {
    return res.status(400).json({ success: false, error: 'Invalid event ID' });
  }

  const events = readEvents();
  const eventIndex = events.findIndex(e => e.id === eventId);

  if (eventIndex === -1) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  // Handle toggle-archive action
  if (action === 'toggle-archive') {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    events[eventIndex].is_archived = !events[eventIndex].is_archived;
    writeEvents(events);
    return res.status(200).json({ success: true, data: events[eventIndex] });
  }

  // Handle single event CRUD
  if (req.method === 'GET') {
    return res.status(200).json({ success: true, data: events[eventIndex] });
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    const updatedEvent = {
      ...events[eventIndex],
      title: body.title ?? events[eventIndex].title,
      artist: body.artist ?? events[eventIndex].artist,
      date: body.date ?? events[eventIndex].date,
      time: body.time ?? events[eventIndex].time,
      price: body.price !== undefined ? parseFloat(body.price) : events[eventIndex].price,
      genre: body.genre ?? events[eventIndex].genre,
      availability: body.availability ?? events[eventIndex].availability,
      description: body.description ?? events[eventIndex].description,
      is_archived: body.is_archived !== undefined ? (body.is_archived === 'true' || body.is_archived === true) : events[eventIndex].is_archived
    };

    if (body.date) {
      updatedEvent.month = getMonthYear(body.date);
    }

    events[eventIndex] = updatedEvent;
    writeEvents(events);

    return res.status(200).json({ success: true, data: updatedEvent });
  }

  if (req.method === 'DELETE') {
    const deletedEvent = events.splice(eventIndex, 1)[0];
    writeEvents(events);
    return res.status(200).json({ success: true, data: deletedEvent });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
