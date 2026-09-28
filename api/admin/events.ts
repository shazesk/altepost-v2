import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list, del } from '@vercel/blob';
import { cors } from '../_lib/cors.js';
import { validateSession } from '../_lib/auth.js';
import { readEvents, writeEvents, readReservations, writeReservations, readSettings, Event } from '../_lib/data.js';
import { SITE_URL } from '../_lib/send.js';
import { berlinWallClockToDate, presaleEndDate } from '../_lib/berlin-time.js';

const BUILD_VERSION = 'v7-pretix-no-drift';
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

async function pretixFetch(path: string, options: RequestInit = {}, requestId?: string): Promise<any> {
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
  if (!res.ok) {
    // A 404 on PATCH is the normal "event does not exist yet" path, so only the
    // body of a real failure is worth keeping.
    if (requestId && res.status !== 404) {
      const body = await res.text().catch(() => '');
      log(requestId, 'Pretix API call failed', {
        path,
        method: options.method || 'GET',
        status: res.status,
        body: body.slice(0, 500),
      });
    }
    return null;
  }
  return res.json();
}

// The venue shown on the Pretix shop. Read from site settings so it is corrected
// in one place rather than hardcoded here, where it had drifted from the Impressum.
async function venueAddress(): Promise<string> {
  try {
    const settings = await readSettings();
    const name = settings?.organization?.name || 'KleinKunstKneipe Alte Post';
    const { street, postalCode, city } = settings?.address || ({} as any);
    const parts = [name, street, [postalCode, city].filter(Boolean).join(' ')].filter(Boolean);
    if (parts.length > 1) return parts.join(', ');
  } catch {
    /* fall through */
  }
  return 'KleinKunstKneipe Alte Post, 64395 Brensbach';
}

/**
 * Language, contact address and imprint link are event *settings* in Pretix, not
 * fields on the event itself — passing them in the event payload is silently
 * ignored. Without them a new shop renders in English and Pretix refuses to
 * publish it at all ("public contact address" and "imprint link" required).
 */
async function applyPretixEventSettings(slug: string, requestId: string): Promise<void> {
  const settings = await readSettings().catch(() => null);
  const contactMail = settings?.contact?.emailTickets || settings?.contact?.emailGeneral;
  const payload: Record<string, any> = {
    locales: ['de'],
    locale: 'de',
    imprint_url: `${SITE_URL}/impressum`,
  };
  if (contactMail) payload.contact_mail = contactMail;

  const res = await pretixFetch(`/events/${slug}/settings/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, requestId);
  log(requestId, res ? 'Pretix event settings applied' : 'Pretix event settings FAILED', { slug });
}

// A Pretix event kept offline as the blueprint for every new shop. Payment methods
// (bank account), ticket layout and checkout questions cannot be set through the
// API, so they are configured once on this event in Pretix and copied on create.
const PRETIX_TEMPLATE_SLUG = 'vorlage';

// Checkout asks for e-mail and phone once per order; tickets are not personalised.
// Sent apart from the language settings so an unknown key cannot block those.
async function applyPretixCheckoutSettings(slug: string, requestId: string): Promise<void> {
  const res = await pretixFetch(`/events/${slug}/settings/`, {
    method: 'PATCH',
    body: JSON.stringify({
      order_phone_asked: true,
      order_phone_required: true,
      attendee_names_asked: false,
      attendee_names_required: false,
    }),
  }, requestId);
  log(requestId, res ? 'Pretix checkout settings applied' : 'Pretix checkout settings FAILED', { slug });
}

// The CMS status is the master: an active event sells, an inactive one does not.
// Kept out of the main PATCH because Pretix rejects going live while the shop is
// incomplete (e.g. no payment method), which must not block the date/name update.
async function setPretixLive(slug: string, live: boolean, requestId: string): Promise<boolean> {
  const res = await pretixFetch(`/events/${slug}/`, {
    method: 'PATCH',
    body: JSON.stringify({ live }),
  }, requestId);
  log(requestId, res ? 'Pretix shop status set' : 'Pretix shop status FAILED', { slug, live });
  return !!res;
}

// Whether the shop should sell: only public programme events that are active and
// not archived. Everything else is closed so it cannot sell unseen.
function shouldSell(event: Event): boolean {
  return event.active !== false && !event.is_archived && event.eventType !== 'private';
}

// Keep price and capacity in Pretix equal to the CMS, on create and on every edit.
// Only the ticket types this sync creates are touched: "Eintrittskarte" / "Eintritt
// frei" carry the CMS price and the legacy "Ermäßigt" half of it; anything an
// editor added by hand in Pretix is left alone.
async function syncPretixProducts(slug: string, event: Event, requestId: string): Promise<boolean> {
  let ok = true;
  const price = event.price || 0;
  const items = await pretixFetch(`/events/${slug}/items/`, {}, requestId);
  if (!items) return false;
  for (const item of items.results || []) {
    const name = item.name?.de || item.name?.en || '';
    let target: number | null = null;
    if (name === 'Eintrittskarte' || name === 'Eintritt frei') target = price;
    else if (name === 'Ermäßigt') target = Math.ceil(price / 2);
    if (target === null || Number(item.default_price) === target) continue;
    const res = await pretixFetch(`/events/${slug}/items/${item.id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ default_price: target.toFixed(2) }),
    }, requestId);
    if (!res) ok = false;
  }
  if (event.maxTickets != null) {
    const quotas = await pretixFetch(`/events/${slug}/quotas/`, {}, requestId);
    if (!quotas) return false;
    for (const quota of quotas.results || []) {
      if (quota.size === event.maxTickets) continue;
      const res = await pretixFetch(`/events/${slug}/quotas/${quota.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ size: event.maxTickets }),
      }, requestId);
      if (!res) ok = false;
    }
  }
  return ok;
}

// Fallback when the template event is missing: products and quota built by hand.
// The shop then has no payment method until one is set up in Pretix.
async function createPretixProducts(slug: string, event: Event, requestId: string): Promise<void> {
  const price = event.price || 0;
  const item = await pretixFetch(`/events/${slug}/items/`, {
    method: 'POST',
    body: JSON.stringify({
      name: { de: price > 0 ? 'Eintrittskarte' : 'Eintritt frei' },
      default_price: price.toFixed(2),
      admission: true,
      active: true,
    }),
  }, requestId);
  if (item?.id) {
    await pretixFetch(`/events/${slug}/quotas/`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Kapazität', size: event.maxTickets || 30, items: [item.id] }),
    }, requestId);
  }
}

interface PretixSyncResult {
  slug: string | null;
  // false when Pretix did not take every change; the editor is told so.
  ok: boolean;
}

async function syncEventToPretix(event: Event, requestId: string): Promise<PretixSyncResult> {
  const token = process.env.PRETIX_API_TOKEN;
  if (!token) {
    log(requestId, 'Pretix sync skipped - no API token');
    return { slug: event.pretixSlug || null, ok: true };
  }

  // Private events are never sold online. One that used to be public keeps its
  // Pretix event, so its shop is closed rather than left selling.
  if (event.eventType === 'private') {
    if (!event.pretixSlug) return { slug: null, ok: true };
    const ok = await setPretixLive(event.pretixSlug, false, requestId);
    return { slug: event.pretixSlug, ok };
  }

  const slug = event.pretixSlug || generateSlug(event.title, event.date);
  const dateObj = berlinWallClockToDate(event.date, event.time);
  const endDate = new Date(dateObj.getTime() + 3 * 60 * 60 * 1000); // +3 hours

  const eventPayload = {
    name: { de: event.artist ? `${event.title} – ${event.artist}` : event.title },
    slug,
    currency: 'EUR',
    date_from: dateObj.toISOString(),
    date_to: endDate.toISOString(),
    date_admission: event.admissionTime
      ? berlinWallClockToDate(event.date, event.admissionTime).toISOString()
      : null,
    presale_end: presaleEndDate(event).toISOString(),
    is_public: shouldSell(event),
    location: { de: await venueAddress() },
    geo_lat: '49.7741',
    geo_lon: '8.8789',
    timezone: 'Europe/Berlin',
  };

  try {
    // Update first. Only a 404 means "not in Pretix yet"; any other failure must not
    // fall through to creating a second event under the same name.
    const patch = await fetch(`${PRETIX_API}/events/${slug}/`, {
      method: 'PATCH',
      headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });
    let pretixEvent: any = null;
    if (patch.ok) {
      pretixEvent = await patch.json();
      log(requestId, 'Pretix event updated', { slug });
    } else if (patch.status !== 404) {
      const body = await patch.text().catch(() => '');
      log(requestId, 'Pretix event update FAILED', { slug, status: patch.status, body: body.slice(0, 500) });
      return { slug: event.pretixSlug || null, ok: false };
    } else {
      // Create as a copy of the template so payment, tickets and checkout
      // questions come along. Always created offline; setPretixLive below decides.
      pretixEvent = await pretixFetch(`/events/${PRETIX_TEMPLATE_SLUG}/clone/`, {
        method: 'POST',
        body: JSON.stringify({ ...eventPayload, live: false }),
      }, requestId);

      if (pretixEvent?.slug) {
        log(requestId, 'Pretix event created from template', { slug: pretixEvent.slug });
      } else {
        log(requestId, 'Pretix template copy failed, creating a bare event', { template: PRETIX_TEMPLATE_SLUG });
        pretixEvent = await pretixFetch('/events/', {
          method: 'POST',
          body: JSON.stringify({ ...eventPayload, live: false }),
        }, requestId);
        if (pretixEvent?.slug) {
          log(requestId, 'Pretix event created', { slug: pretixEvent.slug });
          await createPretixProducts(pretixEvent.slug, event, requestId);
        }
      }
    }

    // Only claim a slug once Pretix has confirmed the event exists. Returning the
    // locally generated slug on a failed create used to leave the event pointing
    // at a shop that was never created, which rendered a dead ticket widget.
    if (!pretixEvent?.slug) {
      log(requestId, 'Pretix sync did not confirm an event; slug not stored', { slug });
      return { slug: event.pretixSlug || null, ok: false };
    }

    const productsOk = await syncPretixProducts(pretixEvent.slug, event, requestId);
    await applyPretixEventSettings(pretixEvent.slug, requestId);
    await applyPretixCheckoutSettings(pretixEvent.slug, requestId);
    const liveOk = await setPretixLive(pretixEvent.slug, shouldSell(event), requestId);
    return { slug: pretixEvent.slug, ok: productsOk && liveOk };
  } catch (err: any) {
    log(requestId, 'Pretix sync error', { error: err.message });
    return { slug: event.pretixSlug || null, ok: false };
  }
}

// Deleting an event used to leave its reservations pointing at a missing id, which
// showed up in the admin as "Unbekannt". Keep the records — they are customer data —
// but stamp the title so they stay readable and move them out of the active list.
async function detachReservationsFromEvent(event: Event, requestId: string): Promise<number> {
  try {
    const reservations = await readReservations();
    let touched = 0;
    for (const r of reservations) {
      if (r.eventId !== event.id) continue;
      if (!r.eventTitle) r.eventTitle = event.title;
      r.status = 'archived';
      touched++;
    }
    if (touched > 0) await writeReservations(reservations);
    log(requestId, 'Reservations detached from deleted event', { eventId: event.id, count: touched });
    return touched;
  } catch (err: any) {
    log(requestId, 'Reservation detach failed', { eventId: event.id, error: err.message });
    return 0;
  }
}

async function deletePretixEvent(slug: string, requestId: string): Promise<void> {
  const token = process.env.PRETIX_API_TOKEN;
  if (!token || !slug) return;
  try {
    // Pretix refuses to delete an event that has orders. Close the shop first so
    // such an event at least stops selling once it is gone from the website.
    await setPretixLive(slug, false, requestId);
    const res = await fetch(`${PRETIX_API}/events/${slug}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Token ${token}` },
    });
    log(requestId, res.ok ? 'Pretix event deleted' : 'Pretix event kept (has orders?), shop closed', { slug, status: res.status });
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

    // Media library: everything uploaded through the CMS, newest first.
    if (req.query.action === 'list-images') {
      try {
        const blobs: { url: string; pathname: string; size: number; uploadedAt: string }[] = [];
        let cursor: string | undefined;
        do {
          const page = await list({ cursor, limit: 1000 });
          for (const b of page.blobs) {
            blobs.push({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: new Date(b.uploadedAt).toISOString() });
          }
          cursor = page.hasMore ? page.cursor : undefined;
        } while (cursor);
        blobs.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
        return res.status(200).json({ success: true, data: blobs, requestId });
      } catch (err: any) {
        log(requestId, 'List images failed', { error: err.message });
        return res.status(500).json({ success: false, error: 'List failed: ' + err.message, requestId });
      }
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

      await detachReservationsFromEvent(deletedEvent, requestId);

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

      // An archived event is gone from the website, so its shop must stop too.
      const archivedEvent = events[eventIndex];
      if (archivedEvent.pretixSlug && process.env.PRETIX_API_TOKEN && archivedEvent.eventType !== 'private') {
        await setPretixLive(archivedEvent.pretixSlug, shouldSell(archivedEvent), requestId);
      }

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

    // Remove an uploaded image from the media library. Only files in this store can
    // be deleted; images shipped with the website are part of the code.
    if (action === 'delete-image') {
      const url = String(body.url || '');
      if (!/^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i.test(url)) {
        return res.status(400).json({ success: false, error: 'Nur hochgeladene Bilder können gelöscht werden', requestId });
      }
      try {
        await del(url);
        log(requestId, 'Delete image success', { url });
        return res.status(200).json({ success: true, requestId });
      } catch (err: any) {
        log(requestId, 'Delete image failed', { error: err.message });
        return res.status(500).json({ success: false, error: 'Delete failed: ' + err.message, requestId });
      }
    }

    // Handle upload-image action (Vercel Blob)
    if (action === 'upload-image') {
      const { base64, filename } = body;
      // Folder keeps the media library readable; unknown values fall back to events/.
      const folder = ['events', 'sponsors', 'gallery', 'site'].includes(body.folder) ? body.folder : 'events';
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
        const blobFilename = `${folder}/${Date.now()}-${filename.replace(/\.[^.]+$/, '')}.${ext}`;

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
      ...(body.admissionTime ? { admissionTime: body.admissionTime } : {}),
      ...(body.presaleEnd ? { presaleEnd: body.presaleEnd } : {}),
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
    const sync = await syncEventToPretix(newEvent, requestId);
    if (sync.slug) newEvent.pretixSlug = sync.slug;

    events.push(newEvent);
    await writeEvents(events);

    log(requestId, 'Create event success', { eventId: newEvent.id, pretixSlug: sync.slug, pretixSyncOk: sync.ok });
    return res.status(200).json({ success: true, data: newEvent, pretixSyncOk: sync.ok, requestId });
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
      // An emptied field arrives as '' and must clear the stored value.
      admissionTime: body.admissionTime !== undefined ? (body.admissionTime || undefined) : events[eventIndex].admissionTime,
      presaleEnd: body.presaleEnd !== undefined ? (body.presaleEnd || undefined) : events[eventIndex].presaleEnd,
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
    const sync = await syncEventToPretix(updatedEvent, requestId);
    if (sync.slug) updatedEvent.pretixSlug = sync.slug;

    events[eventIndex] = updatedEvent;
    await writeEvents(events);

    log(requestId, 'PUT success', { eventId, pretixSlug: sync.slug, pretixSyncOk: sync.ok });
    return res.status(200).json({ success: true, data: updatedEvent, pretixSyncOk: sync.ok, requestId });
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

    await detachReservationsFromEvent(deletedEvent, requestId);

    if (deletedEvent.pretixSlug) await deletePretixEvent(deletedEvent.pretixSlug, requestId);

    log(requestId, 'DELETE success', { eventId });
    return res.status(200).json({ success: true, data: deletedEvent, requestId });
  }

  log(requestId, 'Method not allowed', { method: req.method });
  return res.status(405).json({ success: false, error: 'Method not allowed', requestId });
}
