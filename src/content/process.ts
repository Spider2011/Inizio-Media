import type { StockPhoto } from '@/lib/unsplash';

/* The four steps of the process, each with a stock photo (Unsplash, free licence). */
export type ProcessStep = { title: string; description: string; photo: StockPhoto };

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    title: 'Discover',
    description: 'Deep-dive brief & audience research',
    photo: { id: 'photo-1588856122867-363b0aa7f598', alt: 'A strategist studying a wall of research notes', local: '/process/discover.webp' }
  },
  {
    title: 'Strategy',
    description: 'Positioning, roadmap & direction',
    photo: { id: 'photo-1532622785990-d2c36a76f5a6', alt: 'Two people mapping a plan on a whiteboard', local: '/process/strategy.webp' }
  },
  {
    title: 'Build',
    description: 'Design, develop & produce assets',
    photo: { id: 'photo-1572044162444-ad60f128bdea', alt: 'A designer at work with a drawing tablet and colour swatches', local: '/process/build.webp' }
  },
  {
    title: 'Launch',
    description: 'Deploy, measure & iterate',
    photo: { id: 'photo-1551288049-bebda4e38f71', alt: 'Performance analytics on a laptop screen', local: '/process/launch.webp' }
  }
];
