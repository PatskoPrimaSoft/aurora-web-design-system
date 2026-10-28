import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { checkPaletteCalculator } from './palette-calculator.mjs';

export async function createSiteFixture() {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const output = join(root, '.tmp/documentation-site-check/browser');
  const base = '/site-check/';
  checkPaletteCalculator(root);
  const navigationSource = readFileSync(
    join(root, 'documentation-site/src/app/navigation.ts'),
    'utf8',
  ).split('export const componentNavigation')[0];
  const routeSource = readFileSync(join(root, 'documentation-site/src/app/app.routes.ts'), 'utf8');
  const implementedPaths = new Set(
    [...routeSource.matchAll(/path: '([^']*)'/g)].map((match) => '/' + match[1]),
  );
  for (const [, path] of navigationSource.matchAll(/path: '([^']+)'/g)) {
    assert.ok(
      implementedPaths.has(path),
      'Guide menu item must have an explicit page route: ' + path,
    );
  }
  assert.ok(
    readFileSync(join(output, 'index.html'), 'utf8').includes(`href="${base}"`),
    'Build the site for /site-check/ before running this check',
  );

  // Emulates a static host with SPA fallback, not GitHub Pages' 404 behaviour.
  const server = createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!pathname.startsWith(base)) {
      response.writeHead(404).end();
      return;
    }
    let file = resolve(output, pathname.slice(base.length) || 'index.html');
    const local = relative(output, file);
    if (local.startsWith('..') || isAbsolute(local)) {
      response.writeHead(403).end();
      return;
    }
    if (!existsSync(file) || statSync(file).isDirectory()) {
      if (extname(file)) {
        response.writeHead(404).end();
        return;
      }
      file = join(output, 'index.html');
    }
    const type =
      {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.woff2': 'font/woff2',
      }[extname(file)] ?? 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type }).end(readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let browser;
  async function close() {
    try {
      if (browser) await browser.close();
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  }
  try {
    browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
    const context = await browser.newContext({ viewport: { width: 1472, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`);
    });
    const url = `http://127.0.0.1:${server.address().port}${base}`;
    const modes = [
      ['DEFAULT', 'light', 'cozy'],
      ['DEFAULT', 'dark', 'compact'],
      ['RED2', 'light', 'cozy'],
      ['RED2', 'dark', 'compact'],
    ];
    return { root, page, url, modes, browser, errors, close };
  } catch (error) {
    await close();
    throw error;
  }
}
