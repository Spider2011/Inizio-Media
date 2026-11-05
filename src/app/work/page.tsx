import type { Metadata } from 'next';
import { Collaborate } from '@/components/sections/Collaborate';
import { Results } from '@/components/sections/Results';
import { PageShell } from '@/components/site/PageShell';
import { WorkGrid } from '@/components/work/WorkGrid';
import { WorkWheel } from '@/components/work/WorkWheel';
import { getPage } from '@/content/pages';
import { GALLERY } from '@/data/gallery';
import { WORK_PROJECTS } from '@/data/work';

const page = getPage('work');

export const metadata: Metadata = {
  title: page.label,
  description: page.description,
  alternates: { canonical: page.href },
  openGraph: { title: `${page.label} · Inizio Media`, description: page.description, url: page.href }
};

/* The project wheel up top, every project in a plain grid below, then the results. The logo wall
   lives on the Clientele page only. */
export default function WorkPage() {
  return (
    <PageShell id="work" hero={<WorkWheel page={page} projects={WORK_PROJECTS} />}>
      <WorkGrid images={GALLERY} />
      <Results />
      <Collaborate />
    </PageShell>
  );
}
