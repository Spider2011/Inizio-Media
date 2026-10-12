/* Contact details and navigation, exactly as the design system's README sets them. */

export const SITE = {
  name: 'Inizio Media',
  description:
    'Inizio Media is a Mumbai-based digital marketing and branding agency. Strategy · Branding · Content · Social · Performance · Growth. We build brands.',
  email: 'teaminizio.media@gmail.com',
  phone: { display: '+91 90823 22109', href: 'tel:+919082322109' },
  instagram: { handle: '@iniziomedia_', url: 'https://instagram.com/iniziomedia_' },
  location: 'Mumbai, India',
  keywords: ['Strategy', 'Branding', 'Content', 'Social', 'Performance', 'Growth']
} as const;

/* Every navigation entry is its own page. */
export const NAV_LINKS = [
  { id: 'about', label: 'About Us', href: '/about' },
  { id: 'services', label: 'Our Services', href: '/services' },
  { id: 'work', label: 'Our Work', href: '/work' },
  { id: 'events', label: 'Events & Weddings', href: '/events' },
  { id: 'clientele', label: 'Clientele', href: '/clientele' },
  { id: 'testimonials', label: 'Testimonials', href: '/testimonials' },
  { id: 'contact', label: 'Contact', href: '/contact' }
] as const;

export type NavId = (typeof NAV_LINKS)[number]['id'];

/* True when `pathname` is the link's page (or a page beneath it). */
export function isCurrentPage(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
