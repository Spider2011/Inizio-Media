import { screen, within } from '@testing-library/react';
import type { Metadata } from 'next';
import type { ComponentType, ImgHTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CLIENTS } from '@/content/clients';
import { getPage, nextPage, PAGES } from '@/content/pages';
import { SITE, type NavId } from '@/content/site';
import { renderWithMotion as render } from '@/test-utils/render';
import AboutPage, { metadata as aboutMeta } from './about/page';
import ClientelePage, { metadata as clienteleMeta } from './clientele/page';
import ContactPage, { metadata as contactMeta } from './contact/page';
import EventsPage, { metadata as eventsMeta } from './events/page';
import HomePage from './page';
import ServicesPage, { metadata as servicesMeta } from './services/page';
import TestimonialsPage, { metadata as testimonialsMeta } from './testimonials/page';
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
  work: { Page: WorkPage, meta: workMeta, sections: ['work', 'results-title', 'collab-title'] },
  events: { Page: EventsPage, meta: eventsMeta, sections: ['events', 'collab-title'] },
  clientele: { Page: ClientelePage, meta: clienteleMeta, sections: ['clientele', 'testimonials'] },
  testimonials: { Page: TestimonialsPage, meta: testimonialsMeta, sections: ['testimonials', 'results-title', 'collab-title'] },
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
  it('names every client logo once for assistive tech on the clientele page', () => {
    render(<ClientelePage />);
    const named = Array.from(document.querySelectorAll('#clientele img')).filter((img) => img.getAttribute('alt'));
    expect(named.map((img) => img.getAttribute('alt')).sort()).toEqual(CLIENTS.map((c) => c.name).sort());
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
