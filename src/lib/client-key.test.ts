import { describe, expect, it } from 'vitest';
import { clientKey } from './client-key';

const headers = (values: Record<string, string>) => new Headers(values);

describe('clientKey', () => {
  it('uses the first forwarded address', () => {
    expect(clientKey(headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7');
    expect(clientKey(headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2');
    expect(clientKey(headers({}))).toBe('unknown');
  });

  it('groups IPv6 addresses by their /64, so one network cannot rotate addresses past a limit', () => {
    const a = clientKey(headers({ 'x-forwarded-for': '2001:db8:abcd:12::1' }));
    const b = clientKey(headers({ 'x-forwarded-for': '2001:0db8:abcd:0012:ffff:1:2:3' }));
    expect(a).toBe('2001:db8:abcd:12::/64');
    expect(b).toBe(a);
    expect(clientKey(headers({ 'x-forwarded-for': '::1' }))).toBe('0:0:0:0::/64');
    expect(clientKey(headers({ 'x-forwarded-for': '2001:db8:abcd:13::1' }))).not.toBe(a);
  });
});
