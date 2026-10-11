'use client';

import { AnimatePresence, m } from 'motion/react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Arrow } from '@/components/ui/Arrow';
import { SITE } from '@/content/site';
import type { ApiResponse } from '@/lib/api-response';
import { cx } from '@/lib/cx';
import { buildMailto, SERVICES, validateEnquiry, type EnquiryField, type FieldErrors } from '@/lib/enquiry';
import { EASE_OUT } from '@/lib/motion';
import styles from './EnquiryForm.module.css';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; name: string }
  | { kind: 'mailto' }
  | { kind: 'error'; message: string };

type Props = {
  endpoint?: string;
  /** Opens the visitor's email app; injectable for tests. */
  openMailto?: (url: string) => void;
};

const FIELDS: readonly EnquiryField[] = ['name', 'contact', 'business', 'service', 'message'];

function readForm(form: HTMLFormElement): Record<string, string> {
  const data = new FormData(form);
  return Object.fromEntries([...FIELDS, 'website'].map((key) => [key, String(data.get(key) ?? '')]));
}

function defaultOpenMailto(url: string) {
  window.location.assign(url);
}

function focusOnMount(element: HTMLElement | null) {
  element?.focus({ preventScroll: true });
}

export function EnquiryForm({ endpoint = '/api/enquiry', openMailto = defaultOpenMailto }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [attempted, setAttempted] = useState(false);

  /* Native `required` covers visitors without JavaScript; with it, the animated error states take over. */
  useEffect(() => {
    if (formRef.current) formRef.current.noValidate = true;
  }, []);

  function focusFirstError(fieldErrors: FieldErrors) {
    const first = FIELDS.find((field) => fieldErrors[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = readForm(form);
    setAttempted(true);

    const result = validateEnquiry(raw);
    if (!result.success) {
      setErrors(result.errors);
      setStatus({ kind: 'idle' });
      focusFirstError(result.errors);
      return;
    }

    setErrors({});
    setStatus({ kind: 'sending' });
    const fallbackToEmailApp = () => {
      setStatus({ kind: 'mailto' });
      openMailto(buildMailto(result.data, SITE.email));
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...result.data, website: raw.website })
      });
      const body = (await response.json().catch(() => null)) as ApiResponse<null> | null;

      if (response.ok && body?.success) {
        form.reset();
        setAttempted(false);
        setStatus({ kind: 'sent', name: result.data.name });
      } else if (response.status === 400 && body?.fieldErrors) {
        setErrors(body.fieldErrors);
        setStatus({ kind: 'idle' });
        focusFirstError(body.fieldErrors);
      } else if (response.status === 429) {
        setStatus({ kind: 'error', message: body?.error ?? 'Too many enquiries. Please try again in a few minutes.' });
      } else {
        fallbackToEmailApp();
      }
    } catch {
      fallbackToEmailApp();
    }
  }

  function onInput(event: FormEvent<HTMLFormElement>) {
    if (!attempted) return;
    const result = validateEnquiry(readForm(event.currentTarget));
    setErrors(result.success ? {} : result.errors);
  }

  const sending = status.kind === 'sending';

  return (
    <form
      ref={formRef}
      className={styles.form}
      action={`mailto:${SITE.email}`}
      method="post"
      encType="text/plain"
      aria-labelledby="enquiry-title"
      onSubmit={onSubmit}
      onInput={onInput}
    >
      <AnimatePresence mode="wait" initial={false}>
        {status.kind === 'sent' ? (
          <m.div
            key="sent"
            className={styles.panel}
            role="status"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <p className={styles.kicker}>Enquiry sent</p>
            <h3 ref={focusOnMount} tabIndex={-1} className={styles.title} id="enquiry-title">
              Thank you, {status.name}.
            </h3>
            <p className={styles.note}>Your enquiry is with the team. We will get back to you on the phone number or email you shared.</p>
            <button className={styles.secondary} type="button" onClick={() => setStatus({ kind: 'idle' })}>
              Send another enquiry
            </button>
          </m.div>
        ) : (
          <m.div key="fields" className={styles.panel} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <p className={styles.kicker}>Enquiry</p>
            <h3 className={styles.title} id="enquiry-title">
              Tell us about your brand
            </h3>

            <div className={styles.row}>
              <Field name="name" label="Your name" error={errors.name}>
                {(props) => <input className={styles.input} name="name" autoComplete="name" placeholder=" " required {...props} />}
              </Field>
              <Field name="contact" label="Phone or email" error={errors.contact}>
                {(props) => <input className={styles.input} name="contact" autoComplete="email" placeholder=" " required {...props} />}
              </Field>
            </div>
            <div className={styles.row}>
              <Field name="business" label="Business name (optional)" error={errors.business}>
                {(props) => <input className={styles.input} name="business" autoComplete="organization" placeholder=" " {...props} />}
              </Field>
              <Field name="service" label="What do you need?" error={errors.service} floated>
                {(props) => (
                  <select className={cx(styles.input, styles.select)} name="service" defaultValue={SERVICES[0]} {...props}>
                    {SERVICES.map((service) => (
                      <option key={service}>{service}</option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
            <Field name="message" label="A few lines about the project (optional)" error={errors.message}>
              {(props) => <textarea className={cx(styles.input, styles.textarea)} name="message" placeholder=" " {...props} />}
            </Field>

            <div className={styles.honeypot} aria-hidden="true">
              <label>
                Leave this empty
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className={styles.submitRow}>
              <button className={styles.submit} type="submit" disabled={sending}>
                <span>{sending ? 'Sending…' : 'Send enquiry'}</span>
                <span className={styles.submitIcon} aria-hidden="true">
                  {sending ? <span className={styles.spinner} /> : <Arrow direction="up-right" />}
                </span>
              </button>
              <p className={cx(styles.status, status.kind === 'error' && styles.statusError)} role="status">
                {status.kind === 'mailto' &&
                  `We've opened your email app with the enquiry ready to send. If nothing opened, write to us at ${SITE.email}.`}
                {status.kind === 'error' && status.message}
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </form>
  );
}

type FieldProps = {
  name: EnquiryField;
  label: string;
  error?: string;
  /** Keep the label raised (selects always show a value). */
  floated?: boolean;
  children: (control: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode;
};

/* Floating-label field: the label sits in the box and lifts when the field is focused or filled.
   The error is linked with aria-describedby and announced once. */
function Field({ name, label, error, floated, children }: FieldProps) {
  const id = `enquiry-${name}`;
  const errorId = `${id}-error`;
  return (
    <div className={cx(styles.field, floated && styles.floated, error && styles.invalid)}>
      {children({ id, ...(error ? { 'aria-invalid': true, 'aria-describedby': errorId } : {}) })}
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <span className={styles.line} aria-hidden="true" />
      <AnimatePresence initial={false}>
        {error && (
          <m.p
            key="error"
            id={errorId}
            className={styles.error}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {error}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );
}
