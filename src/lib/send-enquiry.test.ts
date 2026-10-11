// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { readMailConfig, sendEnquiryEmail } from './send-enquiry';

const enquiry = { name: 'Asha', contact: 'asha@example.com', business: '', service: 'Branding' as const, message: 'Hi' };
const config = { apiKey: 're_test_key', from: 'Inizio Media <hello@example.com>', to: 'teaminizio.media@gmail.com' };

describe('readMailConfig', () => {
  it('needs an API key and a sender', () => {
    expect(readMailConfig({})).toBeNull();
    expect(readMailConfig({ RESEND_API_KEY: 'k' })).toBeNull();
    expect(readMailConfig({ ENQUIRY_FROM: 'a@b.com' })).toBeNull();
  });

  it('defaults the recipient to the studio inbox', () => {
    expect(readMailConfig({ RESEND_API_KEY: ' k ', ENQUIRY_FROM: 'a@b.com' })).toEqual({
      apiKey: 'k',
      from: 'a@b.com',
      to: 'teaminizio.media@gmail.com'
    });
    expect(readMailConfig({ RESEND_API_KEY: 'k', ENQUIRY_FROM: 'a@b.com', ENQUIRY_TO: 'x@y.com' })?.to).toBe('x@y.com');
  });
});

describe('sendEnquiryEmail', () => {
  it('posts the enquiry to Resend, replying to an email contact', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    await sendEnquiryEmail(enquiry, config, fetchImpl);
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer re_test_key');
    expect(JSON.parse(init.body)).toEqual({
      from: config.from,
      to: [config.to],
      subject: 'Enquiry: Branding · Asha',
      text: 'Name: Asha\nPhone or email: asha@example.com\nWhat we need: Branding\n\nHi',
      reply_to: 'asha@example.com'
    });
  });

  it('does not set a reply-to for a phone contact', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    await sendEnquiryEmail({ ...enquiry, contact: '9082322109' }, config, fetchImpl);
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).not.toHaveProperty('reply_to');
  });

  it('throws when the provider refuses the message', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('nope', { status: 422 }));
    await expect(sendEnquiryEmail(enquiry, config, fetchImpl)).rejects.toThrow('Email provider responded 422');
  });
});
