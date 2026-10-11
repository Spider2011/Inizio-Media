/* SAMPLE DATA — replace client names, images and descriptions with real projects (with permission).
   Give a card a `result` only with a real, sourced figure (WorkCard rule: never invent a number). */
import type { PlaceholderTone, Photo } from './types';

export type WorkItem = {
  id: string;
  client: string;
  tags: readonly string[];
  description: string;
  href: string;
  tone: PlaceholderTone;
  photo?: Photo;
  result?: { metric: string; label: string };
};

export const WORK_IS_SAMPLE = true;

export const WORK: readonly WorkItem[] = [
  {
    id: 'sample-1',
    client: 'Client Name',
    tags: ['Branding', 'Social'],
    description: 'Identity refresh and a three-month launch calendar for a lifestyle label.',
    href: 'https://instagram.com/iniziomedia_',
    tone: 'pale'
  },
  {
    id: 'sample-2',
    client: 'Client Name',
    tags: ['Performance', 'Content'],
    description: 'Always-on Meta campaigns with weekly creative rotation.',
    href: 'https://instagram.com/iniziomedia_',
    tone: 'blue'
  },
  {
    id: 'sample-3',
    client: 'Client Name',
    tags: ['Website', 'SEO'],
    description: 'A new site and search plan that turned a catalogue into a storefront.',
    href: 'https://instagram.com/iniziomedia_',
    tone: 'navy'
  }
];
