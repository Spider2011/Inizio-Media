/* Display copy as parts, so one phrase can carry the design system's accent colour
   ("Giving <em class="im-accent">New Beginnings</em> to…") and words can animate one by one. */

export type TextPart = string | { accent: string };

export type TextToken = { kind: 'word'; text: string; accent: boolean } | { kind: 'break' };

export function tokenize(parts: readonly TextPart[]): TextToken[] {
  return parts.flatMap((part) => {
    const accent = typeof part !== 'string';
    const text = typeof part === 'string' ? part : part.accent;
    return text.split('\n').flatMap((line, lineIndex): TextToken[] => {
      const words = line
        .split(/\s+/)
        .filter(Boolean)
        .map((word): TextToken => ({ kind: 'word', text: word, accent }));
      return lineIndex > 0 ? [{ kind: 'break' }, ...words] : words;
    });
  });
}

export function plainText(parts: readonly TextPart[]): string {
  return parts
    .map((part) => (typeof part === 'string' ? part : part.accent))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}
