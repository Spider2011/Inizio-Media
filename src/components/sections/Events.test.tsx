import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { GALLERY } from '@/content/gallery';
import { renderWithMotion as render } from '@/test-utils/render';
import { Events } from './Events';

describe('Events gallery', { timeout: 30_000 }, () => {
  it('lists every photo once, as a button that names it', () => {
    render(<Events />);
    expect(screen.getAllByRole('button', { name: /^Open photo:/ })).toHaveLength(GALLERY.length);
  });

  it('opens the viewer on the chosen photo and moves with buttons and arrow keys, wrapping at the ends', async () => {
    const user = userEvent.setup();
    render(<Events />);
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
    render(<Events />);
    const opener = screen.getByRole('button', { name: 'Open photo: The pheras' });
    await user.click(opener);
    await screen.findByRole('dialog', { name: 'Photo viewer' });
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });
});
