import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from './_lib/cors.js';
import { validateSession } from './_lib/auth.js';
import { readEvents, writeEvents, Event } from './_lib/data.js';

const BUILD_VERSION = 'v3-post-delete';

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function log(requestId: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${requestId}] ${message}`, data ? JSON.stringify(data) : '');
}

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
  const requestId = generateRequestId();

  log(requestId, 'Request received', {
    method: req.method,
    url: req.url,
    query: req.query,
    hasBody: !!req.body,
    bodyKeys: req.body ? Object.keys(req.body) : [],
    hasSessionHeader: !!req.headers['x-session-id']
  });

  if (cors(req, res)) {
    log(requestId, 'CORS preflight handled');
    return;
  }

  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId || !validateSession(sessionId)) {
    log(requestId, 'Auth failed', { hasSessionId: !!sessionId });
    return res.status(401).json({ success: false, error: 'Not authenticated', requestId });
  }

  log(requestId, 'Auth passed');

  // GET requests
  if (req.method === 'GET') {
    // Version check endpoint (no auth required for this check)
    if (req.query.version === '1') {
      const response = { success: true, version: BUILD_VERSION, timestamp: new Date().toISOString(), requestId };
      log(requestId, 'Version check', response);
      return res.status(200).json(response);
    }

    const events = await readEvents();
    const archived = req.query.archived === '1';
    const filteredEvents = events.filter(e => e.is_archived === archived);
    filteredEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    log(requestId, 'GET events', { archived, count: filteredEvents.length });
    return res.status(200).json({ success: true, data: filteredEvents, requestId });
  }

  // POST requests
  if (req.method === 'POST') {
    const { action } = req.query;
    const body = req.body || {};

    log(requestId, 'POST request', { action, bodyId: body.id, bodyKeys: Object.keys(body) });

    // Handle delete action
    if (action === 'delete') {
      const id = body.id;
      log(requestId, 'Delete action', { id, idType: typeof id });

      if (!id) {
        const response = { success: false, error: 'Missing event ID', requestId, receivedBody: body };
        log(requestId, 'Delete failed - no ID', response);
        return res.status(400).json(response);
      }

      const eventId = parseInt(String(id));
      if (isNaN(eventId)) {
        const response = { success: false, error: 'Invalid event ID', requestId };
        log(requestId, 'Delete failed - invalid ID', response);
        return res.status(400).json(response);
      }

      const events = await readEvents();
      const eventIndex = events.findIndex(e => e.id === eventId);

      if (eventIndex === -1) {
        const response = { success: false, error: 'Event not found', requestId, eventId };
        log(requestId, 'Delete failed - not found', response);
        return res.status(404).json(response);
      }

      const deletedEvent = events.splice(eventIndex, 1)[0];
      await writeEvents(events);

      const response = { success: true, data: deletedEvent, requestId };
      log(requestId, 'Delete success', { eventId, title: deletedEvent.title });
      return res.status(200).json(response);
    }

    // Handle toggle-archive action
    if (action === 'toggle-archive') {
      const id = body.id;
      log(requestId, 'Toggle archive action', { id });

      if (!id) {
        const response = { success: false, error: 'Missing event ID', requestId };
        log(requestId, 'Toggle archive failed - no ID', response);
        return res.status(400).json(response);
      }

      const eventId = parseInt(String(id));
      if (isNaN(eventId)) {
        return res.status(400).json({ success: false, error: 'Invalid event ID', requestId });
      }

      const events = await readEvents();
      const eventIndex = events.findIndex(e => e.id === eventId);

      if (eventIndex === -1) {
        return res.status(404).json({ success: false, error: 'Event not found', requestId });
      }

      events[eventIndex].is_archived = !events[eventIndex].is_archived;
      await writeEvents(events);

      log(requestId, 'Toggle archive success', { eventId, isArchived: events[eventIndex].is_archived });
      return res.status(200).json({ success: true, data: events[eventIndex], requestId });
    }

    // Create new event (no action specified)
    log(requestId, 'Create event', { title: body.title });

    const events = await readEvents();
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

    log(requestId, 'Create event success', { eventId: newEvent.id });
    return res.status(200).json({ success: true, data: newEvent, requestId });
  }

  // PUT requests
  if (req.method === 'PUT') {
    const body = req.body || {};
    const id = body.id;

    log(requestId, 'PUT request', { id, bodyKeys: Object.keys(body) });

    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing event ID', requestId });
    }

    const eventId = parseInt(String(id));
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, error: 'Invalid event ID', requestId });
    }

    const events = await readEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return res.status(404).json({ success: false, error: 'Event not found', requestId });
    }

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

    log(requestId, 'PUT success', { eventId });
    return res.status(200).json({ success: true, data: updatedEvent, requestId });
  }

  // DELETE requests (fallback, but we prefer POST with action=delete)
  if (req.method === 'DELETE') {
    log(requestId, 'DELETE request (legacy)', { query: req.query, body: req.body });

    const id = req.body?.id || req.query.id;
    if (!id) {
      const response = { success: false, error: 'Missing event ID', requestId, query: req.query, body: req.body };
      log(requestId, 'DELETE failed - no ID', response);
      return res.status(400).json(response);
    }

    const eventId = parseInt(String(id));
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, error: 'Invalid event ID', requestId });
    }

    const events = await readEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return res.status(404).json({ success: false, error: 'Event not found', requestId });
    }

    const deletedEvent = events.splice(eventIndex, 1)[0];
    await writeEvents(events);

    log(requestId, 'DELETE success', { eventId });
    return res.status(200).json({ success: true, data: deletedEvent, requestId });
  }

  log(requestId, 'Method not allowed', { method: req.method });
  return res.status(405).json({ success: false, error: 'Method not allowed', requestId });
}
