/* iniziomedia.in used to run a WordPress site, and search engines still list some of its
   addresses (the default "Hello world!" post, a page called "iniziome", date and category
   archives). Each one points permanently at the closest page of this site, so old results land
   somewhere useful and search engines replace them on their next crawl. */

export type LegacyRedirect = { source: string; destination: string; permanent: true };

const to = (destination: string, sources: readonly string[]): LegacyRedirect[] =>
  sources.map((source) => ({ source, destination, permanent: true }));

export const LEGACY_REDIRECTS: readonly LegacyRedirect[] = [
  ...to('/', [
    '/hello-world',
    '/sample-page',
    '/iniziome',
    '/home',
    '/index.php',
    '/blog/:path*',
    '/category/:path*',
    '/tag/:path*',
    '/author/:path*',
    '/feed',
    '/comments/:path*',
    // WordPress date permalinks such as /2024/08/13/hello-world/
    '/:year(\\d{4})/:rest*'
  ]),
  ...to('/about', ['/about-us', '/who-we-are']),
  ...to('/services', ['/our-services', '/service']),
  ...to('/work', ['/our-work', '/portfolio', '/projects']),
  ...to('/clientele', ['/clients', '/our-clients']),
  ...to('/contact', ['/contact-us', '/get-in-touch'])
];
