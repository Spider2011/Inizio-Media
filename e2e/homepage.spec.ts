import { expect, test, type Page } from '@playwright/test';

const ROUTES = ['/', '/about', '/services', '/work', '/events', '/clientele', '/testimonials', '/contact'] as const;

/* Load a page and wait for the preloader curtain to finish. */
async function open(page: Page, path = '/') {
  await page.goto(path);
  await expect(page.locator('.preloader')).toHaveCount(0, { timeout: 10_000 });
}

/* Scroll the whole page in steps so every in-view and scroll-linked effect gets its chance to run. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += Math.round(window.innerHeight / 2)) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 140));
    }
  });
}

for (const route of ROUTES) {
  test(`${route} renders without errors or sideways scrolling`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));

    await open(page, route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await scrollThrough(page);

    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test('every animated element on the home page finishes visible once scrolled past', async ({ page }) => {
  await open(page);
  await scrollThrough(page);
  await page.waitForTimeout(1500);
  const hidden = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
      .filter((el) => !el.closest('header') && Number(getComputedStyle(el).opacity) < 0.99)
      .map((el) => (el.textContent ?? el.className).slice(0, 40))
  );
  expect(hidden).toEqual([]);
});

test('results count up and land on the real figures', async ({ page }) => {
  await open(page);
  const results = page.getByRole('region', { name: 'Statistics, on average' });
  await results.scrollIntoViewIfNeeded();
  for (const figure of ['15M', '10.2M', '100K']) {
    await expect(results.getByText(figure, { exact: true }).first()).toBeVisible({ timeout: 6000 });
  }
});

test('every service folder is shown full size, each in its own place', async ({ page }) => {
  await open(page, '/services');
  const folders = page.locator('#services article');
  await expect(folders).toHaveCount(14);
  await expect(folders.getByRole('heading', { level: 3 })).toHaveCount(14);

  /* Positions relative to the row (which may be mid-travel): no folder may collapse or stack on another. */
  const boxes = await folders.evaluateAll((els) => {
    const row = els[0].closest('section')!.getBoundingClientRect();
    return els.map((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left - row.left, top: r.top - row.top, width: r.width, height: r.height };
    });
  });
  for (const box of boxes) {
    expect(box.width).toBeGreaterThan(250);
    expect(box.height).toBeGreaterThan(350);
  }
  const places = new Set(boxes.map((b) => `${Math.round(b.left)}:${Math.round(b.top)}`));
  expect(places.size).toBe(14);
});

test('client logos show at a readable size in compact tiles', async ({ page }) => {
  await open(page, '/clientele');
  const tiles = page.locator('#clientele li');
  /* The tiles never stop sliding, so scroll to the (still) section rather than to a tile. */
  await page.locator('#clientele').scrollIntoViewIfNeeded();
  const sizes = await tiles.evaluateAll((els) =>
    els.slice(0, 6).map((tile) => {
      const t = tile.getBoundingClientRect();
      const logo = tile.querySelector('img')!.getBoundingClientRect();
      return { tileWidth: t.width, tileHeight: t.height, logoWidth: logo.width, logoHeight: logo.height };
    })
  );
  for (const size of sizes) {
    expect(size.tileWidth).toBeLessThanOrEqual(240);
    /* Tiles keep their 3:2 shape whatever the logo's proportions. */
    expect(size.tileWidth / size.tileHeight).toBeCloseTo(1.5, 1);
    expect(Math.max(size.logoWidth, size.logoHeight)).toBeGreaterThan(50);
  }
});

test('the header moves between pages under the curtain and marks the current page', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'phone', 'The full navigation shows from 1280px.');
  await open(page);
  const nav = page.getByRole('navigation', { name: 'Main' });
  await nav.getByRole('link', { name: /Our Work/ }).click();

  await expect(page).toHaveURL(/\/work$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Work that moves the numbers.' })).toBeVisible();
  await expect(nav.getByRole('link', { name: /Our Work/ })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[class*="curtain"]')).toHaveCount(0, { timeout: 5000 });
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  await page.getByRole('region', { name: 'Next page' }).getByRole('link').click();
  await expect(page).toHaveURL(/\/events$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Moments worth keeping.' })).toBeVisible();
});

test('the gallery viewer opens, moves between photos, and is removed on close', async ({ page }) => {
  await open(page, '/events');
  const opener = page.getByRole('button', { name: 'Open photo: Haldi morning' });
  await opener.scrollIntoViewIfNeeded();
  await opener.click();

  const viewer = page.getByRole('dialog', { name: 'Photo viewer' });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByRole('button', { name: 'Close' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(viewer.getByText('The pheras')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(viewer).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('the menu bursts open, traps focus and takes you to another page', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'The Menu button shows below 1280px.');
  await open(page);
  const toggle = page.getByRole('button', { name: 'Menu' });
  await toggle.click();
  const menu = page.getByRole('dialog', { name: 'Menu' });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('button', { name: 'Close' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(toggle).toBeFocused();

  await toggle.click();
  await page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: /Clientele/ }).click();
  await expect(page.getByRole('dialog', { name: 'Menu' })).toHaveCount(0);
  await expect(page).toHaveURL(/\/clientele$/);
  await expect(page.getByRole('heading', { level: 1, name: 'The company we keep.' })).toBeVisible();
});

test('the enquiry form validates, then thanks the visitor', async ({ page }) => {
  await page.route('**/api/enquiry', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: null, error: null }) })
  );
  await open(page, '/contact');
  await page.locator('#contact').scrollIntoViewIfNeeded();

  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByLabel('Your name')).toBeFocused();
  await expect(page.getByText('Tell us your name.')).toBeVisible();

  await page.getByLabel('Your name').fill('Asha');
  await page.getByLabel('Phone or email').fill('9082322109');
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByRole('heading', { name: 'Thank you, Asha.' })).toBeFocused();
});

test('with reduced motion, there is no intro or curtain and content shows without movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/services');
  await expect(page.locator('.preloader')).toHaveCount(0, { timeout: 2000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const services = page.locator('#services');
  await services.scrollIntoViewIfNeeded();
  await expect(services.getByRole('heading', { name: 'Branding' })).toBeVisible();

  await page.getByRole('region', { name: 'Next page' }).getByRole('link').click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.locator('[class*="curtain"]')).toHaveCount(0);
});

test('an unknown address shows the 404 page', async ({ page }) => {
  const response = await page.goto('/not-a-real-page');
  expect(response?.status()).toBe(404);
  await expect(page.locator('.preloader')).toHaveCount(0, { timeout: 10_000 });
  await expect(page.getByRole('heading', { level: 1, name: "This page hasn't begun yet." })).toBeVisible();
});

test('the sitemap lists every page', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const route of ROUTES.slice(1)) expect(xml).toContain(`${route}</loc>`);
});

test('the enquiry API answers with the standard envelope', async ({ request }, testInfo) => {
  const res = await request.post('/api/enquiry', {
    headers: { 'x-forwarded-for': `e2e-${testInfo.project.name}-${Date.now()}` },
    data: { name: 'Asha', contact: 'asha@example.com', service: 'Branding' }
  });
  expect(res.status()).toBe(503);
  expect(await res.json()).toMatchObject({ success: false, data: null, code: 'not_configured' });
});
