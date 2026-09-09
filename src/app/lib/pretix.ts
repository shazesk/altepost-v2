import { useEffect, useState } from 'react';

// Must match the organizer the backend syncs to (api/admin/events.ts).
export const PRETIX_ORGANIZER = 'kleinkunstkneipe';

export function pretixShopUrl(slug: string): string {
  return `https://pretix.eu/${PRETIX_ORGANIZER}/${slug}/`;
}

/**
 * Whether this event's Pretix shop is published and actually sellable.
 * `null` while the answer is still unknown.
 *
 * Every event synced to Pretix has a slug, including ones whose shop was never
 * published, so the slug alone cannot tell us where to send a buyer. Once Pretix
 * is selling an event it owns the booking, and the club's own reservation form
 * must not be offered alongside it.
 */
export function usePretixShopAvailable(slug: string | null | undefined): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!slug) { setAvailable(false); return; }
    let cancelled = false;
    setAvailable(null);
    fetch(`${pretixShopUrl(slug)}widget/product_list?lang=de`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(data => { if (!cancelled) setAvailable(!data?.error); })
      .catch(() => { if (!cancelled) setAvailable(false); });
    return () => { cancelled = true; };
  }, [slug]);

  return available;
}
