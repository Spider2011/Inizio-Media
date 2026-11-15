/* Pins a note to the beginnings wall. Notes are saved unapproved; Inizio approves them at /admin/notes. */
import { fail, ok } from '@/lib/api-response';
import { clientKey, isHoneypotFilled } from '@/lib/client-key';
import { noteAlert } from '@/lib/notes/alert';
import { validateNote, type Note } from '@/lib/notes/note';
import { getNotesStore } from '@/lib/notes/store';
import { readBodyWithLimit } from '@/lib/read-body';
import { readMailConfig, sendMail } from '@/lib/send-enquiry';
import { SITE_URL } from '@/lib/site-url';

const MAX_BODY_BYTES = 4_000;
const NOTES_PER_HOUR = 3;
/* A ceiling for the whole wall, so many addresses together cannot flood the queue or the alert inbox
   (the same Resend quota delivers contact enquiries). */
const WALL_NOTES_PER_HOUR = 60;
const HOUR_SECONDS = 60 * 60;

async function alertInizio(note: Note): Promise<void> {
  const mail = readMailConfig(process.env);
  if (!mail) return;
  // The note is saved either way, so a mail failure is only logged.
  try {
    await sendMail(noteAlert(note, SITE_URL), mail);
  } catch (error) {
    console.error('[api/notes] alert email failed', error);
  }
}

export async function POST(request: Request): Promise<Response> {
  // JSON only: a plain HTML form on another site cannot send application/json without a CORS preflight.
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return fail(415, 'Send the note as JSON.', { code: 'unsupported_media_type' });
  }

  const raw = await readBodyWithLimit(request, MAX_BODY_BYTES);
  if (raw === null) return fail(413, 'That note is too long to pin.', { code: 'too_large' });

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return fail(400, 'Invalid request body.', { code: 'bad_json' });
  }

  if (isHoneypotFilled(payload)) return ok(null);

  const result = validateNote(payload);
  if (!result.success) {
    return fail(400, 'Please check the highlighted fields.', { code: 'invalid', fieldErrors: result.errors });
  }

  const store = getNotesStore();
  if (!store) return fail(503, 'The wall is not taking notes just yet.', { code: 'not_configured' });

  let note: Note;
  try {
    const rate = await store.hit(`notes:${clientKey(request.headers)}`, NOTES_PER_HOUR, HOUR_SECONDS);
    if (!rate.allowed) {
      return fail(429, 'You have pinned a few notes already. Please try again in an hour.', { code: 'rate_limited' }, {
        'Retry-After': String(rate.retryAfterSeconds)
      });
    }
    const wall = await store.hit('notes:all', WALL_NOTES_PER_HOUR, HOUR_SECONDS);
    if (!wall.allowed) {
      return fail(429, 'The wall is very busy right now. Please try again in an hour.', { code: 'busy' }, {
        'Retry-After': String(wall.retryAfterSeconds)
      });
    }
    note = await store.create(result.data, crypto.randomUUID(), new Date());
  } catch (error) {
    console.error('[api/notes] could not save the note', error);
    return fail(503, 'We could not pin your note just now. Please try again.', { code: 'store_failed' });
  }

  await alertInizio(note);
  return ok({ note }, { status: 201 });
}
