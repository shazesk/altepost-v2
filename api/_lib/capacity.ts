import { readReservations, Event, Reservation } from './data.js';

// Seats are sold through two channels: Pretix (online) and the club's own
// reservations (phone, CMS, the website form). Each channel must know about the
// other, or the same seat is sold twice:
//   Pretix quota        = capacity − active club reservations
//   club reservations   ≤ capacity − active club reservations − Pretix sales
// The quota is re-sent whenever either side changes.

const PRETIX_API = 'https://pretix.eu/api/v1/organizers/kleinkunstkneipe';

async function pretix(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data: any }> {
  const token = process.env.PRETIX_API_TOKEN;
  if (!token) return { ok: false, status: 0, data: null };
  try {
    const res = await fetch(`${PRETIX_API}${path}`, {
      ...init,
      headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
    const data = res.ok ? await res.json().catch(() => null) : null;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

function sells(event: Event): boolean {
  return !!process.env.PRETIX_API_TOKEN && !!event.pretixSlug && event.eventType !== 'private';
}

// Tickets held by the club's own reservations. Archived ones are cancelled.
export function clubReservedTickets(reservations: Reservation[], eventId: number, excludeReservationId?: number): number {
  return reservations
    // Early records stored the event id as a string, hence Number().
    .filter(r => Number(r.eventId) === eventId && r.status === 'active' && r.id !== excludeReservationId)
    .reduce((sum, r) => sum + (Number(r.tickets) || 0), 0);
}

// Tickets Pretix has sold or is holding for an unpaid order. Carts are left out:
// they expire, and checkout fails for them once the quota is full.
// null when Pretix cannot be asked.
export async function pretixSoldTickets(event: Event): Promise<number | null> {
  if (!sells(event)) return 0;
  const quotas = await pretix(`/events/${event.pretixSlug}/quotas/`);
  if (!quotas.ok) return quotas.status === 403 || quotas.status === 404 ? 0 : null;
  let sold = 0;
  for (const quota of quotas.data?.results || []) {
    const a = await pretix(`/events/${event.pretixSlug}/quotas/${quota.id}/availability/`);
    if (!a.ok) return null;
    // Quotas of one event cover the same seats, so the largest one counts.
    sold = Math.max(sold, (a.data?.paid_orders || 0) + (a.data?.pending_orders || 0));
  }
  return sold;
}

export interface CapacityCheck {
  ok: boolean;
  remaining: number;
}

// Whether `requested` more club tickets fit. `excludeReservationId` leaves out the
// reservation being edited so its own seats are not counted twice.
export async function checkClubCapacity(
  event: Event,
  reservations: Reservation[],
  requested: number,
  excludeReservationId?: number,
): Promise<CapacityCheck> {
  if (event.maxTickets == null) return { ok: true, remaining: Number.POSITIVE_INFINITY };
  const club = clubReservedTickets(reservations, event.id, excludeReservationId);
  // If Pretix cannot be reached, its sales are unknown; the quota still keeps
  // Pretix itself from overselling, so the reservation is not blocked on that.
  const sold = (await pretixSoldTickets(event)) ?? 0;
  const remaining = Math.max(0, event.maxTickets - club - sold);
  return { ok: requested <= remaining, remaining };
}

export function capacityError(remaining: number): string {
  return remaining === 0
    ? 'Diese Veranstaltung ist leider ausverkauft.'
    : `Es sind nur noch ${remaining} Plätze verfügbar.`;
}

// Set the Pretix quota to the seats the club has not reserved itself.
// Returns false when Pretix did not take the change.
export async function syncPretixCapacity(event: Event, reservations?: Reservation[]): Promise<boolean> {
  if (!sells(event) || event.maxTickets == null) return true;
  const all = reservations ?? await readReservations();
  const size = Math.max(0, event.maxTickets - clubReservedTickets(all, event.id));
  const quotas = await pretix(`/events/${event.pretixSlug}/quotas/`);
  if (!quotas.ok) return false;
  let ok = true;
  for (const quota of quotas.data?.results || []) {
    if (quota.size === size) continue;
    const res = await pretix(`/events/${event.pretixSlug}/quotas/${quota.id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ size }),
    });
    if (!res.ok) ok = false;
  }
  console.log(`[capacity] ${event.pretixSlug}: quota ${size} (capacity ${event.maxTickets}) ${ok ? 'ok' : 'FAILED'}`);
  return ok;
}

// After any reservation change: re-sync every event whose seats it touched.
export async function syncCapacityForEvents(events: Event[], eventIds: number[], reservations?: Reservation[]): Promise<void> {
  const all = reservations ?? await readReservations();
  for (const id of new Set(eventIds)) {
    const event = events.find(e => e.id === id);
    if (event) await syncPretixCapacity(event, all);
  }
}
