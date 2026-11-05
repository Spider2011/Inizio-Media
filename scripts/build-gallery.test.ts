import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { GALLERY } from '../src/data/gallery';
import { accountOf, interleave } from './build-gallery.mjs';

describe('gallery build', () => {
  it('groups Instagram downloads by account and other files by their first word', () => {
    expect(accountOf('731022751_18111324103815789_824_n.jpg')).toBe('815789');
    expect(accountOf('SaveClip.App_485623239_17845823565442541_253_n.jpg')).toBe('442541');
    expect(accountOf('Image-11440.jpg')).toBe('image');
    expect(accountOf('IMG_2310.PNG')).toBe('img');
  });

  it('mixes accounts so one client never fills a run, keeping every file once', () => {
    const files = ['a_100000000000111111_x.jpg', 'b_200000000000111111_x.jpg', 'c_300000000000111111_x.jpg', 'Image-1.jpg', 'Image-2.jpg', 'Logo.png'];
    const out = interleave(files);
    expect([...out].sort()).toEqual([...files].sort());
    expect(out.slice(0, 3).map(accountOf)).toEqual(['111111', 'image', 'logo']);
  });
});

describe('gallery data', () => {
  it('lists real files with their sizes', () => {
    expect(GALLERY.length).toBeGreaterThan(0);
    for (const image of GALLERY) {
      expect(fs.existsSync(path.join(process.cwd(), 'public', image.src)), image.src).toBe(true);
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
    }
  });
});
