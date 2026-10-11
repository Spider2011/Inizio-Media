import { screen } from '@testing-library/react';
import type { ImgHTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CLIENTS } from '@/content/clients';
import { NAV_IDS, SITE } from '@/content/site';
import { renderWithMotion as render } from '@/test-utils/render';
import HomePage from './page';

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

/* Rendering the whole page in jsdom is slow on a cold start, so these get a longer timeout. */
describe('HomePage', { timeout: 30_000 }, () => {
  it('tells the story in order', () => {
    render(<HomePage />);
    const keys = Array.from(document.querySelectorAll('main > section')).map(
      (s) => s.id || s.getAttribute('aria-labelledby') || s.getAttribute('aria-label')
    );
    expect(keys).toEqual([
      'top',
      'What we do, in brief',
      'results-title',
      'about',
      'services',
      'process',
      'work',
      'collab-title',
      'events',
      'clientele',
      'testimonials',
      'contact'
    ]);
  });

  it('has one h1 and a target for every navigation link', () => {
    render(<HomePage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    NAV_IDS.forEach((id) => expect(document.getElementById(id), `#${id}`).not.toBeNull());
  });

  it('names every client logo once for assistive tech, and gives every image alt text', () => {
    render(<HomePage />);
    document.querySelectorAll('img').forEach((img) => expect(img).toHaveAttribute('alt'));
    const named = Array.from(document.querySelectorAll('#clientele img')).filter((img) => img.getAttribute('alt'));
    expect(named.map((img) => img.getAttribute('alt')).sort()).toEqual(CLIENTS.map((c) => c.name).sort());
  });

  it('uses the exact contact details', () => {
    render(<HomePage />);
    expect(document.querySelector(`a[href="${SITE.phone.href}"]`)).not.toBeNull();
    expect(document.querySelector(`a[href="mailto:${SITE.email}"]`)).not.toBeNull();
    expect(document.querySelector(`a[href="${SITE.instagram.url}"]`)).not.toBeNull();
  });
});
