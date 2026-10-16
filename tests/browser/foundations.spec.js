import {chooseCatalogueScope} from './helpers/catalogue-scope.js';
import { test, expect } from '@playwright/test';
import { buildCatalogue } from '../../tools/catalog/build.mjs';
import { serveRoot } from '../../tools/baseline/render.mjs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
test.use({ actionTimeout: 10000 });

test('foundation and map descriptions stay with examples through navigation and scoped links', async ({ page }, testInfo) => {
  const cards = await buildCatalogue({ root, outDir: `${root}/site` });
  const foundations = cards.filter(card => ['2 · Основы', '3 · Миграция', '4 · Бренд (общее)', '6 · Карта'].includes(card.group));
  const served = await serveRoot(`${root}/site`);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
  try {
    await page.goto(served.url + '/index.html?card=DsBreakpoints');
    await expect(page.locator('[data-navigation-group=foundations] h3')).toHaveText([
      'Визуальный язык', 'Режимы интерфейса', 'Состояния контролов',
      'Компоновка и данные', 'Бренд и темы',
    ]);
    const foundationLinks = page.locator('[data-navigation-group=foundations] a[data-id]');
    expect(await foundationLinks.evaluateAll(links => links.map(link => link.dataset.id))).toEqual([
      'DsType', 'DsNeutrals', 'DsShape', 'DsStatus',
      'DsAppearance', 'DsDensity', 'DsHover', 'DsFocus',
      'DsBreakpoints', 'DsSortingMenu', 'DsCharts', 'DsBrandThemes', 'DsBrandPick', 'BrandLogoLockup',
    ]);
    await page.locator('#search').fill('сортировка');
    await expect(page.locator('[data-navigation-group=foundations] h3')).toHaveText(['Режимы интерфейса', 'Компоновка и данные']);
    await expect(foundationLinks).toHaveText(['Плотность интерфейса', 'Сортировка вне таблицы']);
    await page.locator('#search').fill('визуальный язык');
    await expect(page.locator('[data-navigation-group=foundations] h3')).toHaveText(['Визуальный язык']);
    await expect(foundationLinks).toHaveText(['Типографика', 'Нейтральные цвета', 'Форма и глубина', 'Цвета статусов']);
    await foundationLinks.first().focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#title')).toHaveText('Типографика');
    await expect(foundationLinks.first()).toHaveAttribute('aria-current', 'page');
    await page.locator('#search').fill('');
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
      await expect(page.locator(`nav a[data-id="${card.id}"]`).locator('xpath=preceding-sibling::h2[1]')).toHaveText(['2 · Основы','4 · Бренд (общее)'].includes(card.group)?'Основы':card.group.replace(/^\d+ · /,''));
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
    await page.frameLocator('#preview').getByRole('link', { name: 'подбор цветов темы' }).click();
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
    await expect(page.locator('#compare')).toHaveCount(0);
    await expect(page.locator('#viewports iframe')).toHaveCount(1);
    await expect(description).toHaveCount(1);
    for (const [index, scope] of [['RED2', 'dark', 'compact']].entries()) {
      const frame = page.frameLocator('#preview');
      for (const [axis, value] of ['theme', 'appearance', 'density'].map((axis, i) => [axis, scope[i]]))
        await expect(frame.locator('html')).toHaveAttribute('data-ds-' + axis, value);
    }
    await page.locator('nav a[data-id="DsBreakpointsDecisions"]').click();
    await expect(description).toBeVisible();
    for (let index = 0; index < 1; index++) {
      const frame = page.frameLocator('#preview');
      await expect(frame.getByRole('heading', { name: 'Статус миграции', exact: true })).toBeVisible();
      await expect.poll(() => frame.locator('body').evaluate(body =>
        body.scrollHeight <= window.innerHeight + 1 && document.documentElement.scrollWidth <= window.innerWidth
      )).toBe(true);
    }
    await expect(page.locator('.document-preview .preview-scroll').first()).toHaveCSS('overflow', 'visible');
    await expect(page.locator('#preview')).toHaveCSS('border-top-width', '0px');
    for (const id of ['DsType', 'DsHover', 'DsSortingMenu', 'DsBrandThemes', 'IconsArrows', 'IconsMapAssets', 'MapTrack']) {
      await page.locator(`nav a[data-id="${id}"]`).click();
      for (let index = 0; index < 1; index++) {
        const frame = page.frameLocator('#preview');
        for (const [axis,value] of Object.entries({theme:'RED2',appearance:'dark',density:'compact'}))
          await expect(frame.locator('html')).toHaveAttribute('data-ds-'+axis,value);

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
    await expect(description).toBeVisible();
    await expect(description.getByRole('heading', { name: 'Параметры', exact: true })).toBeVisible();
    await expect(page.locator('#reference-links')).toBeHidden();
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
    await page.goto(served.url + '/api/tokens.html?theme=RED2&appearance=dark&density=compact');
    await page.getByRole('button', { name: 'Навигация', exact: true }).click();
    await expect(page.locator('[data-navigation-group=foundations] h3')).toHaveCount(5);
    await page.locator('#search').fill('бренд и темы');
    await expect(page.locator('[data-navigation-group=foundations] h3')).toHaveText(['Режимы интерфейса','Бренд и темы']);
    await expect(foundationLinks).toHaveText(['Светлый и тёмный режим','Цветовые темы','Подбор цветов темы','Логотип бренда']);
    await page.locator('nav a[data-id=DsBrandPick]').click();
    await expect(page.locator('#title')).toHaveText('Подбор цветов темы');
    await expect(page.locator('#theme')).toContainText('RED2');
    await expect(page.locator('#appearance')).toContainText('Тёмное');
    expect(errors).toEqual([]);
  } finally {
    served.server.closeAllConnections();
    await new Promise(resolve => served.server.close(resolve));
  }
});
