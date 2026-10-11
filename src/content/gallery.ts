/* Events & Weddings gallery. PLACEHOLDERS until real photography arrives: add `photo`
   (a static import + alt text) to an item and the grid and lightbox show it. */
import type { PlaceholderTone, Photo } from './types';

export type GalleryRatio = '3/4' | '4/3' | '1/1' | '4/5';

export type GalleryItem = {
  id: string;
  kind: 'Wedding' | 'Event';
  caption: string;
  ratio: GalleryRatio;
  tone: PlaceholderTone;
  photo?: Photo;
};

export const GALLERY: readonly GalleryItem[] = [
  { id: 'sangeet', kind: 'Wedding', caption: 'Sangeet night', ratio: '3/4', tone: 'white' },
  { id: 'launch', kind: 'Event', caption: 'Brand launch, Mumbai', ratio: '4/3', tone: 'blue' },
  { id: 'haldi', kind: 'Wedding', caption: 'Haldi morning', ratio: '1/1', tone: 'butter' },
  { id: 'pheras', kind: 'Wedding', caption: 'The pheras', ratio: '3/4', tone: 'paper' },
  { id: 'club', kind: 'Event', caption: 'Club installation', ratio: '4/5', tone: 'navy' },
  { id: 'dusk', kind: 'Wedding', caption: 'Portraits at dusk', ratio: '4/3', tone: 'paper' },
  { id: 'shoot', kind: 'Event', caption: 'Product shoot, behind the scenes', ratio: '3/4', tone: 'pale' },
  { id: 'reception', kind: 'Wedding', caption: 'Reception', ratio: '4/3', tone: 'butter' }
];
