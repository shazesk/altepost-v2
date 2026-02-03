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
    // Version check endpoint
    if (req.query.version === '1') {
      return res.status(200).json({ success: true, version: 'v2-delete-fix', timestamp: new Date().toISOString() });
    }

    const events = await readEvents();
    const archived = req.query.archived === '1';
    const filteredEvents = events.filter(e => e.is_archived === archived);
    filteredEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return res.status(200).json({ success: true, data: filteredEvents });
  }

  if (req.method === 'POST') {
    const { action } = req.query;
    const body = req.body || {};

    // Handle toggle-archive action
    if (action === 'toggle-archive') {
      const id = body.id || req.query.id;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Missing event ID' });
      }
      const eventId = parseInt(String(id));
      if (isNaN(eventId)) {
        return res.status(400).json({ success: false, error: 'Invalid event ID' });
      }

      const events = await readEvents();
      const eventIndex = events.findIndex(e => e.id === eventId);

      if (eventIndex === -1) {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }

      events[eventIndex].is_archived = !events[eventIndex].is_archived;
      await writeEvents(events);
      return res.status(200).json({ success: true, data: events[eventIndex] });
    }

    // Create new event
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
      image: body.image || null,
      is_archived: body.is_archived === 'true' || body.is_archived === true
    };

    events.push(newEvent);
    await writeEvents(events);

    return res.status(200).json({ success: true, data: newEvent });
  }

  // Handle DELETE - check body first, then query params
  if (req.method === 'DELETE') {
    console.log('DELETE request received');
    console.log('Query:', JSON.stringify(req.query));
    console.log('Body:', JSON.stringify(req.body));

    // Get id from body or query params
    const id = req.body?.id || req.query.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing event ID', query: req.query, body: req.body });
    }

    const eventId = parseInt(String(id));
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, error: 'Invalid event ID' });
    }

    const events = await readEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const deletedEvent = events.splice(eventIndex, 1)[0];
    await writeEvents(events);

    return res.status(200).json({ success: true, data: deletedEvent });
  }

  // Handle PUT - check body.id first, then query params
  if (req.method === 'PUT') {
    const body = req.body || {};
    const id = body.id || req.query.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing event ID' });
    }

    const eventId = parseInt(String(id));
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, error: 'Invalid event ID' });
    }

    const events = await readEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

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
      image: body.image !== undefined ? body.image : events[eventIndex].image,
      is_archived: body.is_archived !== undefined ? (body.is_archived === 'true' || body.is_archived === true) : events[eventIndex].is_archived
    };

    if (body.date) {
      updatedEvent.month = getMonthYear(body.date);
    }

    events[eventIndex] = updatedEvent;
    await writeEvents(events);

    return res.status(200).json({ success: true, data: updatedEvent });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
