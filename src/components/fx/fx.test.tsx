import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Testimonials } from '@/components/sections/Testimonials';
import { renderWithMotion as render } from '@/test-utils/render';
import { Counter } from './Counter';
import { SplitText } from './SplitText';

describe('Counter', () => {
  it('keeps the real value in the markup and lands exactly on it', async () => {
    render(<Counter className="n" value="10.2" suffix="M" />);
    const stat = document.querySelector('.n') as HTMLElement;
    expect(screen.getByText('10.2M', { selector: '.sr-only' })).toBeInTheDocument();
    await waitFor(() => expect(stat.querySelector('[aria-hidden="true"]')).toHaveTextContent(/^10\.2M$/));
  });
});

describe('SplitText', () => {
  it('reads as one sentence and styles chosen words', () => {
    render(<SplitText as="h2" text="Every brand needs a beginning." by="chars" classFor={{ 'beginning.': 'accent' }} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Every brand needs a beginning.' })).toBeInTheDocument();
    expect(document.querySelector('.split-word.accent')).toHaveTextContent('beginning.');
  });

  it('turns line breaks into <br> while keeping the spoken text on one line', () => {
    render(<SplitText as="h2" text={"Let's\ncreate."} />);
    expect(screen.getByRole('heading', { name: "Let's create." })).toBeInTheDocument();
    expect(document.querySelectorAll('br')).toHaveLength(1);
  });
});

describe('Testimonials deck', () => {
  it('moves through the quotes with the buttons and the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Testimonials />);
    const counter = () => screen.getByText((_, el) => el?.tagName === 'P' && /^\d{2} \/ \d{2}$/.test(el.textContent ?? ''));
    expect(counter()).toHaveTextContent('01 / 03');
    await user.click(screen.getByRole('button', { name: 'Next testimonial' }));
    expect(counter()).toHaveTextContent('02 / 03');
    screen.getByRole('group', { name: 'Client testimonials' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(counter()).toHaveTextContent('01 / 03');
  });
});
