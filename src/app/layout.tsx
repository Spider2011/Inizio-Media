import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cursor } from '@/components/fx/Cursor';
import { IntroProvider } from '@/components/fx/Intro';
import { SmoothScroll } from '@/components/fx/SmoothScroll';
import { Providers } from '@/components/providers/Providers';
import { SITE } from '@/content/site';
import { bodyFont, displayFont } from '@/styles/fonts';
import 'lenis/dist/lenis.css';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Inizio Media · Digital Marketing & Branding Agency, Mumbai',
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <noscript>
          <style>{NO_SCRIPT_CSS}</style>
        </noscript>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Providers>
          <IntroProvider>
            <SmoothScroll />
            <Cursor />
            {children}
          </IntroProvider>
        </Providers>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
