'use client';

import { m, useReducedMotion } from 'motion/react';
import { useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Arrow } from '@/components/ui/Arrow';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import type { ApiResponse } from '@/lib/api-response';
import { cx } from '@/lib/cx';
import { EASE_OUT } from '@/lib/motion';
import { stampDate } from '@/lib/notes/format';
import {
  NOTE_NAME_MAX,
  NOTE_TEXT_MAX,
  PAPER_LABELS,
  PAPERS,
  validateNote,
  type Note,
  type NoteField,
  type NoteFieldErrors,
  type Paper
} from '@/lib/notes/note';
import { handFont, stampFont } from '@/styles/wall-fonts';
import styles from './PinNoteDialog.module.css';

type Props = {
  onClose: () => void;
  onPinned: (note: Note) => void;
  /** Where focus goes when the dialog closes: the button that opened it. */
  returnFocus: () => HTMLElement | null;
  endpoint?: string;
};

const GENERIC_ERROR = 'We could not pin your note just now. Please try again.';
const NETWORK_ERROR = 'We could not reach the wall. Check your connection and try again.';

export function PinNoteDialog({ onClose, onPinned, returnFocus, endpoint = '/api/notes' }: Props) {
  const ids = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [paper, setPaper] = useState<Paper>('butter');
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<NoteFieldErrors>({});
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const today = useMemo(() => stampDate(new Date()), []);

  useLockBodyScroll(true);
  useFocusTrap(dialogRef, true, { onEscape: onClose, initialFocus: textRef, returnFocus });

  // Once the visitor has tried to pin, errors follow the fields live and clear as soon as they are fixed.
  const validation = validateNote({ text, name, paper });
  const liveErrors = attempted && !validation.success ? validation.errors : {};
  const errors: NoteFieldErrors = { ...serverErrors, ...liveErrors };

  const fieldId = (field: NoteField) => `${ids}-${field}`;
  const errorId = (field: NoteField) => `${ids}-${field}-error`;

  function focusFirst(found: NoteFieldErrors) {
    if (found.text) textRef.current?.focus();
    else if (found.name) nameRef.current?.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    setServerErrors({});
    setFormError(null);
    if (!validation.success) {
      focusFirst(validation.errors);
      return;
    }

    const website = new FormData(event.currentTarget).get('website');
    setSending(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validation.data, website: typeof website === 'string' ? website : '' })
      });
      const body = (await response.json().catch(() => null)) as ApiResponse<{ note: Note }> | null;
      if (response.ok && body?.data?.note) {
        onPinned(body.data.note);
        return;
      }
      if (response.status === 400 && body?.fieldErrors) {
        setServerErrors(body.fieldErrors);
        focusFirst(body.fieldErrors);
      } else {
        setFormError(body?.error ?? GENERIC_ERROR);
      }
    } catch {
      setFormError(NETWORK_ERROR);
    } finally {
      setSending(false);
    }
  }

  const describedBy = (field: NoteField, extra?: string) => cx(extra, errors[field] && errorId(field)) || undefined;

  return createPortal(
    <m.div
      className={cx(styles.overlay, handFont.variable, stampFont.variable)}
      data-lenis-prevent=""
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={`${ids}-title`}>
        <form noValidate onSubmit={submit}>
          <m.div
            className={cx(styles.sheet, styles[paper])}
            initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <span className={styles.tape} aria-hidden="true" />
            <h2 id={`${ids}-title`} className={styles.title}>
              Pin your note
            </h2>

            <div className={styles.field}>
              <label htmlFor={fieldId('text')} className={styles.label}>
                Your note
              </label>
              <textarea
                ref={textRef}
                id={fieldId('text')}
                name="text"
                className={styles.lined}
                rows={5}
                maxLength={NOTE_TEXT_MAX}
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setServerErrors({});
                }}
                aria-invalid={errors.text ? true : undefined}
                aria-describedby={describedBy('text', `${ids}-count`)}
              />
              <p id={`${ids}-count`} className={cx(styles.count, text.length > NOTE_TEXT_MAX - 20 && styles.countNear)}>
                {text.length}/{NOTE_TEXT_MAX}
                <span className="sr-only"> characters</span>
              </p>
              {errors.text && (
                <p id={errorId('text')} className={styles.error}>
                  {errors.text}
                </p>
              )}
            </div>

            <div className={styles.signRow}>
              <div className={styles.field}>
                <label htmlFor={fieldId('name')} className={styles.label}>
                  Your name or company name
                </label>
                <input
                  ref={nameRef}
                  id={fieldId('name')}
                  name="name"
                  className={styles.nameInput}
                  maxLength={NOTE_NAME_MAX}
                  autoComplete="organization"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setServerErrors({});
                  }}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={describedBy('name')}
                />
                {errors.name && (
                  <p id={errorId('name')} className={styles.error}>
                    {errors.name}
                  </p>
                )}
              </div>
              <span className={styles.stampPreview} aria-hidden="true">
                {today}
              </span>
            </div>

            <fieldset className={styles.papers}>
              <legend className={styles.label}>Paper</legend>
              <div className={styles.swatches}>
                {PAPERS.map((option) => (
                  <label key={option} className={styles.swatchLabel}>
                    <input
                      type="radio"
                      name="paper"
                      value={option}
                      checked={paper === option}
                      onChange={() => setPaper(option)}
                      className={styles.swatchInput}
                    />
                    <span className={cx(styles.swatch, styles[`swatch-${option}`])} aria-hidden="true" />
                    <span className="sr-only">{PAPER_LABELS[option]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className={styles.honeypot} aria-hidden="true">
              <label>
                Leave this empty
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
          </m.div>

          <p className={styles.hint}>The date gets stamped on when you pin it.</p>
          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}
          <div className={styles.buttons}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submit} disabled={sending}>
              {sending ? 'Pinning…' : 'Pin it to the wall'}
              <Arrow />
            </button>
          </div>
        </form>
      </div>
    </m.div>,
    document.body
  );
}
