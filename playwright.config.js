/* The site is static, so the tests run against the files in this repo served on
   localhost. Not against a Vercel preview: previews sit behind SSO, which CI
   cannot log in to, and a local run is faster and independent of deploys. */
const { defineConfig, devices } = require('@playwright/test');

const PORT = process.env.PORT || 4321;
const baseURL = `http://127.0.0.1:${PORT}`;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: 'node tests/server.js',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore'
  }
});
