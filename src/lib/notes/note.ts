/* The beginnings wall: note rules shared by the pin form (client), /api/notes and the admin page (server). */
import * as z from 'zod/mini';

export const PAPERS = ['white', 'butter', 'pale', 'navy'] as const;
export type Paper = (typeof PAPERS)[number];

export const PAPER_LABELS: Record<Paper, string> = {
  white: 'White paper',
  butter: 'Butter paper',
  pale: 'Pale blue paper',
  navy: 'Navy paper'
};

export const NOTE_TEXT_MAX = 220;
export const NOTE_NAME_MAX = 60;

export type Note = {
  id: string;
  text: string;
  name: string;
  paper: Paper;
  /** ISO timestamp, always set on the server. */
  createdAt: string;
  approved: boolean;
};

export const NOTE_MESSAGES = {
  textMissing: 'Please write a few words about your experience.',
  nameMissing: "Please add your name or your company's name.",
  textTooLong: `Keep your note to ${NOTE_TEXT_MAX} characters.`,
  nameTooLong: `Keep the name to ${NOTE_NAME_MAX} characters.`
} as const;

/* Control characters, plus invisible and direction-changing ones (zero-width spaces, bidi overrides,
   the byte-order mark), which could make a blank-looking name or text that reads differently from what was typed. */
const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff]/g;

/* Notes are plain text: tags go, stray angle brackets go, and any run of whitespace becomes one space. */
export function cleanText(value: string): string {
  return value
    .replace(/<\/?[a-zA-Z!][^>]*>/g, '')
    .replace(/[<>]/g, ' ')
    .replace(CONTROL_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const clean = () => z.overwrite(cleanText);

const noteSchema = z.object({
  text: z
    .string(NOTE_MESSAGES.textMissing)
    .check(clean(), z.minLength(1, NOTE_MESSAGES.textMissing), z.maxLength(NOTE_TEXT_MAX, NOTE_MESSAGES.textTooLong)),
  name: z
    .string(NOTE_MESSAGES.nameMissing)
    .check(clean(), z.minLength(1, NOTE_MESSAGES.nameMissing), z.maxLength(NOTE_NAME_MAX, NOTE_MESSAGES.nameTooLong)),
  paper: z.catch(z.enum(PAPERS), 'white')
});

export type NoteInput = z.infer<typeof noteSchema>;
export type NoteField = 'text' | 'name';
export type NoteFieldErrors = Partial<Record<NoteField, string>>;
export type NoteValidation = { success: true; data: NoteInput } | { success: false; errors: NoteFieldErrors };

const ALL_MISSING: NoteFieldErrors = { text: NOTE_MESSAGES.textMissing, name: NOTE_MESSAGES.nameMissing };

export function validateNote(input: unknown): NoteValidation {
  const result = z.safeParse(noteSchema, input);
  if (result.success) return { success: true, data: result.data };

  const errors = result.error.issues.reduce<NoteFieldErrors>((acc, issue) => {
    const field = issue.path[0] as NoteField | undefined;
    if (field === undefined) return { ...ALL_MISSING, ...acc };
    return acc[field] ? acc : { ...acc, [field]: issue.message };
  }, {});
  return { success: false, errors };
}
