/* Enquiry rules shared by the contact form (client) and /api/enquiry (server).
   zod/mini keeps the schema tree-shakable, so the browser only downloads the checks used here. */
import * as z from 'zod/mini';

export const SERVICES = [
  'Branding',
  'Social Media Management',
  'Performance Marketing',
  'Website Development',
  'Event & Wedding Coverage',
  'Something else'
] as const;

export type Service = (typeof SERVICES)[number];
export type ContactKind = 'email' | 'phone';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^\+?[\d\s()-]+$/;

export function classifyContact(value: string): ContactKind | null {
  const v = value.trim();
  if (EMAIL.test(v)) return 'email';
  const digits = v.replace(/\D/g, '');
  if (PHONE_CHARS.test(v) && digits.length >= 10 && digits.length <= 15) return 'phone';
  return null;
}

/* Single-line fields end up in the email subject, so any run of whitespace (including line breaks) becomes one space. */
const singleLine = () => z.overwrite((value: string) => value.replace(/\s+/g, ' ').trim());

const NAME_MESSAGE = 'Tell us your name.';
const CONTACT_MESSAGE = 'Enter a phone number or a full email address.';

export const enquirySchema = z.object({
  name: z.string(NAME_MESSAGE).check(singleLine(), z.minLength(1, NAME_MESSAGE), z.maxLength(100, 'Keep your name under 100 characters.')),
  contact: z
    .string(CONTACT_MESSAGE)
    .check(singleLine(), z.maxLength(120, CONTACT_MESSAGE), z.refine((v) => classifyContact(v) !== null, CONTACT_MESSAGE)),
  business: z._default(z.string().check(singleLine(), z.maxLength(120, 'Keep the business name under 120 characters.')), ''),
  service: z.enum(SERVICES, 'Choose one of the listed services.'),
  message: z._default(z.string().check(z.trim(), z.maxLength(2000, 'Keep the message under 2,000 characters.')), '')
});

export type Enquiry = z.infer<typeof enquirySchema>;
export type EnquiryField = keyof Enquiry;
export type FieldErrors = Partial<Record<EnquiryField, string>>;

export type ValidationResult = { success: true; data: Enquiry } | { success: false; errors: FieldErrors };

/* Used when the whole payload is not an object, so no field-level issue exists. */
const REQUIRED_FIELD_MESSAGES: FieldErrors = {
  name: NAME_MESSAGE,
  contact: CONTACT_MESSAGE,
  service: 'Choose one of the listed services.'
};

export function validateEnquiry(input: unknown): ValidationResult {
  const result = z.safeParse(enquirySchema, input);
  if (result.success) return { success: true, data: result.data };

  const errors = result.error.issues.reduce<FieldErrors>((acc, issue) => {
    const field = issue.path[0] as EnquiryField | undefined;
    if (field === undefined) return { ...REQUIRED_FIELD_MESSAGES, ...acc };
    return acc[field] ? acc : { ...acc, [field]: issue.message };
  }, {});
  return { success: false, errors };
}

export function enquirySubject(data: Enquiry): string {
  return `Enquiry: ${data.service} · ${data.name}${data.business ? ` (${data.business})` : ''}`;
}

export function enquiryBody(data: Enquiry): string {
  const lines = [`Name: ${data.name}`, `Phone or email: ${data.contact}`];
  if (data.business) lines.push(`Business: ${data.business}`);
  lines.push(`What we need: ${data.service}`);
  if (data.message) lines.push('', data.message);
  return lines.join('\n');
}

export function buildMailto(data: Enquiry, to: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(enquirySubject(data))}&body=${encodeURIComponent(enquiryBody(data))}`;
}
