import type { ReactNode } from 'react';
import type { NavId } from '@/content/site';
import { getPage, nextPage } from '@/content/pages';
import { NextPage } from './NextPage';
import { PageHero } from './PageHero';

/* Every inner page: its hero, its sections, then the way on to the next page. A page may bring its
   own hero (Our Work has the project wheel); it must keep id="top" and the page's h1. */
export function PageShell({ id, hero, children }: { id: NavId; hero?: ReactNode; children: ReactNode }) {
  return (
    <>
      {hero ?? <PageHero page={getPage(id)} />}
      <div id="content">{children}</div>
      <NextPage page={nextPage(id)} />
    </>
  );
}
