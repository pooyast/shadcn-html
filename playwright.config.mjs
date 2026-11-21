import { defineConfig } from '@playwright/test';

const url = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: url,
    reducedMotion: 'reduce',
    viewport: { width: 1100, height: 760 },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE },
      },
    },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'npm run dev:reference',
    url: url + '/tests/reference/index.html',
    reuseExistingServer: !process.env.CI,
  },
});
