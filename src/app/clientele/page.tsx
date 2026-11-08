import type { Metadata } from 'next';
import { Clients } from '@/components/sections/Clients';
import { Testimonials } from '@/components/sections/Testimonials';
import { PageShell } from '@/components/site/PageShell';
import { getPage } from '@/content/pages';
import { TESTIMONIALS_ARE_SAMPLE } from '@/content/testimonials';
import { SHARE_IMAGE } from '@/lib/share-image';

const page = getPage('clientele');

export const metadata: Metadata = {
  title: page.label,
  description: page.description,
  alternates: { canonical: page.href },
  openGraph: { title: `${page.label} · Inizio Media`, description: page.description, url: page.href, images: [SHARE_IMAGE] }
};

/* Client quotes appear once real, approved testimonials replace the sample data in content/testimonials.ts. */
export default function ClientelePage() {
  return (
    <PageShell id="clientele">
      <Clients />
      {!TESTIMONIALS_ARE_SAMPLE && <Testimonials />}
    </PageShell>
  );
}
