import type { StockPhoto } from '@/lib/unsplash';

/* The thirteen services, in the design system's order, three keywords each, with a stock photo
   (Unsplash) that illustrates the service. */

export type ServiceCard = { title: string; keys: readonly [string, string, string]; photo: StockPhoto };

export const SERVICE_CARDS: readonly ServiceCard[] = [
  {
    title: 'Branding',
    keys: ['Strategy', 'Visual Identity', 'Guidelines'],
    photo: { id: 'photo-1590102425828-07f1fa2ed1f6', alt: 'Brand stationery and identity samples laid out on a desk', local: '/services/branding.webp' }
  },
  {
    title: 'Social Media Management',
    keys: ['Strategy', 'Content', 'Community'],
    photo: { id: 'photo-1724862936518-ae7fcfc052c1', alt: 'A phone showing a folder of social media apps', local: '/services/social-media-management.webp' }
  },
  {
    title: 'Content Marketing',
    keys: ['Ideation', 'Creation', 'Distribution'],
    photo: { id: 'photo-1664277497095-424e085175e8', alt: 'A creator recording at a desk in a small studio', local: '/services/content-marketing.webp' }
  },
  {
    title: 'Performance Marketing',
    keys: ['Campaigns', 'Targeting', 'Optimisation'],
    photo: { id: 'photo-1644143153646-f36282dfb953', alt: 'A phone showing a rising campaign performance graph', local: '/services/performance-marketing.webp' }
  },
  {
    title: 'Website Development',
    keys: ['Design', 'Development', 'Maintenance'],
    photo: { id: 'photo-1618477388954-7852f32655ec', alt: 'Hands typing code on a laptop beside a potted plant', local: '/services/website-development.webp' }
  },
  {
    title: 'SEO',
    keys: ['Strategy', 'Optimisation', 'Growth'],
    photo: { id: 'photo-1726066012698-bb7a3abce786', alt: 'A search engine open on a laptop, with a phone in hand', local: '/services/seo.webp' }
  },
  {
    title: 'Offline/Print Marketing',
    keys: ['Campaigns', 'Print Design', 'Collateral'],
    photo: { id: 'photo-1718670013939-954787e56385', alt: 'Printed brochures spread across a table', local: '/services/offline-print-marketing.webp' }
  },
  {
    title: 'WhatsApp Marketing',
    keys: ['Campaigns', 'Automation', 'Engagement'],
    photo: { id: 'photo-1760349748488-bd2a7ef25ea0', alt: 'Hands typing a message on a smartphone', local: '/services/whatsapp-marketing.webp' }
  },
  {
    title: 'Product Shoot',
    keys: ['Photography', 'Videography', 'Post-Production'],
    photo: { id: 'photo-1763970586854-62e14f07ae35', alt: 'A product lit on a set in a photo studio', local: '/services/product-shoot.webp' }
  },
  {
    title: 'Email Marketing',
    keys: ['Strategy', 'Campaigns', 'Automation'],
    photo: { id: 'photo-1541560052-3744e48ab80b', alt: 'Reading an email newsletter on a phone above a keyboard', local: '/services/email-marketing.webp' }
  },
  {
    title: 'Event & Wedding Coverage',
    keys: ['Coverage', 'Content', 'Live Updates'],
    photo: { id: 'photo-1610173827043-9db50e0d8ef9', alt: 'A bride in a red outfit with gold jewellery and henna', local: '/services/event-wedding-coverage.webp' }
  },
  {
    title: 'Influencer Marketing',
    keys: ['Strategy', 'Collaborations', 'Campaigns'],
    photo: { id: 'photo-1658207951097-96f86cc0a1c8', alt: 'A creator filmed on a phone for a social video' }
  },
  {
    title: 'Analytics & Reporting',
    keys: ['Tracking', 'Insights', 'Optimisation'],
    photo: { id: 'photo-1707762890671-52ef6d6f51e7', alt: 'Charts on a monitor beside printed reports', local: '/services/analytics-reporting.webp' }
  }
];
