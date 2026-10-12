import type { Metadata } from 'next';
import { Collaborate } from '@/components/sections/Collaborate';
import { Results } from '@/components/sections/Results';
import { Testimonials } from '@/components/sections/Testimonials';
import { PageShell } from '@/components/site/PageShell';
import { getPage } from '@/content/pages';

const page = getPage('testimonials');

export const metadata: Metadata = {
  title: page.label,
  description: page.description,
  alternates: { canonical: page.href },
  openGraph: { title: `${page.label} · Inizio Media`, description: page.description, url: page.href }
};

export default function TestimonialsPage() {
  return (
    <PageShell id="testimonials">
      <Testimonials />
      <Results />
      <Collaborate />
    </PageShell>
  );
}
