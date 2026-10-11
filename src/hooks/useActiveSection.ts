'use client';

import { useEffect, useState } from 'react';

/* Scroll-spy: the id of the section crossing a thin band just above the middle of the viewport. */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    let intersecting = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        const next = new Set(intersecting);
        for (const entry of entries) {
          if (entry.isIntersecting) next.add(entry.target.id);
          else next.delete(entry.target.id);
        }
        intersecting = next;
        setActive(ids.find((id) => next.has(id)) ?? null);
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
