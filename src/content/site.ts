/* Contact details and navigation, exactly as the design system's README sets them. */

/* The studio's numbers; the first is the main line (Book a call, structured data). */
const PHONES = [
  { display: '+91 90823 22109', href: 'tel:+919082322109' },
  { display: '+91 84337 57541', href: 'tel:+918433757541' }
] as const;

export const SITE = {
  name: 'Inizio Media',
  description:
    'Inizio Media is a Mumbai-based digital marketing and branding agency. Strategy · Branding · Content · Social · Performance · Growth. We build brands.',
  /* The address shown on the site. */
  email: 'business@iniziomedia.in',
  /* Where form enquiries go (unless ENQUIRY_TO is set): the inbox that receives mail today, as
     iniziomedia.in has no mail (MX) records yet. */
  enquiryInbox: 'teaminizio.media@gmail.com',
  phone: PHONES[0],
  phones: PHONES,
  instagram: { handle: '@iniziomedia_', url: 'https://www.instagram.com/iniziomedia_/' },
  linkedin: { name: 'Inizio Media', url: 'https://www.linkedin.com/company/teaminiziomedia/' },
  location: 'Mumbai, India',
  keywords: ['Strategy', 'Branding', 'Content', 'Social', 'Performance', 'Growth']
} as const;

/* Every navigation entry is its own page. */
export const NAV_LINKS = [
  { id: 'about', label: 'About Us', href: '/about' },
  { id: 'services', label: 'Our Services', href: '/services' },
  { id: 'work', label: 'Our Work', href: '/work' },
  { id: 'clientele', label: 'Clientele', href: '/clientele' },
  { id: 'contact', label: 'Contact', href: '/contact' }
] as const;

export type NavId = (typeof NAV_LINKS)[number]['id'];

/* True when `pathname` is the link's page (or a page beneath it). */
export function isCurrentPage(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
