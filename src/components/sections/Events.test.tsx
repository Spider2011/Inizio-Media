import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { StaticImageData } from 'next/image';
import type { ImgHTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GALLERY, type GalleryItem } from '@/content/gallery';
import { SITE } from '@/content/site';
import { renderWithMotion as render } from '@/test-utils/render';
import { Events } from './Events';

/* Under Vite, static image imports are URL strings without dimensions; render a plain <img>. */
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string | { src: string } }) => {
    const { fill, ...rest } = props as Record<string, unknown>;
    void fill;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === 'string' ? src : src.src} alt={alt} {...(rest as ImgHTMLAttributes<HTMLImageElement>)} />;
  }
}));

const IMAGE: StaticImageData = { src: '/photo.jpg', width: 800, height: 1000 };

/* The same gallery, as it will be once real photographs are added. */
const WITH_PHOTOS: readonly GalleryItem[] = GALLERY.map((item) => ({ ...item, photo: { image: IMAGE, alt: item.caption } }));

describe('Events, before real photos are added', { timeout: 30_000 }, () => {
  it('shows no placeholder tiles, describes the coverage and links to Instagram', () => {
    render(<Events />);
    expect(screen.queryAllByRole('button', { name: /^Open photo:/ })).toHaveLength(0);
    expect(document.body.textContent).not.toMatch(/Photo ·/);
    ['Coverage', 'Content', 'Live updates'].forEach((title) => expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument());
    const link = screen.getByRole('link', { name: /See our latest coverage on Instagram/ });
    expect(link).toHaveAttribute('href', SITE.instagram.url);
    expect(link).toHaveAttribute('target', '_blank');
  });
});

describe('Events gallery, once photos are added', { timeout: 30_000 }, () => {
  it('lists every photo once, as a button that names it', () => {
    render(<Events items={WITH_PHOTOS} />);
    expect(screen.getAllByRole('button', { name: /^Open photo:/ })).toHaveLength(GALLERY.length);
  });

  it('only shows items that have a real photo', () => {
    const mixed = WITH_PHOTOS.map((item, i) => (i % 2 ? { ...item, photo: undefined } : item));
    render(<Events items={mixed} />);
    expect(screen.getAllByRole('button', { name: /^Open photo:/ })).toHaveLength(Math.ceil(GALLERY.length / 2));
  });

  it('opens the viewer on the chosen photo and moves with buttons and arrow keys, wrapping at the ends', async () => {
    const user = userEvent.setup();
    render(<Events items={WITH_PHOTOS} />);
    await user.click(screen.getByRole('button', { name: 'Open photo: Reception' }));

    const viewer = await screen.findByRole('dialog', { name: 'Photo viewer' });
    expect(within(viewer).getByText('08')).toBeInTheDocument();
    expect(within(viewer).getByRole('button', { name: 'Close' })).toHaveFocus();

    await user.click(within(viewer).getByRole('button', { name: 'Next photo' }));
    expect(within(viewer).getByText('Sangeet night')).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(within(viewer).getByText('Reception')).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the photo it was opened from', async () => {
    const user = userEvent.setup();
    render(<Events items={WITH_PHOTOS} />);
    const opener = screen.getByRole('button', { name: 'Open photo: The pheras' });
    await user.click(opener);
    await screen.findByRole('dialog', { name: 'Photo viewer' });
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });
});
