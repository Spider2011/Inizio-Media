/* A pushpin glyph for the "Pin your note" buttons, drawn on the site's 24px icon grid. */
export function Pushpin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M9 3h6M10 3v5.5L6.5 13h11L14 8.5V3M12 13v8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
