/* The /admin/notes sign-in: one shared password (ADMIN_PASSWORD) and a signed, expiring session cookie.
   The cookie holds only an expiry time and an HMAC of it, keyed from the password, so changing the
   password signs everyone out. */
import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE = 'wall_admin';
export const SESSION_SECONDS = 8 * 60 * 60;
/** Shorter passwords are refused, so a weak one never protects the page. */
export const MIN_PASSWORD_LENGTH = 12;

export function readAdminPassword(env: Record<string, string | undefined>): string | null {
  const password = env.ADMIN_PASSWORD?.trim();
  return password && password.length >= MIN_PASSWORD_LENGTH ? password : null;
}

const digest = (value: string) => createHash('sha256').update(value).digest();

/* Comparing fixed-length digests keeps the check constant-time whatever was typed. */
export function passwordMatches(attempt: string, password: string): boolean {
  return timingSafeEqual(digest(attempt), digest(password));
}

function sign(expires: string, password: string): string {
  const key = digest(`beginnings-wall-admin:${password}`);
  return createHmac('sha256', key).update(expires).digest('base64url');
}

export function createSessionToken(password: string, now: number = Date.now()): string {
  const expires = String(now + SESSION_SECONDS * 1000);
  return `${expires}.${sign(expires, password)}`;
}

export function isValidSession(token: string | undefined, password: string, now: number = Date.now()): boolean {
  if (!token) return false;
  const [expires, signature, extra] = token.split('.');
  if (!expires || !signature || extra !== undefined || !/^\d+$/.test(expires)) return false;
  if (Number(expires) <= now) return false;
  const expected = Buffer.from(sign(expires, password));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
