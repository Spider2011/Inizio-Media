import type { StaticImageData } from 'next/image';

/* Grounds for `.im-ph` image placeholders (design system: --blue, --navy, --butter, --paper, --white). */
export type PlaceholderTone = 'pale' | 'blue' | 'navy' | 'butter' | 'paper' | 'white';

export type Photo = { image: StaticImageData; alt: string };
