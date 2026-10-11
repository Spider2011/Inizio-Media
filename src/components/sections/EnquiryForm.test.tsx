import { screen, waitFor } from '@testing-library/react';
import { renderWithMotion as render } from '@/test-utils/render';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EnquiryForm } from './EnquiryForm';

function jsonResponse(status: number, body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Your name'), 'Asha');
  await user.type(screen.getByLabelText('Phone or email'), 'asha@example.com');
  await user.selectOptions(screen.getByLabelText('What do you need?'), 'Website Development');
}

describe('EnquiryForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the design-system error states and focuses the first problem', async () => {
    const user = userEvent.setup();
    render(<EnquiryForm openMailto={vi.fn()} />);
    await user.type(screen.getByLabelText('Phone or email'), 'teaminizio@');
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    const name = screen.getByLabelText('Your name');
    expect(name).toHaveFocus();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Tell us your name.');
    expect(screen.getByLabelText('Phone or email')).toHaveAccessibleDescription('Enter a phone number or a full email address.');
  });

  it('clears an error as soon as it is fixed', async () => {
    const user = userEvent.setup();
    render(<EnquiryForm openMailto={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));
    expect(screen.getByLabelText('Your name')).toHaveAttribute('aria-invalid', 'true');
    await user.type(screen.getByLabelText('Your name'), 'Asha');
    await waitFor(() => expect(screen.getByLabelText('Your name')).not.toHaveAttribute('aria-invalid'));
    expect(screen.getByLabelText('Phone or email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('posts a valid enquiry and thanks the visitor by name', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn(() => jsonResponse(200, { success: true, data: null, error: null }));
    vi.stubGlobal('fetch', fetchSpy);
    render(<EnquiryForm openMailto={vi.fn()} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(await screen.findByRole('heading', { name: 'Thank you, Asha.' })).toHaveFocus();
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/enquiry');
    expect(JSON.parse(String(init.body))).toEqual({
      name: 'Asha',
      contact: 'asha@example.com',
      business: '',
      service: 'Website Development',
      message: '',
      website: ''
    });
  });

  it('falls back to the email app when online delivery is not set up', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse(503, { success: false, data: null, error: 'x', code: 'not_configured' })));
    const openMailto = vi.fn();
    render(<EnquiryForm openMailto={openMailto} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    await waitFor(() => expect(openMailto).toHaveBeenCalledOnce());
    expect(openMailto.mock.calls[0][0]).toMatch(/^mailto:teaminizio\.media@gmail\.com\?subject=/);
    expect(screen.getByText(/opened your email app/i)).toBeInTheDocument();
  });

  it('falls back to the email app when the network fails', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));
    const openMailto = vi.fn();
    render(<EnquiryForm openMailto={openMailto} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));
    await waitFor(() => expect(openMailto).toHaveBeenCalledOnce());
  });

  it('shows server-side field errors', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => jsonResponse(400, { success: false, data: null, error: 'x', fieldErrors: { message: 'Keep the message under 2,000 characters.' } }))
    );
    render(<EnquiryForm openMailto={vi.fn()} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));
    expect(await screen.findByText('Keep the message under 2,000 characters.')).toBeInTheDocument();
  });

  it('explains when the visitor is rate-limited', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse(429, { success: false, data: null, error: 'Too many enquiries. Please try again in a few minutes.' })));
    const openMailto = vi.fn();
    render(<EnquiryForm openMailto={openMailto} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));
    expect(await screen.findByText('Too many enquiries. Please try again in a few minutes.')).toBeInTheDocument();
    expect(openMailto).not.toHaveBeenCalled();
  });
});
