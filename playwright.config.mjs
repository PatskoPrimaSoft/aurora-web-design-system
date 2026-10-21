import { defineConfig } from '@playwright/test';
const selected=process.env.AURORA_VERIFY_GROUP;
export default defineConfig({ globalSetup: './design-system/tests/browser/global-setup.mjs', projects: [
  {name: 'catalogue', testDir: './design-system/tests/browser', testIgnore: /(?:components|migration|catalogue-a11y|token-cascade)\.spec\.js$/},
  {name: 'raster', testDir: './design-system/tests/browser', testMatch: /(?:components|migration|catalogue-a11y|token-cascade)\.spec\.js$/, workers: 1},
  {name: 'angular', testDir: './ng-ui-kit/tests/browser', workers: 1},
].filter(project=>!['catalogue','raster','angular'].includes(selected)||project.name===selected), workers: 2, timeout: 120000,
  outputDir: '.tmp/browser-results', reporter: 'list', use: { browserName: 'chromium', headless: true } });
