/* The fourteen services, in the design system's order, three keywords each. */

export type ServiceCard = { title: string; keys: readonly [string, string, string] };

export const SERVICE_CARDS: readonly ServiceCard[] = [
  { title: 'Branding', keys: ['Strategy', 'Visual Identity', 'Guidelines'] },
  { title: 'Social Media Management', keys: ['Strategy', 'Content', 'Community'] },
  { title: 'Content Marketing', keys: ['Ideation', 'Creation', 'Distribution'] },
  { title: 'Performance Marketing', keys: ['Campaigns', 'Targeting', 'Optimisation'] },
  { title: 'Website Development', keys: ['Design', 'Development', 'Maintenance'] },
  { title: 'SEO', keys: ['Strategy', 'Optimisation', 'Growth'] },
  { title: 'Offline/Print Marketing', keys: ['Campaigns', 'Print Design', 'Collateral'] },
  { title: 'WhatsApp Marketing', keys: ['Campaigns', 'Automation', 'Engagement'] },
  { title: 'Digital Strategy', keys: ['Research', 'Planning', 'Execution'] },
  { title: 'Product Shoot', keys: ['Photography', 'Videography', 'Post-Production'] },
  { title: 'Email Marketing', keys: ['Strategy', 'Campaigns', 'Automation'] },
  { title: 'Event & Wedding Coverage', keys: ['Coverage', 'Content', 'Live Updates'] },
  { title: 'Influencer Marketing', keys: ['Strategy', 'Collaborations', 'Campaigns'] },
  { title: 'Analytics & Reporting', keys: ['Tracking', 'Insights', 'Optimisation'] }
];
