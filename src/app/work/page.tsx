import type { Metadata } from 'next';
import { Clients } from '@/components/sections/Clients';
import { Collaborate } from '@/components/sections/Collaborate';
import { Results } from '@/components/sections/Results';
import { Work } from '@/components/sections/Work';
import { PageShell } from '@/components/site/PageShell';
import { getPage } from '@/content/pages';
import { WORK_IS_SAMPLE } from '@/content/work';

const page = getPage('work');

export const metadata: Metadata = {
  title: page.label,
  description: page.description,
  alternates: { canonical: page.href },
  openGraph: { title: `${page.label} · Inizio Media`, description: page.description, url: page.href }
};

/* Case-study cards appear once real projects replace the sample data in content/work.ts. Until then the
   page shows the real results and the brands behind them. */
export default function WorkPage() {
  return (
    <PageShell id="work">
      {!WORK_IS_SAMPLE && <Work />}
      <Results />
      <Clients />
      <Collaborate />
    </PageShell>
  );
}
