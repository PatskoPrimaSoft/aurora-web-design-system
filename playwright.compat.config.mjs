import {defineConfig} from '@playwright/test';

// Behavioral coverage is shared across engines; pixel baselines stay in the Chromium suite.
export default defineConfig({
  globalSetup: './tests/browser/global-setup.mjs',
  testDir: './tests/browser-compat',
  workers: 1,
  timeout: 60000,
  outputDir: '.tmp/browser-compat-results',
  reporter: 'list',
  use: {headless: true, viewport: {width: 1280, height: 900}, trace: 'retain-on-failure'},
  projects: ['chromium', 'firefox', 'webkit'].map(browserName => ({name: browserName, use: {browserName}})),
});
