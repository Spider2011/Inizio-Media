// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

let ipCounter = 0;
function request(body: unknown, { ip, raw, headers }: { ip?: string; raw?: string; headers?: Record<string, string> } = {}) {
  return new Request('http://localhost/api/enquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip ?? `10.0.0.${++ipCounter}`, ...headers },
    body: raw ?? JSON.stringify(body)
  });
}

const valid = { name: 'Asha', contact: 'asha@example.com', business: '', service: 'Branding', message: 'Hello' };

describe('POST /api/enquiry', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('ENQUIRY_FROM', '');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects a body that is not JSON', async () => {
    const res = await POST(request(null, { raw: '{oops' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ success: false, code: 'bad_json' });
  });

  it('rejects oversized bodies', async () => {
    const res = await POST(request(valid, { headers: { 'content-length': '50000' } }));
    expect(res.status).toBe(413);
  });

  it('rejects oversized bodies even without a content-length header', async () => {
    const res = await POST(request(null, { raw: JSON.stringify({ ...valid, message: 'x'.repeat(50_000) }) }));
    expect(res.status).toBe(413);
  });

  it('only accepts JSON, so a plain cross-site form cannot post to it', async () => {
    const res = await POST(request(null, { raw: JSON.stringify(valid), headers: { 'content-type': 'text/plain' } }));
    expect(res.status).toBe(415);
  });

  it('returns field errors for invalid enquiries', async () => {
    const res = await POST(request({ ...valid, name: '', contact: 'nope' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: 'Please check the highlighted fields.',
      code: 'invalid',
      fieldErrors: { name: 'Tell us your name.', contact: 'Enter a phone number or a full email address.' }
    });
  });

  it('quietly accepts honeypot submissions without sending anything', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await POST(request({ ...valid, website: 'http://spam.example' }));
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reports when email delivery is not configured', async () => {
    const res = await POST(request(valid));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ success: false, code: 'not_configured' });
  });

  it('sends the enquiry when configured', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubEnv('ENQUIRY_FROM', 'Inizio Media <hello@example.com>');
    const fetchSpy = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchSpy);
    const res = await POST(request(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: null, error: null });
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it('reports a delivery failure without leaking provider details', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubEnv('ENQUIRY_FROM', 'Inizio Media <hello@example.com>');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('secret detail', { status: 500 })));
    const res = await POST(request(valid));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body).toMatchObject({ success: false, code: 'delivery_failed' });
    expect(JSON.stringify(body)).not.toContain('secret detail');
  });

  it('rate-limits repeated enquiries from one address', async () => {
    const statuses = [];
    for (let i = 0; i < 6; i += 1) {
      statuses.push((await POST(request(valid, { ip: '203.0.113.9' }))).status);
    }
    expect(statuses.slice(0, 5)).toEqual([503, 503, 503, 503, 503]);
    expect(statuses[5]).toBe(429);
  });
});
