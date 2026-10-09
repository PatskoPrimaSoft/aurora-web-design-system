import {chooseCatalogueScope} from './helpers/catalogue-scope.js';
import { test, expect } from '@playwright/test';
import { buildCatalogue } from '../../tools/catalog/build.mjs';
import { serveRoot } from '../../tools/baseline/render.mjs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
test.use({ actionTimeout: 10000 });

test('foundation and map descriptions stay with examples through navigation, comparison and scoped links', async ({ page }, testInfo) => {
  const cards = await buildCatalogue({ root, outDir: `${root}/site` });
  const foundations = cards.filter(card => ['2 · Основы', '3 · Миграция', '4 · Бренд (общее)', '6 · Карта'].includes(card.group));
  const served = await serveRoot(`${root}/site`);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
  try {
    await page.goto(served.url + '/index.html?card=DsBreakpoints');
    const description = page.getByRole('article', { name: 'Правила применения' });
    await expect(description).toBeVisible();
    for (const card of foundations) {
      await page.locator(`nav a[data-id="${card.id}"]`).click();
      await expect(description).toBeVisible();
      await expect(description).not.toHaveText('');
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.locator('#reference-links').getByRole('link', { name: 'Описание', exact: true })).toHaveCount(0);
      await expect(page.locator('#preview')).toHaveAttribute('src', new RegExp(card.id));
      await expect(page.locator('#title')).not.toHaveText(/^Ds/);
      await expect(page.locator(`nav a[data-id="${card.id}"]`).locator('xpath=preceding-sibling::h2[1]')).toHaveText(card.group);
    }
    await page.locator('nav a[data-id="DsBreakpoints"]').click();
    await chooseCatalogueScope(page,'theme','RED2');
    await chooseCatalogueScope(page,'appearance','dark');
    await chooseCatalogueScope(page,'density','compact');
    await description.getByRole('link', { name: '«Плотность интерфейса»', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#title')).toHaveText('Плотность интерфейса');
    await expect(page.locator('#theme')).toContainText('RED2');
    await expect(page.locator('#appearance')).toContainText('Тёмное');
    await page.goBack();
    await expect(page.locator('#title')).toHaveText('Адаптивность и брейкпоинты');
    await page.locator('nav a[data-id="DsBrandThemes"]').click();
    await page.frameLocator('#preview').getByRole('link', { name: '«Как выбрать цвета темы»' }).click();
    await expect(page.locator('#title')).toHaveText('Подбор цветов темы');
    await expect(description).toBeVisible();
    await expect(page.locator('#theme')).toContainText('RED2');
    await expect(page.locator('#appearance')).toContainText('Тёмное');
    await expect(page.locator('#density')).toContainText('Компактная');
    await page.locator('nav a[data-id="IconsArrows"]').click();
    await description.getByRole('link', { name: 'Трек на карте' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#title')).toHaveText('Трек на карте');
    await expect(page.locator('#theme')).toContainText('RED2');
    await expect(page.locator('#appearance')).toContainText('Тёмное');
    await expect(page.locator('#density')).toContainText('Компактная');
    const zoom = page.frameLocator('#preview').getByRole('slider', { name: 'масштаб карты' });
    await zoom.focus();
    await page.keyboard.press('ArrowRight');
    await expect(zoom).toHaveValue('12.25');
    await expect(page.frameLocator('#preview').locator('#zl')).toHaveText('z 12.25');
    await page.locator('nav a[data-id="overview"]').click();
    await page.frameLocator('#preview').getByRole('link', { name: /Типографика/ }).click();
    await expect(page.locator('#title')).toHaveText('Типографика');
    await expect(page.locator('#theme')).toContainText('RED2');
    await expect(page.locator('#appearance')).toContainText('Тёмное');
    await expect(page.locator('#density')).toContainText('Компактная');
    await page.locator('nav a[data-id="DsBreakpoints"]').click();
    await page.locator('#compare').click();
    await expect(page.locator('#viewports iframe')).toHaveCount(4);
    await expect(description).toHaveCount(1);
    for (const [index, scope] of [['DEFAULT', 'light', 'cozy'], ['DEFAULT', 'dark', 'compact'], ['RED2', 'light', 'cozy'], ['RED2', 'dark', 'compact']].entries()) {
      const frame = page.frameLocator('#preview-' + index);
      for (const [axis, value] of ['theme', 'appearance', 'density'].map((axis, i) => [axis, scope[i]]))
        await expect(frame.locator('html')).toHaveAttribute('data-ds-' + axis, value);
    }
    await page.locator('nav a[data-id="DsBreakpointsDecisions"]').click();
    await expect(description).toBeVisible();
    for (let index = 0; index < 4; index++) {
      const frame = page.frameLocator('#preview-' + index);
      await expect(frame.getByRole('heading', { name: 'Статус миграции', exact: true })).toBeVisible();
      await expect.poll(() => frame.locator('body').evaluate(body =>
        body.scrollHeight <= window.innerHeight + 1 && document.documentElement.scrollWidth <= window.innerWidth
      )).toBe(true);
    }
    await expect(page.locator('.document-preview .preview-scroll').first()).toHaveCSS('overflow', 'visible');
    await expect(page.locator('#preview-0')).toHaveCSS('border-top-width', '0px');
    for (const id of ['DsType', 'DsHover', 'DsSorting', 'DsSortingMenu', 'DsBrandThemes', 'IconsArrows', 'IconsMapAssets', 'MapTrack', 'BrandLogoLockup']) {
      await page.locator(`nav a[data-id="${id}"]`).click();
      for (let index = 0; index < 4; index++) {
        const frame = page.frameLocator('#preview-' + index);
        await expect.poll(() => frame.locator('body').evaluate(body => {
          const rootStyle = getComputedStyle(document.documentElement);
          const bodyStyle = getComputedStyle(body);
          return ['--ds-fg', '--ds-brand', '--ds-control-h'].every(token => rootStyle.getPropertyValue(token) === bodyStyle.getPropertyValue(token));
        })).toBe(true);
        if (id === 'DsBrandThemes') await expect.poll(() => frame.locator('.hex').first().evaluate(label =>
          label.textContent === getComputedStyle(document.documentElement).getPropertyValue(label.dataset.token).trim()
        )).toBe(true);
        if (id === 'BrandLogoLockup') {
          await expect(frame.getByRole('heading', { name: 'Знак на разных фонах' })).toBeVisible();
          await expect(frame.getByRole('heading', { name: 'Логотип в шапке' })).toBeVisible();
          await expect(frame.locator('.row')).toHaveCount(2);
          await expect(frame.locator('.row[data-ds-appearance="dark"] img')).toHaveCount(4);
          await expect(frame.locator('img')).toHaveCount(10);
          expect(await frame.locator('body').evaluate(body => body.scrollHeight)).toBeLessThanOrEqual(580);
        }
      }
    }
    await page.goto(served.url + '/index.html?card=BrandLogoMark');
    await expect(page.locator('#title')).toHaveText('Логотип бренда');
    await expect(description).toBeVisible();
    await expect(page.locator('nav a[data-id="BrandLogoMark"]')).toHaveCount(0);
    await page.goto(served.url + '/components/BrandLogoMark/preview.html?theme=RED2&appearance=dark');
    await expect(page.locator('#title')).toHaveText('Логотип бренда');
    await expect(page.locator('#theme')).toContainText('RED2');
    await expect(page.locator('#appearance')).toContainText('Тёмное');
    await page.locator('nav a[data-id="DsButton"]').click();
    await expect(description).toBeHidden();
    await expect(page.locator('#reference-links').getByRole('link', { name: 'Описание', exact: true })).toBeVisible();
    await page.goto(served.url + '/index.html?card=missing');
    await expect(description).toBeHidden();
    await page.goto(served.url + '/index.html?card=DsDensity');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: testInfo.outputPath('foundation-light.png'), animations: 'disabled' });
    await chooseCatalogueScope(page,'appearance','dark');
    await page.screenshot({ path: testInfo.outputPath('foundation-dark.png'), animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(description).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    expect(errors).toEqual([]);
  } finally {
    served.server.closeAllConnections();
    await new Promise(resolve => served.server.close(resolve));
  }
});
