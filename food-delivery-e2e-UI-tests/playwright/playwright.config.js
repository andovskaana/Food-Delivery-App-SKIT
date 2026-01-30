// @ts-check
/**
 * Playwright configuration for the food delivery frontend tests.  See
 * https://playwright.dev/docs/test-configuration for more details.
 */

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  retries: 0,
  use: {
    // Base URL of the running frontend.  Adjust the port to match the
    // vite dev server (vite defaults to 5173).  Tests assume the backend
    // is running on localhost:8080 and that CORS has been configured.
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
  },
});