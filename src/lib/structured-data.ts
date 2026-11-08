/* The site-wide structured data (schema.org JSON-LD) that tells Google who Inizio Media is.
   - WebSite: Google uses its `name` as the site name above the search result.
   - Organization: logo, description, area and contacts, which set this agency apart from
     other businesses with a similar name. */
import { SERVICE_CARDS } from '@/content/services';
import { SITE } from '@/content/site';

/** public/logo.png: the full-colour logo, sized for search results. */
const LOGO = { path: '/logo.png', width: 600, height: 253 } as const;

type Node = Record<string, unknown> & { '@type': string; '@id': string };

export function siteStructuredData(siteUrl: string): { '@context': string; '@graph': Node[] } {
  const orgId = `${siteUrl}/#organization`;
  const logo = { '@type': 'ImageObject', url: `${siteUrl}${LOGO.path}`, width: LOGO.width, height: LOGO.height };

  const organization: Node = {
    '@type': 'Organization',
    '@id': orgId,
    name: SITE.name,
    url: siteUrl,
    logo,
    image: logo,
    description: SITE.description,
    slogan: 'We Build Brands.',
    email: SITE.email,
    telephone: SITE.phone.display,
    contactPoint: SITE.phones.map((phone) => ({ '@type': 'ContactPoint', telephone: phone.display, contactType: 'customer service' })),
    address: { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressRegion: 'Maharashtra', addressCountry: 'IN' },
    areaServed: { '@type': 'City', name: 'Mumbai' },
    knowsAbout: SERVICE_CARDS.map((service) => service.title),
    sameAs: [SITE.instagram.url, SITE.linkedin.url]
  };

  const website: Node = {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: SITE.name,
    alternateName: ['Inizio Media Mumbai', 'iniziomedia.in'],
    url: siteUrl,
    inLanguage: 'en-IN',
    publisher: { '@id': orgId }
  };

  return { '@context': 'https://schema.org', '@graph': [website, organization] };
}
