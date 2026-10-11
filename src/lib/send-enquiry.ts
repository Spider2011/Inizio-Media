/* Delivers enquiries by email through Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
   Server only: reads secrets from the environment. */
import 'server-only';
import { classifyContact, enquiryBody, enquirySubject, type Enquiry } from './enquiry';

export const STUDIO_INBOX = 'teaminizio.media@gmail.com';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export type MailConfig = { apiKey: string; from: string; to: string };

export function readMailConfig(env: Record<string, string | undefined>): MailConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.ENQUIRY_FROM?.trim();
  if (!apiKey || !from) return null;
  return { apiKey, from, to: env.ENQUIRY_TO?.trim() || STUDIO_INBOX };
}

export async function sendEnquiryEmail(data: Enquiry, config: MailConfig, fetchImpl: typeof fetch = fetch): Promise<void> {
  const replyTo = classifyContact(data.contact) === 'email' ? { reply_to: data.contact } : {};
  const res = await fetchImpl(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      subject: enquirySubject(data),
      text: enquiryBody(data),
      ...replyTo
    })
  });
  if (!res.ok) throw new Error(`Email provider responded ${res.status}`);
}
