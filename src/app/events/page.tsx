import type { Metadata } from 'next';
import { Collaborate } from '@/components/sections/Collaborate';
import { Events } from '@/components/sections/Events';
import { PageShell } from '@/components/site/PageShell';
import { getPage } from '@/content/pages';

const page = getPage('events');

export const metadata: Metadata = {
  title: page.label,
  description: page.description,
  alternates: { canonical: page.href },
  openGraph: { title: `${page.label} · Inizio Media`, description: page.description, url: page.href }
};

export default function EventsPage() {
  return (
    <PageShell id="events">
      <Events />
      <Collaborate />
    </PageShell>
  );
}
