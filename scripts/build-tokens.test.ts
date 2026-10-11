// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildTokensCss } from './build-tokens.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const tokens = JSON.parse(readFileSync(root + 'design-system/tokens.json', 'utf8'));

const mini = {
  color: {
    themes: [{ id: 'light' }, { id: 'dark' }],
    tokens: [
      { name: 'white', value: '#ffffff' },
      { name: 'ink', value: { light: '#141414', dark: '#f3ece3' } },
      { name: 'on-blue', value: '{white}' }
    ]
  },
  type: {
    fonts: [{ family: 'Bebas Neue', file: 'fonts/BebasNeue-Regular.woff2', weight: '400', style: 'normal' }],
    families: { display: '"Bebas Neue", sans-serif' },
    groups: []
  },
  spacing: { tokens: [{ name: 'space-1', value: '4px' }] },
  shadow: { tokens: [{ name: 'shadow-sm', value: '0 1px 2px rgba(7, 28, 64, 0.06)' }] },
  zIndex: { tokens: [{ name: 'z-nav', value: '50' }] }
};

describe('buildTokensCss', () => {
  it('emits an @font-face per font, relative to the stylesheet, with font-display swap', () => {
    expect(buildTokensCss(mini)).toMatch(
      /@font-face \{[^}]*font-family: "Bebas Neue";[^}]*src: url\("\.\.\/fonts\/BebasNeue-Regular\.woff2"\) format\("woff2"\);[^}]*font-display: swap;/
    );
  });

  it('leaves fonts to next/font when asked', () => {
    const css = buildTokensCss(mini, { fonts: false });
    expect(css).not.toMatch(/@font-face/);
    expect(css).not.toMatch(/--font-display/);
    expect(css).toMatch(/--space-1: 4px;/);
  });

  it('uses the first theme value and resolves {alias} to var()', () => {
    const css = buildTokensCss(mini);
    expect(css).toMatch(/--ink: #141414;/);
    expect(css).not.toMatch(/#f3ece3/);
    expect(css).toMatch(/--on-blue: var\(--white\);/);
  });

  it('emits font families, spacing, shadows and other token families', () => {
    const css = buildTokensCss(mini);
    expect(css).toMatch(/--font-display: "Bebas Neue", sans-serif;/);
    expect(css).toMatch(/--shadow-sm: 0 1px 2px rgba\(7, 28, 64, 0\.06\);/);
    expect(css).toMatch(/--z-nav: 50;/);
  });

  it('fails fast on a duplicate token name', () => {
    const dup = { ...mini, radius: { tokens: [{ name: 'space-1', value: '2px' }] } };
    expect(() => buildTokensCss(dup)).toThrow(/duplicate token name "space-1"/);
  });

  it('fails fast on an invalid token name', () => {
    const bad = { ...mini, radius: { tokens: [{ name: 'radius/sm', value: '2px' }] } };
    expect(() => buildTokensCss(bad)).toThrow(/invalid token name "radius\/sm"/);
  });

  it('fails fast on an alias to a missing colour', () => {
    const bad = { ...mini, color: { ...mini.color, tokens: [{ name: 'link', value: '{nope}' }] } };
    expect(() => buildTokensCss(bad)).toThrow(/alias to missing colour "nope"/);
  });

  it('the committed src/styles/tokens.css is up to date with design-system/tokens.json', () => {
    const committed = readFileSync(root + 'src/styles/tokens.css', 'utf8');
    expect(committed, 'run `npm run tokens` to regenerate').toBe(buildTokensCss(tokens, { fonts: false }));
  });
});
