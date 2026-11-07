import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PROCESS_STEPS } from '@/content/process';
import { renderWithMotion as render } from '@/test-utils/render';
import { Process } from './Process';

describe('Process', () => {
  it('shows all four steps, and only Launch links on, to the contact page', () => {
    render(<Process />);
    const section = screen.getByRole('region', { name: 'Our process' });
    PROCESS_STEPS.forEach((step) => expect(within(section).getByRole('heading', { level: 3, name: new RegExp(`^${step.title}`) })).toBeInTheDocument());

    const links = within(section).getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/contact');
    expect(links[0]).toHaveAccessibleName('Launch: talk to us about your project');
    expect(within(section).getByRole('heading', { level: 3, name: /Launch/ })).toContainElement(links[0]);
  });
});
