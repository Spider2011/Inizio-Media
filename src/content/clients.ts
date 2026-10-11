/* Clientele wall: the brochure's logos, in the design system's order. `scale` is the
   per-tile optical balance (--logo-scale, 0.9–1.25). 24 logos = whole rows at 2/3/4/6 columns. */
import type { StaticImageData } from 'next/image';
import aarka from '@/assets/clients/aarka.png';
import adc from '@/assets/clients/adc.png';
import artemix from '@/assets/clients/artemix.png';
import bracezz from '@/assets/clients/bracezz.png';
import chocobury from '@/assets/clients/chocobury.png';
import cuddly from '@/assets/clients/cuddly.png';
import eatSmartRestart from '@/assets/clients/eat-smart-restart.png';
import eterniaSports from '@/assets/clients/eternia-sports.png';
import gfc from '@/assets/clients/gfc.png';
import highIntensitySports from '@/assets/clients/high-intensity-sports.png';
import infiwickCandles from '@/assets/clients/infiwick-candles.png';
import investsure from '@/assets/clients/investsure.png';
import moiraa from '@/assets/clients/moiraa.png';
import mulundMarathiMandal from '@/assets/clients/mulund-marathi-mandal.png';
import nailArtByCharmi from '@/assets/clients/nail-art-by-charmi.png';
import ne from '@/assets/clients/ne.png';
import nishk from '@/assets/clients/nishk.png';
import obSports from '@/assets/clients/ob-sports-infrastructure.png';
import orangeDecore from '@/assets/clients/orange-decore.png';
import rotaract from '@/assets/clients/rotaract-district-3141.png';
import shantiSiddhi from '@/assets/clients/shanti-siddhi.png';
import soHome from '@/assets/clients/so-home.png';
import chocolateLibrary from '@/assets/clients/the-chocolate-library.png';
import welcomeInterior from '@/assets/clients/welcome-interior-studio.png';

export type Client = { name: string; logo: StaticImageData; scale: number };

export const CLIENTS: readonly Client[] = [
  { name: 'Rotaract District 3141', logo: rotaract, scale: 1 },
  { name: 'Bracezz', logo: bracezz, scale: 0.95 },
  { name: 'The Chocolate Library', logo: chocolateLibrary, scale: 1.25 },
  { name: 'Orange Decore', logo: orangeDecore, scale: 1 },
  { name: 'Eternia Sports', logo: eterniaSports, scale: 1 },
  { name: 'High Intensity Sports', logo: highIntensitySports, scale: 1.05 },
  { name: 'GFC', logo: gfc, scale: 1.25 },
  { name: 'Nail Art by Charmi', logo: nailArtByCharmi, scale: 1.25 },
  { name: 'Artemix', logo: artemix, scale: 1.15 },
  { name: 'Cuddly', logo: cuddly, scale: 1 },
  { name: 'So Home', logo: soHome, scale: 1 },
  { name: 'InvestSure Financial Services', logo: investsure, scale: 1.05 },
  { name: 'Welcome Interior Studio', logo: welcomeInterior, scale: 1.1 },
  { name: 'Chocobury', logo: chocobury, scale: 1 },
  { name: 'ADC', logo: adc, scale: 1 },
  { name: 'Shanti Siddhi', logo: shantiSiddhi, scale: 1.25 },
  { name: 'Aarka', logo: aarka, scale: 1.25 },
  { name: 'Nishk', logo: nishk, scale: 1.2 },
  { name: 'O&B Sports Infrastructure', logo: obSports, scale: 1.1 },
  { name: 'Oberoi Mulund Marathi Mandal', logo: mulundMarathiMandal, scale: 1.05 },
  { name: 'Infiwick Candles', logo: infiwickCandles, scale: 1.15 },
  { name: 'Moiraa', logo: moiraa, scale: 1.15 },
  { name: 'Eat Smart Restart', logo: eatSmartRestart, scale: 1.05 },
  { name: 'NE', logo: ne, scale: 0.9 }
];
