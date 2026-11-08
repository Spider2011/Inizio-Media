import type { Metadata } from 'next';
import { Contact } from '@/components/sections/Contact';
import { PageShell } from '@/components/site/PageShell';
import { getPage } from '@/content/pages';
import { SHARE_IMAGE } from '@/lib/share-image';

const page = getPage('contact');

export const metadata: Metadata = {
  title: page.label,
  description: page.description,
  alternates: { canonical: page.href },
  openGraph: { title: `${page.label} · Inizio Media`, description: page.description, url: page.href, images: [SHARE_IMAGE] }
};

export default function ContactPage() {
  return (
    <PageShell id="contact">
      <Contact />
    </PageShell>
  );
}
