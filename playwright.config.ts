import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4310);

/* E2E runs against a production build in the locally installed Chrome (no browser download needed).
   Set E2E_CHANNEL=msedge to use Edge instead. */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: process.env.E2E_CHANNEL ?? 'chrome',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'phone', use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } }
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000
  }
});
