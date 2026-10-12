import { About } from '@/components/sections/About';
import { Clients } from '@/components/sections/Clients';
import { Collaborate } from '@/components/sections/Collaborate';
import { Events } from '@/components/sections/Events';
import { Hero } from '@/components/sections/Hero';
import { KeywordBand } from '@/components/sections/KeywordBand';
import { Results } from '@/components/sections/Results';
import { Services } from '@/components/sections/Services';
import { Testimonials } from '@/components/sections/Testimonials';
import { Work } from '@/components/sections/Work';

/* The home page is the overview: a taste of each part of the site, each with a way into its own page. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <KeywordBand />
      <Results more={{ href: '/work', label: 'See the work behind them' }} />
      <About more={{ href: '/about', label: 'More about us' }} />
      <Services more={{ href: '/services', label: 'Explore all services' }} />
      <Work more={{ href: '/work', label: 'View all work' }} />
      <Collaborate />
      <Events more={{ href: '/events', label: 'Open the gallery' }} />
      <Clients more={{ href: '/clientele', label: 'Meet our clientele' }} />
      <Testimonials more={{ href: '/testimonials', label: 'Read every review' }} />
    </>
  );
}
