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

export const NAV_LINKS = [
  { id: 'about', label: 'About Us' },
  { id: 'services', label: 'Our Services' },
  { id: 'work', label: 'Our Work' },
  { id: 'events', label: 'Events & Weddings' },
  { id: 'clientele', label: 'Clientele' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'contact', label: 'Contact' }
] as const;

export const NAV_IDS: readonly string[] = NAV_LINKS.map((link) => link.id);
