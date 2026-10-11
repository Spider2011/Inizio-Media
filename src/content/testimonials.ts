/* SAMPLE QUOTES — replace with real client words, names and businesses, with permission (15–40 words each). */

export type Testimonial = { quote: string; name: string; business: string; highlight?: boolean };

export const TESTIMONIALS_ARE_SAMPLE = true;

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote: 'They understood our brand before we could explain it. Our page finally looks like the business we run.',
    name: 'Client Name',
    business: 'Founder, Business Name'
  },
  {
    quote: 'From the shoot to the launch posts, everything arrived on time and on brand.',
    name: 'Client Name',
    business: 'Business Name',
    highlight: true
  },
  {
    quote: 'Clear reporting every month, so we always knew what was working.',
    name: 'Client Name',
    business: 'Business Name'
  }
];
