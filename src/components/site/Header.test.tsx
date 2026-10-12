import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithMotion as render } from '@/test-utils/render';
import { Header } from './Header';

const navigation = vi.hoisted(() => ({ pathname: '/services' }));
vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }));

function renderWithSections() {
  return render(<Header />);
}

describe('Header', () => {
  beforeEach(() => {
    navigation.pathname = '/services';
  });

  it('links every page, in order', () => {
    renderWithSections();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((a) => a.textContent?.slice(0, a.textContent.length / 2))).toEqual([
      'About Us',
      'Our Services',
      'Our Work',
      'Events & Weddings',
      'Clientele',
      'Testimonials',
      'Contact'
    ]);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/about',
      '/services',
      '/work',
      '/events',
      '/clientele',
      '/testimonials',
      '/contact'
    ]);
  });

  it('marks the page being viewed as current, and only that one', () => {
    renderWithSections();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: /Our Services/ })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getAllByRole('link').filter((a) => a.hasAttribute('aria-current'))).toHaveLength(1);
  });

  it('marks nothing as current on the home page, and links the logo home', () => {
    navigation.pathname = '/';
    renderWithSections();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getAllByRole('link').filter((a) => a.hasAttribute('aria-current'))).toHaveLength(0);
    expect(screen.getByRole('link', { name: 'Inizio Media — home' })).toHaveAttribute('href', '/');
  });

  it('opens the menu with focus inside, locks scrolling, and closes on Escape back to the Menu button', async () => {
    const user = userEvent.setup();
    renderWithSections();
    const toggle = screen.getByRole('button', { name: 'Menu' });
    await user.click(toggle);

    const menu = await screen.findByRole('dialog', { name: 'Menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(menu).toContainElement(document.activeElement as HTMLElement);
    expect(document.documentElement.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(toggle).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('keeps Tab inside the open menu and closes when a link is chosen', async () => {
    const user = userEvent.setup();
    renderWithSections();
    await user.click(screen.getByRole('button', { name: 'Menu' }));
    const menu = await screen.findByRole('dialog', { name: 'Menu' });
    for (let i = 0; i < 14; i += 1) {
      await user.tab();
      expect(menu).toContainElement(document.activeElement as HTMLElement);
    }
    await user.click(within(menu).getByRole('link', { name: /Clientele/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
