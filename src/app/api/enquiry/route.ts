import { fail, ok } from '@/lib/api-response';
import { validateEnquiry } from '@/lib/enquiry';
import { createRateLimiter } from '@/lib/rate-limit';
import { readBodyWithLimit } from '@/lib/read-body';
import { readMailConfig, sendEnquiryEmail } from '@/lib/send-enquiry';

const MAX_BODY_BYTES = 10_000;
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

/* The first x-forwarded-for entry is the client on hosts that set the header themselves (e.g. Vercel).
   Behind a proxy that passes client values through, use that proxy's own client-IP header instead. */
function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

function isHoneypotFilled(payload: unknown): boolean {
  if (typeof payload !== 'object' || payload === null) return false;
  const value = (payload as { website?: unknown }).website;
  return typeof value === 'string' && value.trim() !== '';
}

export async function POST(request: Request): Promise<Response> {
  const rate = limiter.check(clientKey(request));
  if (!rate.allowed) {
    return fail(429, 'Too many enquiries. Please try again in a few minutes.', { code: 'rate_limited' }, {
      'Retry-After': String(Math.ceil(rate.retryAfterMs / 1000))
    });
  }

  // JSON only: a plain HTML form on another site cannot send application/json without a CORS preflight.
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return fail(415, 'Send the enquiry as JSON.', { code: 'unsupported_media_type' });
  }

  const raw = await readBodyWithLimit(request, MAX_BODY_BYTES);
  if (raw === null) return fail(413, 'That message is too long to send.', { code: 'too_large' });

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return fail(400, 'Invalid request body.', { code: 'bad_json' });
  }

  // Bots fill the hidden "website" field; accept quietly so they learn nothing.
  if (isHoneypotFilled(payload)) return ok();

  const result = validateEnquiry(payload);
  if (!result.success) {
    return fail(400, 'Please check the highlighted fields.', { code: 'invalid', fieldErrors: result.errors });
  }

  const config = readMailConfig(process.env);
  if (!config) return fail(503, 'Online enquiries are not set up yet.', { code: 'not_configured' });

  try {
    await sendEnquiryEmail(result.data, config);
  } catch (error) {
    console.error('[api/enquiry] delivery failed', error);
    return fail(502, 'We could not send your enquiry just now.', { code: 'delivery_failed' });
  }

  return ok();
}
