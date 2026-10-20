import { defineConfig } from '@playwright/test';
export default defineConfig({ projects: [
  {name: 'catalogue', testDir: './tests/browser'},
  {name: 'angular', testDir: './ng-ui-kit/tests/browser'},
], workers: 1, timeout: 120000,
  outputDir: '.tmp/browser-results', reporter: 'list', use: { browserName: 'chromium', headless: true } });
