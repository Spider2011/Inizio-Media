import { About } from '@/components/sections/About';
import { Clients } from '@/components/sections/Clients';
import { Collaborate } from '@/components/sections/Collaborate';
import { Contact } from '@/components/sections/Contact';
import { Events } from '@/components/sections/Events';
import { Hero } from '@/components/sections/Hero';
import { KeywordBand } from '@/components/sections/KeywordBand';
import { Process } from '@/components/sections/Process';
import { Results } from '@/components/sections/Results';
import { Services } from '@/components/sections/Services';
import { Testimonials } from '@/components/sections/Testimonials';
import { Work } from '@/components/sections/Work';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { SITE } from '@/content/site';

/* Re-render daily so the footer year stays current on a statically served page. */
export const revalidate = 86400;

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  slogan: 'We Build Brands.',
  email: SITE.email,
  telephone: SITE.phone.display,
  address: { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressCountry: 'IN' },
  sameAs: [SITE.instagram.url]
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, '\\u003c') }}
      />
      <Header />
      <main id="main">
        <Hero />
        <KeywordBand />
        <Results />
        <About />
        <Services />
        <Process />
        <Work />
        <Collaborate />
        <Events />
        <Clients />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
