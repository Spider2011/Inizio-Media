import { describe, expect, it } from 'vitest';
import { buildMailto, classifyContact, enquiryBody, enquirySubject, SERVICES, validateEnquiry } from './enquiry';

const valid = { name: 'Asha', contact: '+91 90823 22109', business: '', service: 'Branding', message: '' };

describe('classifyContact', () => {
  it('recognises emails', () => {
    expect(classifyContact('teaminizio.media@gmail.com')).toBe('email');
    expect(classifyContact('  a.b@studio.co.in ')).toBe('email');
  });

  it('recognises Indian and international phone numbers', () => {
    expect(classifyContact('+91 90823 22109')).toBe('phone');
    expect(classifyContact('9082322109')).toBe('phone');
    expect(classifyContact('(022) 2345-6789')).toBe('phone');
  });

  it('rejects partial or junk input', () => {
    for (const value of ['', 'teaminizio@', 'a@b', '12345', 'call me maybe', '+91 90823 22109 ext 4 then press 9 again']) {
      expect(classifyContact(value)).toBeNull();
    }
  });
});

describe('validateEnquiry', () => {
  it('accepts a minimal enquiry and trims every field', () => {
    const result = validateEnquiry({ ...valid, name: '  Asha  ', business: ' Chai Bar ' });
    expect(result).toEqual({
      success: true,
      data: { name: 'Asha', contact: '+91 90823 22109', business: 'Chai Bar', service: 'Branding', message: '' }
    });
  });

  it('fills optional fields that are missing', () => {
    const ok = validateEnquiry({ name: 'Asha', contact: 'asha@example.com', service: 'Branding' });
    expect(ok).toMatchObject({ success: true, data: { business: '', message: '' } });
  });

  it('requires a name and a usable phone or email, with the design-system messages', () => {
    const result = validateEnquiry({ ...valid, name: '  ', contact: 'teaminizio@' });
    expect(result).toEqual({
      success: false,
      errors: { name: 'Tell us your name.', contact: 'Enter a phone number or a full email address.' }
    });
  });

  it('only accepts the listed services', () => {
    expect(SERVICES).toContain('Event & Wedding Coverage');
    const result = validateEnquiry({ ...valid, service: 'Crypto pump' });
    expect(result).toMatchObject({ success: false, errors: { service: 'Choose one of the listed services.' } });
  });

  it('caps field lengths', () => {
    const result = validateEnquiry({ ...valid, message: 'x'.repeat(2001), name: 'n'.repeat(101) });
    expect(result).toMatchObject({
      success: false,
      errors: { message: 'Keep the message under 2,000 characters.', name: 'Keep your name under 100 characters.' }
    });
  });

  it('rejects input that is not an object', () => {
    expect(validateEnquiry(null).success).toBe(false);
    expect(validateEnquiry('hello').success).toBe(false);
  });

  it('collapses line breaks in single-line fields so they cannot spill into the email subject', () => {
    const result = validateEnquiry({ ...valid, name: 'Asha\r\nBcc: x@y.com', business: 'Chai\n\nBar' });
    expect(result).toMatchObject({ success: true, data: { name: 'Asha Bcc: x@y.com', business: 'Chai Bar' } });
  });

  it('does not mutate its input', () => {
    const input = Object.freeze({ ...valid, name: ' Asha ' });
    expect(() => validateEnquiry(input)).not.toThrow();
    expect(input.name).toBe(' Asha ');
  });
});

describe('enquiry text', () => {
  const data = { name: 'Asha & Co', contact: 'asha@example.com', business: 'Chai Bar', service: 'Branding' as const, message: 'New logo?\nSoon.' };

  it('builds a subject naming the service, person and business', () => {
    expect(enquirySubject(data)).toBe('Enquiry: Branding · Asha & Co (Chai Bar)');
    expect(enquirySubject({ ...data, business: '' })).toBe('Enquiry: Branding · Asha & Co');
  });

  it('builds a plain-text body and leaves out empty optional fields', () => {
    expect(enquiryBody(data)).toBe(
      'Name: Asha & Co\nPhone or email: asha@example.com\nBusiness: Chai Bar\nWhat we need: Branding\n\nNew logo?\nSoon.'
    );
    expect(enquiryBody({ ...data, business: '', message: '' })).toBe(
      'Name: Asha & Co\nPhone or email: asha@example.com\nWhat we need: Branding'
    );
  });

  it('builds a mailto link with every field percent-encoded', () => {
    const url = buildMailto(data, 'teaminizio.media@gmail.com');
    expect(url.startsWith('mailto:teaminizio.media@gmail.com?subject=')).toBe(true);
    expect(url).not.toMatch(/[ \n]/);
    const params = new URLSearchParams(url.slice(url.indexOf('?') + 1));
    expect(params.get('subject')).toBe(enquirySubject(data));
    expect(params.get('body')).toBe(enquiryBody(data));
  });
});
