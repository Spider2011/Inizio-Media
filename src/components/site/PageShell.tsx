import type { ReactNode } from 'react';
import type { NavId } from '@/content/site';
import { getPage, nextPage } from '@/content/pages';
import { NextPage } from './NextPage';
import { PageHero } from './PageHero';

/* Every inner page: its hero, its sections, then the way on to the next page. */
export function PageShell({ id, children }: { id: NavId; children: ReactNode }) {
  return (
    <>
      <PageHero page={getPage(id)} />
      <div id="content">{children}</div>
      <NextPage page={nextPage(id)} />
    </>
  );
}
