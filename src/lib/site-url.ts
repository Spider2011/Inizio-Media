/* The site's public origin, for canonical URLs, the sitemap and social cards.
   Set NEXT_PUBLIC_SITE_URL once a custom domain is live; on Vercel the production domain is used until then. */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl();
