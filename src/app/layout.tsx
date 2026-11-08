import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cursor } from '@/components/fx/Cursor';
import { IntroProvider } from '@/components/fx/Intro';
import { LoaderScripts } from '@/components/fx/LoaderScripts';
import { SmoothScroll } from '@/components/fx/SmoothScroll';
import { Providers } from '@/components/providers/Providers';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { SITE } from '@/content/site';
import { SITE_URL } from '@/lib/site-url';
import { siteStructuredData } from '@/lib/structured-data';
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

/* Without JavaScript: no loader runs, and everything that would animate in is simply shown. */
const NO_SCRIPT_CSS = '[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}';

const STRUCTURED_DATA = siteStructuredData(SITE_URL);

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    /* The loader's head script adds a class and an inline style to <html> before React hydrates. */
    <html lang="en-IN" className={`${displayFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <head>
        <LoaderScripts />
      </head>
      <body>
        <noscript>
          <style>{NO_SCRIPT_CSS}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, '\\u003c') }}
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
