import { NAV_LINKS, type NavId } from './site';

/* Copy for each inner page's hero and metadata. The headline's accent words get the shine effect. */
export type PageInfo = {
  id: NavId;
  href: string;
  label: string;
  /** Position in the navigation, 1-based. */
  index: number;
  title: string;
  accent: readonly string[];
  lead: string;
  description: string;
};

type PageCopy = Omit<PageInfo, 'id' | 'href' | 'label' | 'index'>;

const COPY: Record<NavId, PageCopy> = {
  about: {
    title: 'We build beginnings.',
    accent: ['beginnings.'],
    lead: 'Inizio means beginning. We are a Mumbai-based digital marketing and branding agency that takes brands from the first idea to the last report.',
    description: 'About Inizio Media, a Mumbai-based digital marketing and branding agency: who we are, how we work and what we have built.'
  },
  services: {
    title: 'Everything a brand needs to grow.',
    accent: ['grow.'],
    lead: 'Strategy, branding, content, social, performance and growth. Fourteen services, one team.',
    description: 'Branding, social media, content, performance marketing, websites and more from Inizio Media, Mumbai.'
  },
  work: {
    title: 'Work that moves the numbers.',
    accent: ['numbers.'],
    lead: 'Launches, campaigns and brand systems, measured in reach, engagement and growth.',
    description: 'Selected work and results from Inizio Media, a digital marketing and branding agency in Mumbai.'
  },
  events: {
    title: 'Moments worth keeping.',
    accent: ['keeping.'],
    lead: 'Weddings, sangeets and brand launches: candid coverage, edited fast and shared live.',
    description: 'Event and wedding coverage by Inizio Media: candid photography and content, edited fast and shared live.'
  },
  clientele: {
    title: 'The company we keep.',
    accent: ['keep.'],
    lead: 'From founders’ first launches to city institutions, these are the brands that began with us.',
    description: 'The brands Inizio Media has worked with, from first-time founders to established names in Mumbai.'
  },
  testimonials: {
    title: 'Kind words, real results.',
    accent: ['results.'],
    lead: 'What the brands we work with say about working with us.',
    description: 'What clients say about working with Inizio Media, a digital marketing and branding agency in Mumbai.'
  },
  contact: {
    title: 'Start something new.',
    accent: ['new.'],
    lead: 'Tell us about your brand, or just say hello. Every brand needs a beginning.',
    description: 'Contact Inizio Media in Mumbai: email, phone, Instagram, or send an enquiry about your brand.'
  }
};

export const PAGES: readonly PageInfo[] = NAV_LINKS.map((link, i) => ({
  id: link.id,
  href: link.href,
  label: link.label,
  index: i + 1,
  ...COPY[link.id]
}));

export function getPage(id: NavId): PageInfo {
  const page = PAGES.find((p) => p.id === id);
  if (!page) throw new Error(`Unknown page: ${id}`);
  return page;
}

/* The page after this one in the navigation, wrapping round to the first. */
export function nextPage(id: NavId): PageInfo {
  const i = PAGES.findIndex((p) => p.id === id);
  return PAGES[(i + 1) % PAGES.length];
}
