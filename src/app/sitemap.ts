import type { MetadataRoute } from 'next';
import { PAGES } from '@/content/pages';
import { SITE_URL } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    ...PAGES.map((page) => ({ url: `${SITE_URL}${page.href}`, changeFrequency: 'monthly' as const, priority: 0.8 }))
  ];
}
