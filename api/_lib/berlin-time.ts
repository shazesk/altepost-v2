// The Vercel runtime is UTC, so `setHours` on a Date would store a 20:00 show as
// 20:00 UTC — 22:00 in Brensbach. These helpers pin the wall-clock time to
// Europe/Berlin regardless of where the function runs.
function berlinOffsetMinutes(instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Berlin',
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(instant).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});
  const asUTC = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour) % 24, Number(parts.minute), Number(parts.second)
  );
  return (asUTC - instant.getTime()) / 60000;
}

export function berlinWallClockToDate(dateStr: string, timeStr: string): Date {
  const [y, mo, d] = String(dateStr).slice(0, 10).split('-').map(Number);
  const [hhRaw, mmRaw] = String(timeStr || '20:00').split(':');
  const hh = parseInt(hhRaw, 10) || 0;
  const mm = parseInt(mmRaw || '0', 10) || 0;
  const naive = Date.UTC(y, (mo || 1) - 1, d || 1, hh, mm, 0);
  // Two passes so the DST changeover days resolve correctly.
  let instant = new Date(naive);
  for (let i = 0; i < 2; i++) {
    instant = new Date(naive - berlinOffsetMinutes(instant) * 60000);
  }
  return instant;
}

export const PRESALE_DAYS_BEFORE = 3;

// Online sales close at the end of the last selling day, Berlin time. Without an
// explicit date that day is three days before the show. Shared by the Pretix sync
// and the public pages so the website stops selling when Pretix does.
export function presaleEndDate(event: { date: string; presaleEnd?: string }): Date {
  if (event.presaleEnd) return berlinWallClockToDate(event.presaleEnd, '23:59');
  const [y, m, d] = String(event.date).slice(0, 10).split('-').map(Number);
  const lastDay = new Date(Date.UTC(y, m - 1, d - PRESALE_DAYS_BEFORE));
  return berlinWallClockToDate(lastDay.toISOString().slice(0, 10), '23:59');
}
