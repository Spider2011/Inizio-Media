// Compiles design-system/tokens.json (copied from the Inizio Media design system)
// into src/styles/tokens.css: the CSS custom properties that src/styles/bundle.css reads.
// Fonts are loaded by next/font (src/styles/fonts.ts), which also defines
// --font-display and --font-slab, so the CLI build leaves @font-face rules out.
// Run with `npm run tokens` after updating tokens.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const ALIAS = /^\{([^{}]+)\}$/;
// Top-level keys that are not `{ tokens: [...] }` families, or need their own handling.
const SPECIAL = new Set(['name', 'version', 'color', 'type', 'shadow']);

function firstThemeValue(token, themeId) {
  return typeof token.value === 'string' ? token.value : token.value[themeId];
}

function collectNames(tokens) {
  const seen = new Set();
  const families = Object.entries(tokens).filter(([key, fam]) => key !== 'type' && fam && Array.isArray(fam.tokens));
  for (const [, family] of families) {
    for (const { name } of family.tokens) {
      if (!NAME.test(name)) throw new Error(`invalid token name "${name}"`);
      if (seen.has(name)) throw new Error(`duplicate token name "${name}"`);
      seen.add(name);
    }
  }
  return seen;
}

function colorDeclarations(color) {
  const themeId = color.themes[0].id;
  const names = new Set(color.tokens.map((t) => t.name));
  return color.tokens.map((token) => {
    const raw = firstThemeValue(token, themeId);
    const alias = ALIAS.exec(raw);
    if (alias && !names.has(alias[1])) throw new Error(`alias to missing colour "${alias[1]}"`);
    return `  --${token.name}: ${alias ? `var(--${alias[1]})` : raw};`;
  });
}

function fontFaces(type) {
  return (type.fonts || []).map((font) => {
    const file = font.file.includes('/') ? font.file : `fonts/${font.file}`;
    return [
      '@font-face {',
      `  font-family: "${font.family}";`,
      `  src: url("../${file}") format("woff2");`,
      `  font-weight: ${font.weight || '400'};`,
      `  font-style: ${font.style || 'normal'};`,
      '  font-display: swap;',
      '}'
    ].join('\n');
  });
}

/**
 * @param {object} tokens   Parsed tokens.json.
 * @param {{ fonts?: boolean }} [options]  `fonts: false` omits @font-face rules and --font-* stacks.
 */
export function buildTokensCss(tokens, { fonts = true } = {}) {
  collectNames(tokens);
  const themed = [
    ...(tokens.color ? colorDeclarations(tokens.color) : []),
    ...(tokens.shadow ? tokens.shadow.tokens.map((t) => `  --${t.name}: ${t.value};`) : [])
  ];
  const plain = Object.entries(tokens)
    .filter(([key, fam]) => !SPECIAL.has(key) && fam && Array.isArray(fam.tokens))
    .flatMap(([, fam]) => fam.tokens.map((t) => `  --${t.name}: ${t.value};`));
  const families = fonts
    ? Object.entries(tokens.type?.families || {}).map(([key, stack]) => `  --font-${key}: ${stack};`)
    : [];
  const faces = fonts ? fontFaces(tokens.type || {}).flatMap((rule) => [rule, '']) : [];
  const firstTheme = tokens.color?.themes?.[0]?.id || 'light';

  return [
    '/* GENERATED from design-system/tokens.json by scripts/build-tokens.mjs — do not edit by hand. */',
    '',
    ...faces,
    `:root, [data-theme="${firstTheme}"] {`,
    ...themed,
    '}',
    '',
    ':root {',
    ...plain,
    ...families,
    '}',
    ''
  ].join('\n');
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const root = new URL('..', import.meta.url);
  const tokens = JSON.parse(readFileSync(new URL('design-system/tokens.json', root), 'utf8'));
  writeFileSync(new URL('src/styles/tokens.css', root), buildTokensCss(tokens, { fonts: false }));
  console.log('src/styles/tokens.css written');
}
