/* The first x-forwarded-for entry is the client on hosts that set the header themselves (e.g. Vercel).
   Behind a proxy that passes client values through, use that proxy's own client-IP header instead. */
export function clientKey(headers: Pick<Headers, 'get'>): string {
  const forwarded = headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown';
  return ip.includes(':') ? ipv6Prefix(ip) : ip;
}

/* One IPv6 customer usually holds a whole /64, so limits count per /64 rather than per address. */
function ipv6Prefix(ip: string): string {
  const [head, tail = ''] = ip.toLowerCase().replace(/%.*$/, '').split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const missing = ip.includes('::') ? Math.max(0, 8 - left.length - right.length) : 0;
  const groups = [...left, ...Array(missing).fill('0'), ...right];
  return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, '')).join(':')}::/64`;
}

/* Bots fill hidden "website" fields; callers accept quietly so they learn nothing. */
export function isHoneypotFilled(payload: unknown): boolean {
  if (typeof payload !== 'object' || payload === null) return false;
  const value = (payload as { website?: unknown }).website;
  return typeof value === 'string' && value.trim() !== '';
}
