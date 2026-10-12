import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cursor } from '@/components/fx/Cursor';
import { IntroProvider } from '@/components/fx/Intro';
import { SmoothScroll } from '@/components/fx/SmoothScroll';
import { Providers } from '@/components/providers/Providers';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { SITE } from '@/content/site';
import { SITE_URL } from '@/lib/site-url';
import { bodyFont, displayFont } from '@/styles/fonts';
import 'lenis/dist/lenis.css';
import '@/styles/globals.css';

/* Re-render daily so the footer year stays current on statically served pages. */
export const revalidate = 86400;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Inizio Media · Digital Marketing & Branding Agency, Mumbai',
    template: '%s · Inizio Media'
  },
  description: SITE.description,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: SITE.name,
    title: 'Inizio Media · We Build Brands',
    description: 'Giving new beginnings to your digital presence. A Mumbai-based digital marketing and branding agency.'
  },
  twitter: { card: 'summary' }
};

export const viewport: Viewport = {
  themeColor: '#071c40'
};

/* Without JavaScript: no preloader, and everything that would animate in is simply shown. */
const NO_SCRIPT_CSS =
  '.preloader{display:none!important}[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}';

const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE_URL,
  slogan: 'We Build Brands.',
  email: SITE.email,
  telephone: SITE.phone.display,
  address: { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressCountry: 'IN' },
  sameAs: [SITE.instagram.url]
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <noscript>
          <style>{NO_SCRIPT_CSS}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION).replace(/</g, '\\u003c') }}
        />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Providers>
          <IntroProvider>
            <SmoothScroll />
            <Cursor />
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </IntroProvider>
        </Providers>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
