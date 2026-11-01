import { describe, expect, it } from 'vitest';
import { PAGES } from '@/content/pages';
import { SERVICE_CARDS } from '@/content/services';
import { unsplashLoader, unsplashSrc } from './unsplash';

const ID = /^photo-\d{10,13}-[0-9a-f]{12}$/;

describe('stock photos', () => {
  it('gives every page and every service a valid Unsplash photo with a description', () => {
    for (const { photo } of [...PAGES, ...SERVICE_CARDS]) {
      expect(photo.id).toMatch(ID);
      expect(photo.alt.length).toBeGreaterThan(10);
    }
  });

  it('never shows the same photo twice among the services, or twice among the pages', () => {
    const services = SERVICE_CARDS.map((s) => s.photo.id);
    const pages = PAGES.map((p) => p.photo.id);
    expect(new Set(services).size).toBe(services.length);
    expect(new Set(pages).size).toBe(pages.length);
  });

  it('asks the Unsplash CDN for exactly the width needed, cropped and in a modern format', () => {
    const src = unsplashSrc({ id: 'photo-1590102425828-07f1fa2ed1f6', alt: 'x' });
    expect(src).toBe('https://images.unsplash.com/photo-1590102425828-07f1fa2ed1f6');
    expect(unsplashLoader({ src, width: 480, quality: 60 })).toBe(`${src}?auto=format&fit=crop&w=480&q=60`);
    expect(unsplashLoader({ src, width: 256 })).toContain('&q=70');
  });
});
