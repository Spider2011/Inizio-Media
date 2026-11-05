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

export type Client = {
  name: string;
  /** Without a logo the tile shows the name, set in the display face. */
  logo?: StaticImageData;
  scale?: number;
  /** Instagram handle (no @); the logo links to the profile when present. */
  instagram?: string;
};

export function instagramUrl(handle: string): string {
  return `https://www.instagram.com/${handle}/`;
}

export const CLIENTS: readonly Client[] = [
  { name: 'Rotaract District 3141', logo: rotaract, scale: 1, instagram: 'rotaract_mumbai' },
  { name: 'Bracezz', logo: bracezz, scale: 0.95, instagram: 'bracezzz__' },
  { name: 'The Chocolate Library', logo: chocolateLibrary, scale: 1.25, instagram: 'the.chocolatelibrarymumbai' },
  { name: 'Orange Decore', logo: orangeDecore, scale: 1, instagram: 'orangedecore_mumbai' },
  { name: 'Eternia Sports', logo: eterniaSports, scale: 1, instagram: 'eterniasports' },
  { name: 'High Intensity Sports', logo: highIntensitySports, scale: 1.05, instagram: 'highintensitysports' },
  { name: 'Gala Food Corner', logo: gfc, scale: 1.25, instagram: 'galafoodcorner_' },
  { name: 'Nail Art by Charmi', logo: nailArtByCharmi, scale: 1.25, instagram: 'nailhousebycharmi' },
  { name: 'Artemix', logo: artemix, scale: 1.15, instagram: 'artemix.music' },
  { name: 'Cuddly', logo: cuddly, scale: 1, instagram: 'cuddlymulund' },
  { name: 'So Home', logo: soHome, scale: 1, instagram: 'sohome.in_' },
  { name: 'InvestSure Financial Services', logo: investsure, scale: 1.05, instagram: 'investsurefs' },
  { name: 'Welcome Interior Studio', logo: welcomeInterior, scale: 1.1 },
  { name: 'Chocobury', logo: chocobury, scale: 1, instagram: 'thechocobury' },
  { name: 'ADC', logo: adc, scale: 1, instagram: 'dentistsatadc1977' },
  { name: 'Shanti Siddhi', logo: shantiSiddhi, scale: 1.25, instagram: 'shantisiddhigroup' },
  { name: 'Aarka', logo: aarka, scale: 1.25, instagram: 'aarka_life' },
  { name: 'Nishk', logo: nishk, scale: 1.2, instagram: 'nishkbydessertwale' },
  { name: 'O&B Sports Infrastructure', logo: obSports, scale: 1.1, instagram: 'oandb_sportsinfrastructure' },
  { name: 'Oberoi Mulund Marathi Mandal', logo: mulundMarathiMandal, scale: 1.05, instagram: 'oberoi_mandali' },
  { name: 'Infiwick Candles', logo: infiwickCandles, scale: 1.15, instagram: 'infiwick' },
  { name: 'Moiraa', logo: moiraa, scale: 1.15, instagram: 'moiraaethnics' },
  { name: 'Eat Smart Restart', logo: eatSmartRestart, scale: 1.05, instagram: 'eatsmart.restart' },
  { name: 'Neo Estate', logo: ne, scale: 0.9, instagram: 'neoestatesofficial' },
  /* No logos yet: these show their names. */
  { name: 'The Jalsa Diaries', instagram: 'thejalsadiaries_' },
  { name: 'Prit ki Yatri', instagram: 'pritkiyatri' },
  { name: 'Jab Parth Met Krisha', instagram: 'jabparthmetkrisha' },
  { name: 'Jen Ishq ki Kahani', instagram: 'jenishqkikahaani' },
  { name: 'Ishq ka Prabhav', instagram: 'ishqkaprabhav' },
  { name: 'Sneha ka Raj', instagram: 'snehakaraj' },
  { name: 'Bharat Found his Jinie', instagram: 'bharatfoundhisjinie' },
  { name: 'Kittu Chali Uss Par', instagram: 'kittuchaliusspar' },
  { name: 'Nitin ki Khushi', instagram: 'nitinkikhushi' },
  { name: 'Jeel Got Veerified', instagram: 'jeelgotveerefied' }
];
