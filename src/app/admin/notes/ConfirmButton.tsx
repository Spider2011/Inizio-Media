'use client';

import type { ReactNode } from 'react';

type Props = { message: string; className?: string; children: ReactNode };

/* A submit button that asks first, for actions that cannot be undone. */
export function ConfirmButton({ message, className, children }: Props) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
