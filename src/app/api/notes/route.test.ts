// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getNotesStore } from '@/lib/notes/store';
import { POST } from './route';

let ipCounter = 0;
function request(body: unknown, { ip, raw, headers }: { ip?: string; raw?: string; headers?: Record<string, string> } = {}) {
  return new Request('http://localhost/api/notes', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip ?? `10.1.0.${++ipCounter}`, ...headers },
    body: raw ?? JSON.stringify(body)
  });
}

const valid = { text: 'They gave our <b>chai</b> brand a voice.', name: 'Chai Co', paper: 'navy' };
const store = () => getNotesStore()!;

describe('POST /api/notes', () => {
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

  it('pins a cleaned, unapproved note with a server-set date and id', async () => {
    const before = Date.now();
    const res = await POST(request({ ...valid, createdAt: '1999-01-01', approved: true, id: 'mine' }));
    expect(res.status).toBe(201);

    const { data } = await res.json();
    expect(data.note).toMatchObject({ text: 'They gave our chai brand a voice.', name: 'Chai Co', paper: 'navy', approved: false });
    expect(data.note.id).not.toBe('mine');
    expect(Date.parse(data.note.createdAt)).toBeGreaterThanOrEqual(before);

    expect((await store().listPending()).some((n) => n.id === data.note.id)).toBe(true);
    expect((await store().listApproved()).some((n) => n.id === data.note.id)).toBe(false);
  });

  it('returns the plain-word field errors', async () => {
    const res = await POST(request({ text: '', name: '' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      code: 'invalid',
      fieldErrors: {
        text: 'Please write a few words about your experience.',
        name: "Please add your name or your company's name."
      }
    });
  });

  it('rejects over-long notes on the server too', async () => {
    expect((await POST(request({ ...valid, text: 'x'.repeat(221) }))).status).toBe(400);
  });

  it('allows 3 notes per IP per hour', async () => {
    const ip = '10.9.9.9';
    for (let i = 0; i < 3; i += 1) expect((await POST(request(valid, { ip }))).status).toBe(201);
    const res = await POST(request(valid, { ip }));
    expect(res.status).toBe(429);
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('quietly accepts and drops honeypot submissions', async () => {
    const pending = (await store().listPending()).length;
    const res = await POST(request({ ...valid, website: 'spam.example' }));
    expect(res.status).toBe(200);
    expect((await store().listPending()).length).toBe(pending);
  });

  it('only accepts JSON within the size limit', async () => {
    expect((await POST(request(valid, { headers: { 'content-type': 'text/plain' } }))).status).toBe(415);
    expect((await POST(request(null, { raw: '{oops' }))).status).toBe(400);
    expect((await POST(request(null, { raw: JSON.stringify({ ...valid, text: 'x'.repeat(5000) }) }))).status).toBe(413);
  });

  it('emails Inizio a link to approve the note, when mail is set up', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubEnv('ENQUIRY_FROM', 'Inizio <hello@example.com>');
    const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(new Response('{}', { status: 200 })));
    vi.stubGlobal('fetch', fetchMock);

    expect((await POST(request(valid))).status).toBe(201);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const mail = JSON.parse(String(init.body));
    expect(mail.subject).toBe('New note on the beginnings wall · Chai Co');
    expect(mail.text).toContain('/admin/notes');
  });

  it('still pins the note when the alert email fails', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubEnv('ENQUIRY_FROM', 'Inizio <hello@example.com>');
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{}', { status: 500 }))));

    expect((await POST(request(valid))).status).toBe(201);
    expect(console.error).toHaveBeenCalled();
  });

  // Last on purpose: it uses up the wall's hourly quota in the shared test store.
  it('caps the whole wall at 60 new notes an hour, however many addresses send them', async () => {
    let res = await POST(request(valid, { ip: '10.200.0.0' }));
    for (let i = 1; i < 70 && res.status === 201; i += 1) {
      res = await POST(request(valid, { ip: `10.200.0.${i}` }));
    }
    expect(res.status).toBe(429);
    expect(await res.json()).toMatchObject({ code: 'busy' });
  });
});
