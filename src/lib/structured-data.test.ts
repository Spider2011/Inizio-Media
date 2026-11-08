import { describe, expect, it } from 'vitest';
import { SITE } from '@/content/site';
import { siteStructuredData } from './structured-data';

const URL_ = 'https://www.iniziomedia.in';
const data = siteStructuredData(URL_);
const byType = (type: string) => data['@graph'].find((node) => node['@type'] === type)!;

describe('siteStructuredData', () => {
  it('names the website "Inizio Media" so Google can show it as the site name', () => {
    const site = byType('WebSite');
    expect(site.name).toBe('Inizio Media');
    expect(site.url).toBe(URL_);
    expect(site.alternateName).toContain('iniziomedia.in');
  });

  it('describes the organisation with its logo, description, area and contacts', () => {
    const org = byType('Organization');
    expect(org.logo).toMatchObject({ '@type': 'ImageObject', url: `${URL_}/logo.png`, width: 600, height: 253 });
    expect(org.description).toBe(SITE.description);
    expect(org.areaServed).toMatchObject({ '@type': 'City', name: 'Mumbai' });
    expect(org.email).toBe(SITE.email);
    expect(org.sameAs).toEqual([SITE.instagram.url, SITE.linkedin.url]);
    expect(org.knowsAbout).toContain('Branding');
  });

  it('links the website to the organisation that publishes it', () => {
    expect(byType('WebSite').publisher).toEqual({ '@id': byType('Organization')['@id'] });
  });
});
