import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithMotion as render } from '@/test-utils/render';
import { Header } from './Header';

function renderWithSections() {
  return render(
    <>
      <Header />
      <section id="about">About</section>
      <section id="services">Services</section>
    </>
  );
}

describe('Header', () => {
  it('links every section, in order', () => {
    renderWithSections();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getAllByRole('link').map((a) => a.textContent?.slice(0, a.textContent.length / 2))).toEqual([
      'About Us',
      'Our Services',
      'Our Work',
      'Events & Weddings',
      'Clientele',
      'Testimonials',
      'Contact'
    ]);
  });

  it('marks the section in view as the current location', async () => {
    renderWithSections();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    await waitFor(() => expect(within(nav).getByRole('link', { name: /About Us/ })).toHaveAttribute('aria-current', 'location'));
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
