/* The projects on the Our Work wheel and in the grid below it, in wheel order.

   UNTIL THE REELS ARRIVE every entry is a real client from the Clientele list, shown as its logo on a
   9:16 card and linking to its Instagram. Nothing here is invented: no titles, no figures.

   To add a real project: give it a `cover` (a 9:16 still, e.g. `import cover from
   '@/assets/work/<slug>.jpg'`), a `preview` (a short, muted 9:16 mp4 under ~1.5 MB in /public/work/),
   a real `title` and `category` (Reels, Branding, Ad film, Social…) and its case-study `href`.
   Cards without a cover fall back to the client's logo; cards without a preview never load video. */
import type { StaticImageData } from 'next/image';
import { CLIENTS, instagramUrl } from '@/content/clients';

export type WorkProject = {
  slug: string;
  client: string;
  title: string;
  /** A short tag: Reels, Branding, Ad film, Social… */
  category: string;
  /** 9:16 still. Optional only while the reels are on their way. */
  cover?: StaticImageData | string;
  /** Short muted 9:16 clip (mp4, under ~1.5 MB). */
  preview?: string;
  /** The case study, or for now the client's Instagram. */
  href: string;
  /** Shown on the card face when there is no cover yet. */
  logo?: StaticImageData;
};

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/* Clients with a logo only: a name-only client has nothing to put on a card face yet. */
export const WORK_PROJECTS: readonly WorkProject[] = CLIENTS.filter((client) => client.instagram && client.logo).map((client) => ({
  slug: slugify(client.name),
  client: client.name,
  title: `@${client.instagram}`,
  category: 'Client',
  href: instagramUrl(client.instagram!),
  logo: client.logo
}));

/** Links that leave the site open in a new tab. */
export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

export function coverSrc(cover: StaticImageData | string | undefined): string | undefined {
  if (!cover) return undefined;
  return typeof cover === 'string' ? cover : cover.src;
}
