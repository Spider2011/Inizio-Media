// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createSessionToken, isValidSession, passwordMatches, readAdminPassword, SESSION_SECONDS } from './admin-auth';

const PASSWORD = 'correct horse battery';

describe('admin sign-in', () => {
  it('only accepts a password of at least 12 characters from the environment', () => {
    expect(readAdminPassword({ ADMIN_PASSWORD: ` ${PASSWORD} ` })).toBe(PASSWORD);
    expect(readAdminPassword({ ADMIN_PASSWORD: 'short' })).toBeNull();
    expect(readAdminPassword({})).toBeNull();
  });

  it('matches only the exact password', () => {
    expect(passwordMatches(PASSWORD, PASSWORD)).toBe(true);
    expect(passwordMatches('correct horse', PASSWORD)).toBe(false);
    expect(passwordMatches('', PASSWORD)).toBe(false);
  });

  it('accepts its own session until it expires', () => {
    const now = 1_000_000;
    const token = createSessionToken(PASSWORD, now);
    expect(isValidSession(token, PASSWORD, now + 1000)).toBe(true);
    expect(isValidSession(token, PASSWORD, now + SESSION_SECONDS * 1000)).toBe(false);
  });

  it('rejects tampered, foreign or malformed sessions', () => {
    const now = 1_000_000;
    const token = createSessionToken(PASSWORD, now);
    const [expires, signature] = token.split('.');
    expect(isValidSession(`${Number(expires) + 99999}.${signature}`, PASSWORD, now)).toBe(false);
    expect(isValidSession(token, 'a different password', now)).toBe(false);
    expect(isValidSession(`${token}.x`, PASSWORD, now)).toBe(false);
    expect(isValidSession('nonsense', PASSWORD, now)).toBe(false);
    expect(isValidSession(undefined, PASSWORD, now)).toBe(false);
  });
});
