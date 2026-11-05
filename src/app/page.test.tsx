import { screen, within } from '@testing-library/react';
import type { Metadata } from 'next';
import type { ComponentType, ImgHTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CLIENTS } from '@/content/clients';
import { GALLERY } from '@/data/gallery';
import { WORK_PROJECTS } from '@/data/work';
import { getPage, nextPage, PAGES } from '@/content/pages';
import { SITE, type NavId } from '@/content/site';
import { renderWithMotion as render } from '@/test-utils/render';
import AboutPage, { metadata as aboutMeta } from './about/page';
import ClientelePage, { metadata as clienteleMeta } from './clientele/page';
import ContactPage, { metadata as contactMeta } from './contact/page';
import HomePage from './page';
import ServicesPage, { metadata as servicesMeta } from './services/page';
import WorkPage, { metadata as workMeta } from './work/page';

/* Under Vite, static image imports are URL strings without dimensions; render a plain <img>. */
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string | { src: string } }) => {
    const { unoptimized, preload, fill, ...rest } = props as Record<string, unknown>;
    void unoptimized;
    void preload;
    void fill;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === 'string' ? src : src.src} alt={alt} {...(rest as ImgHTMLAttributes<HTMLImageElement>)} />;
  }
}));

const INNER: Record<NavId, { Page: ComponentType; meta: Metadata; sections: readonly string[] }> = {
  about: { Page: AboutPage, meta: aboutMeta, sections: ['about', 'results-title', 'process', 'collab-title'] },
  services: { Page: ServicesPage, meta: servicesMeta, sections: ['services', 'process', 'What we do, in brief', 'collab-title'] },
  work: { Page: WorkPage, meta: workMeta, sections: ['projects', 'results-title', 'collab-title'] },
  clientele: { Page: ClientelePage, meta: clienteleMeta, sections: ['clientele'] },
  contact: { Page: ContactPage, meta: contactMeta, sections: ['contact'] }
};

function sectionKeys(root: Element): string[] {
  return Array.from(root.querySelectorAll(':scope > section')).map(
    (s) => s.id || s.getAttribute('aria-labelledby') || s.getAttribute('aria-label') || '?'
  );
}

/* Rendering whole pages in jsdom is slow on a cold start, so these get a longer timeout. */
describe('Home page', { timeout: 30_000 }, () => {
  it('stays short: the hero, the keyword band, then the index of pages', () => {
    const { container } = render(<HomePage />);
    expect(sectionKeys(container)).toEqual(['top', 'What we do, in brief', 'explore']);
  });

  it('lists every page in the index, in navigation order, with its teaser', () => {
    render(<HomePage />);
    const index = screen.getByRole('region', { name: 'Where to next?' });
    const links = within(index).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(PAGES.map((page) => page.href));
    PAGES.forEach((page) => expect(within(index).getByText(page.teaser)).toBeInTheDocument());
  });

  it('has one h1 and a way into every page', () => {
    const { container } = render(<HomePage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const hrefs = new Set(Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href')));
    PAGES.forEach((page) => expect(hrefs.has(page.href), page.href).toBe(true));
  });

  it('gives every image alt text', () => {
    render(<HomePage />);
    document.querySelectorAll('img').forEach((img) => expect(img).toHaveAttribute('alt'));
  });
});

describe.each(PAGES.map((page) => [page.id, page] as const))('The %s page', { timeout: 30_000 }, (id, page) => {
  const { Page, meta, sections } = INNER[id];

  it('opens with its own hero and one h1, then its sections, then the next page', () => {
    const { container } = render(<Page />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: page.title })).toBeInTheDocument();
    expect(sectionKeys(container)).toEqual(['top', 'Next page']);
    expect(sectionKeys(container.querySelector('#content')!)).toEqual(sections);

    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(crumbs).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(within(crumbs).getByText(page.label)).toHaveAttribute('aria-current', 'page');

    const next = nextPage(id);
    const onward = within(screen.getByRole('region', { name: 'Next page' })).getByRole('link');
    expect(onward).toHaveAttribute('href', next.href);
  });

  it('has its own title and description', () => {
    expect(meta.title).toBe(page.label);
    expect(meta.description).toBe(page.description);
    expect(meta.alternates?.canonical).toBe(page.href);
  });
});

describe('Page content', { timeout: 30_000 }, () => {
  it('names every client once on the clientele page: logos by alt text, the rest written out', () => {
    render(<ClientelePage />);
    const wall = document.getElementById('clientele')!;
    const logos = Array.from(wall.querySelectorAll('img')).filter((img) => img.getAttribute('alt')).map((img) => img.getAttribute('alt'));
    const written = Array.from(wall.querySelectorAll('ul:not([aria-hidden]) [data-name]')).map((el) => el.textContent);
    expect([...logos, ...written].sort()).toEqual(CLIENTS.map((c) => c.name).sort());
    expect(written).toHaveLength(CLIENTS.filter((c) => !c.logo).length);
  });

  it('spreads the name-only tiles through both rows of the wall', () => {
    render(<ClientelePage />);
    const rows = Array.from(document.querySelectorAll('#clientele ul:not([aria-hidden])'));
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      const kinds = Array.from(row.children).map((li) => (li.querySelector('[data-name]') ? 'name' : 'logo'));
      expect(kinds).toContain('name');
      /* Never two names side by side. */
      kinds.forEach((kind, i) => expect(kind === 'name' && kinds[i + 1] === 'name', `row item ${i}`).toBe(false));
    }
  });

  it('links each client logo to its Instagram profile in a new tab, once per client', () => {
    render(<ClientelePage />);
    const wall = document.getElementById('clientele')!;
    const linked = CLIENTS.filter((client) => client.instagram);
    for (const client of linked) {
      const link = within(wall).getByRole('link', { name: `${client.name} on Instagram (opens in a new tab)` });
      expect(link).toHaveAttribute('href', `https://www.instagram.com/${client.instagram}/`);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    }
    /* The looping duplicate of each row stays out of the tab order. */
    const copies = Array.from(wall.querySelectorAll('ul[aria-hidden="true"] a'));
    expect(copies).toHaveLength(linked.length);
    copies.forEach((a) => expect(a).toHaveAttribute('tabindex', '-1'));
  });

  it('stores bare Instagram handles, without tracking codes', () => {
    for (const client of CLIENTS) {
      if (client.instagram) expect(client.instagram).toMatch(/^[a-z0-9._]+$/);
    }
  });

  it('puts eight reels on the work wheel, each once for assistive tech, each playable with sound', () => {
    render(<WorkPage />);
    const wheel = screen.getByRole('group', { name: /Projects/ });
    const real = Array.from(wheel.querySelectorAll('a:not([aria-hidden])'));
    expect(WORK_PROJECTS).toHaveLength(8);
    expect(real).toHaveLength(8);
    expect(wheel.querySelectorAll('a')).toHaveLength(8);
    /* One roving tab stop on the wheel. */
    expect(wheel.querySelectorAll('a[tabindex="0"]')).toHaveLength(1);
    real.forEach((a, i) => {
      expect(a).toHaveAccessibleName(`Play Reel ${i + 1} with sound`);
      expect(a).toHaveAttribute('href', WORK_PROJECTS[i].video);
      expect(a).not.toHaveAttribute('target');
    });
    /* The loops on the cards are silent. */
    wheel.querySelectorAll('video').forEach((v) => expect((v as HTMLVideoElement).muted).toBe(true));
  });

  it('shows every gallery image below the wheel, with no client names or logos', () => {
    render(<WorkPage />);
    const grid = screen.getByRole('region', { name: 'Every beginning, at a glance.' });
    const images = within(grid).getAllByRole('img');
    expect(images).toHaveLength(GALLERY.length);
    expect(within(grid).queryAllByRole('link')).toHaveLength(0);
    for (const client of CLIENTS) expect(grid).not.toHaveTextContent(client.name);
  });

  it('uses the exact contact details on the contact page', () => {
    render(<ContactPage />);
    expect(document.querySelector(`a[href="${SITE.phone.href}"]`)).not.toBeNull();
    expect(document.querySelector(`a[href="mailto:${SITE.email}"]`)).not.toBeNull();
    expect(document.querySelector(`a[href="${SITE.instagram.url}"]`)).not.toBeNull();
    expect(document.querySelector(`a[href="${SITE.linkedin.url}"]`)).not.toBeNull();
  });

  it('wraps the next-page chain round from the last page to the first', () => {
    expect(nextPage('contact')).toBe(getPage('about'));
    expect(nextPage('about')).toBe(getPage('services'));
  });
});
