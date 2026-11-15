/* How a note looks: its dates and its deterministic tilt and holder. */

const TIME_ZONE = 'Asia/Kolkata';

const readable = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TIME_ZONE });
const parts = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: TIME_ZONE });

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

/** "8 Nov 2026" */
export function formatNoteDate(value: string | Date): string {
  return readable.format(toDate(value));
}

/** "08 NOV 2026", for the rubber stamp. */
export function stampDate(value: string | Date): string {
  const byType = Object.fromEntries(parts.formatToParts(toDate(value)).map((p) => [p.type, p.value]));
  return `${byType.day} ${String(byType.month).slice(0, 3).toUpperCase()} ${byType.year}`;
}

/* FNV-1a: a small, stable string hash, so a note keeps the same tilt on every visit. */
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** A tilt between -4 and 4 degrees, in quarter-degree steps, worked out from the id. */
export function tiltFor(id: string): number {
  return (hash(id) % 33) / 4 - 4;
}

export type Holder = 'pin-butter' | 'pin-red' | 'tape';

/** Pins and tape take turns along the wall; the pins alternate butter and red. */
export function holderFor(index: number): Holder {
  if (index % 2 === 1) return 'tape';
  return index % 4 === 0 ? 'pin-butter' : 'pin-red';
}
