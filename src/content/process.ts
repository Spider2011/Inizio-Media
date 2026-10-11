export type ProcessStep = { title: string; description: string };

export const PROCESS_STEPS: readonly ProcessStep[] = [
  { title: 'Discover', description: 'Deep-dive brief & audience research' },
  { title: 'Strategy', description: 'Positioning, roadmap & direction' },
  { title: 'Build', description: 'Design, develop & produce assets' },
  { title: 'Launch', description: 'Deploy, measure & iterate' }
];
