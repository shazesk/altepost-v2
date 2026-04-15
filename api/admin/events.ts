import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { cors } from '../_lib/cors.js';
import { validateSession } from '../_lib/auth.js';
import { readEvents, writeEvents, Event } from '../_lib/data.js';

const BUILD_VERSION = 'v4-pretix-sync';
const PRETIX_API = 'https://pretix.eu/api/v1/organizers/kleinkunstkneipe';

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

function generateSlug(title: string, date: string): string {
  const year = new Date(date).getFullYear();
  const slug = title
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae').replace(/[öÖ]/g, 'oe').replace(/[üÜ]/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);
  return `${slug}-${year}`;
}

async function pretixFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = process.env.PRETIX_API_TOKEN;
  if (!token) return null;

  const res = await fetch(`${PRETIX_API}${path}`, {
    ...options,
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function syncEventToPretix(event: Event, requestId: string): Promise<string | null> {
  const token = process.env.PRETIX_API_TOKEN;
  if (!token) {
    log(requestId, 'Pretix sync skipped - no API token');
    return event.pretixSlug || null;
  }

  // Only sync program events (not private)
  if (event.eventType === 'private') return event.pretixSlug || null;

  const slug = event.pretixSlug || generateSlug(event.title, event.date);
  const dateObj = new Date(event.date);
  const timeParts = (event.time || '20:00').split(':');
  dateObj.setHours(parseInt(timeParts[0]), parseInt(timeParts[1] || '0'));

  const endDate = new Date(dateObj.getTime() + 3 * 60 * 60 * 1000); // +3 hours
  const admissionDate = new Date(dateObj.getTime() - 90 * 60 * 1000); // -1.5 hours before

  const eventPayload = {
    name: { de: event.artist ? `${event.title} – ${event.artist}` : event.title },
    slug,
    live: false,
    currency: 'EUR',
    date_from: dateObj.toISOString(),
    date_to: endDate.toISOString(),
    date_admission: admissionDate.toISOString(),
    is_public: event.active !== false,
    location: { de: 'KleinKunstKneipe Alte Post, Hauptstraße 15, 64395 Brensbach' },
    geo_lat: '49.7741',
    geo_lon: '8.8789',
    timezone: 'Europe/Berlin',
  };

  try {
    // Try to update existing event first
    let pretixEvent = await pretixFetch(`/events/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(eventPayload),
    });

    if (!pretixEvent) {
      // Create new event
      pretixEvent = await pretixFetch('/events/', {
        method: 'POST',
        body: JSON.stringify(eventPayload),
      });

      if (pretixEvent && pretixEvent.slug) {
        log(requestId, 'Pretix event created', { slug: pretixEvent.slug });

        // Create ticket items
        const price = event.price || 0;
        if (price > 0) {
          // Paid event: regular + reduced ticket
          const item1 = await pretixFetch(`/events/${slug}/items/`, {
            method: 'POST',
            body: JSON.stringify({ name: { de: 'Eintrittskarte' }, default_price: price.toFixed(2), admission: true, active: true }),
          });
          const reducedPrice = Math.ceil(price / 2);
          const item2 = await pretixFetch(`/events/${slug}/items/`, {
            method: 'POST',
            body: JSON.stringify({ name: { de: 'Ermäßigt' }, default_price: reducedPrice.toFixed(2), admission: true, active: true }),
          });
          const itemIds = [item1?.id, item2?.id].filter(Boolean);
          if (itemIds.length > 0) {
            await pretixFetch(`/events/${slug}/quotas/`, {
              method: 'POST',
              body: JSON.stringify({ name: 'Kapazität', size: event.maxTickets || 80, items: itemIds }),
            });
          }
        } else {
          // Free event
          const item = await pretixFetch(`/events/${slug}/items/`, {
            method: 'POST',
            body: JSON.stringify({ name: { de: 'Eintritt frei' }, default_price: '0.00', admission: true, active: true }),
          });
          if (item?.id) {
            await pretixFetch(`/events/${slug}/quotas/`, {
              method: 'POST',
              body: JSON.stringify({ name: 'Kapazität', size: event.maxTickets || 150, items: [item.id] }),
            });
          }
        }
      }
    } else {
      log(requestId, 'Pretix event updated', { slug });
    }

    return pretixEvent?.slug || slug;
  } catch (err: any) {
    log(requestId, 'Pretix sync error', { error: err.message });
    return event.pretixSlug || null;
  }
}

async function deletePretixEvent(slug: string, requestId: string): Promise<void> {
  const token = process.env.PRETIX_API_TOKEN;
  if (!token || !slug) return;
  try {
    await fetch(`${PRETIX_API}/events/${slug}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Token ${token}` },
    });
    log(requestId, 'Pretix event deleted', { slug });
  } catch (err: any) {
    log(requestId, 'Pretix delete error', { error: err.message });
  }
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

      // Delete from Pretix
      if (deletedEvent.pretixSlug) await deletePretixEvent(deletedEvent.pretixSlug, requestId);

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

    // Handle update-photos action
    if (action === 'update-photos') {
      const id = body.id;
      log(requestId, 'Update photos action', { id, photoCount: body.photos?.length });

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

      events[eventIndex].photos = Array.isArray(body.photos) ? body.photos : [];
      await writeEvents(events);

      log(requestId, 'Update photos success', { eventId, photoCount: events[eventIndex].photos?.length });
      return res.status(200).json({ success: true, data: events[eventIndex], requestId });
    }

    // Handle upload-image action (Vercel Blob)
    if (action === 'upload-image') {
      const { base64, filename } = body;
      log(requestId, 'Upload image action', { filename, hasBase64: !!base64 });

      if (!base64 || !filename) {
        return res.status(400).json({ success: false, error: 'Missing base64 or filename', requestId });
      }

      try {
        // Convert base64 data URI to Buffer
        const matches = base64.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
          return res.status(400).json({ success: false, error: 'Invalid base64 data URI', requestId });
        }

        const buffer = Buffer.from(matches[2], 'base64');
        const contentType = matches[1];
        const ext = contentType.split('/')[1] || 'jpg';
        const blobFilename = `events/${Date.now()}-${filename.replace(/\.[^.]+$/, '')}.${ext}`;

        const blob = await put(blobFilename, buffer, {
          access: 'public',
          contentType,
        });

        log(requestId, 'Upload image success', { url: blob.url });
        return res.status(200).json({ success: true, url: blob.url, requestId });
      } catch (err: any) {
        log(requestId, 'Upload image failed', { error: err.message });
        return res.status(500).json({ success: false, error: 'Upload failed: ' + err.message, requestId });
      }
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
      is_archived: body.is_archived === 'true' || body.is_archived === true,
      photos: Array.isArray(body.photos) ? body.photos : [],
      ...(body.maxTickets != null ? { maxTickets: Number(body.maxTickets) } : {}),
      active: body.active !== undefined ? body.active : false,
      eventType: body.eventType || 'program',
      ...(body.extraSection1Title ? { extraSection1Title: body.extraSection1Title } : {}),
      ...(body.extraSection1Content ? { extraSection1Content: body.extraSection1Content } : {}),
      ...(body.extraSection2Title ? { extraSection2Title: body.extraSection2Title } : {}),
      ...(body.extraSection2Content ? { extraSection2Content: body.extraSection2Content } : {}),
      ...(body.pretixSlug ? { pretixSlug: body.pretixSlug } : {})
    };

    // Sync to Pretix (non-blocking — if it fails, event is still saved locally)
    const pretixSlug = await syncEventToPretix(newEvent, requestId);
    if (pretixSlug) newEvent.pretixSlug = pretixSlug;

    events.push(newEvent);
    await writeEvents(events);

    log(requestId, 'Create event success', { eventId: newEvent.id, pretixSlug });
    return res.status(200).json({ success: true, data: newEvent, requestId });
  }

  // PUT requests
  if (req.method === 'PUT') {
    const body = req.body || {};

    // Bulk replace all events if body is an array
    if (Array.isArray(body)) {
      await writeEvents(body as Event[]);
      log(requestId, 'Bulk replace events', { count: body.length });
      return res.status(200).json({ success: true, data: body, requestId });
    }

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
      is_archived: body.is_archived !== undefined ? (body.is_archived === 'true' || body.is_archived === true) : events[eventIndex].is_archived,
      photos: Array.isArray(body.photos) ? body.photos : events[eventIndex].photos || [],
      maxTickets: body.maxTickets !== undefined ? Number(body.maxTickets) : events[eventIndex].maxTickets,
      active: body.active !== undefined ? body.active : events[eventIndex].active,
      eventType: body.eventType !== undefined ? body.eventType : events[eventIndex].eventType,
      extraSection1Title: body.extraSection1Title !== undefined ? body.extraSection1Title : events[eventIndex].extraSection1Title,
      extraSection1Content: body.extraSection1Content !== undefined ? body.extraSection1Content : events[eventIndex].extraSection1Content,
      extraSection2Title: body.extraSection2Title !== undefined ? body.extraSection2Title : events[eventIndex].extraSection2Title,
      extraSection2Content: body.extraSection2Content !== undefined ? body.extraSection2Content : events[eventIndex].extraSection2Content,
      pretixSlug: body.pretixSlug !== undefined ? body.pretixSlug : events[eventIndex].pretixSlug
    };

    if (body.date) {
      updatedEvent.month = getMonthYear(body.date);
    }

    // Sync to Pretix
    const pretixSlug = await syncEventToPretix(updatedEvent, requestId);
    if (pretixSlug) updatedEvent.pretixSlug = pretixSlug;

    events[eventIndex] = updatedEvent;
    await writeEvents(events);

    log(requestId, 'PUT success', { eventId, pretixSlug });
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

    if (deletedEvent.pretixSlug) await deletePretixEvent(deletedEvent.pretixSlug, requestId);

    log(requestId, 'DELETE success', { eventId });
    return res.status(200).json({ success: true, data: deletedEvent, requestId });
  }

  log(requestId, 'Method not allowed', { method: req.method });
  return res.status(405).json({ success: false, error: 'Method not allowed', requestId });
}
