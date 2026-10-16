import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
import {chooseCatalogueScope} from './helpers/catalogue-scope.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const scopes = [['DEFAULT', 'light', 'cozy'], ['DEFAULT', 'dark', 'compact'], ['RED2', 'light', 'cozy'], ['RED2', 'dark', 'compact']];

test('neutrals guide adapts its samples and keeps section navigation usable in every scope', async ({page}, testInfo) => {
  await buildCatalogue({root, outDir: root + '/site'});
  const served = await serveRoot(root + '/site');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    for (const [theme, appearance, density] of scopes) {
      for (const width of [1440, 390]) {
        await page.setViewportSize({width, height: 900});
        await page.goto(`${served.url}/index.html?card=DsNeutrals&theme=${theme}&appearance=${appearance}&density=${density}`);
        const frame = page.frameLocator('#preview');
        const contents = page.locator('.page-contents');
        await expect(contents).toHaveCount(1);
        if (width === 1440) {
          await expect(contents).toHaveCSS('position', 'sticky');
          const box = await contents.boundingBox();
          const preview = await page.locator('#preview').boundingBox();
          expect(box.x).toBeGreaterThanOrEqual(preview.x + preview.width);
        } else {
          await expect(contents.locator('details')).not.toHaveAttribute('open', '');
          await contents.locator('summary').click();
        }
        await contents.getByRole('link', {name: 'Поверхности', exact: true}).focus();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/#surfaces$/);
        await expect(frame.locator('#surfaces')).toBeFocused();
        await expect(frame.locator('#surfaces')).toBeInViewport();
        await page.reload();
        await expect(frame.locator('#surfaces')).toBeInViewport();
        await expect(frame.locator('[data-neutral-sample="surface"]')).toHaveCSS('background-color', appearance === 'light' ? 'rgb(255, 255, 255)' : 'rgb(21, 25, 31)');
        await expect(frame.locator('[data-neutral-sample="fg"]')).toHaveCSS('color', appearance === 'light' ? 'rgb(29, 34, 44)' : 'rgb(238, 240, 244)');
        const fgContrast = frame.locator('[data-contrast="fg/surface"]');
        await expect(fgContrast).toContainText(appearance === 'light' ? '15,94' : '15,46');
        await expect(frame.locator('[data-contrast="fg-subtle/surface-raised"]')).toHaveAttribute('data-passes', appearance === 'light' ? 'true' : 'false');
        const selected = frame.getByRole('button', {name: 'МАЗ 5440', exact: true});
        await selected.focus();
        await page.keyboard.press('Space');
        await expect(selected).toHaveAttribute('aria-pressed', 'true');
        await expect(selected).toHaveCSS('outline-style', 'solid');
        await selected.hover();
        await expect(selected).toHaveAttribute('aria-pressed', 'true');
        await expect(frame.locator('#interaction-status')).toContainText('Выбран');
        await expect(frame.getByRole('button', {name: 'Недоступный объект', exact: true})).toBeDisabled();
        const checkbox = frame.getByRole('checkbox', {name: 'Показывать треки', exact: true});
        await checkbox.focus();
        await page.keyboard.press('Space');
        await expect(checkbox).toBeChecked();
        await frame.getByRole('textbox', {name: 'Название объекта', exact: true}).fill('Volvo FH16');
        await expect(frame.getByRole('textbox', {name: 'Название объекта', exact: true})).toHaveValue('Volvo FH16');
        const menuButton = frame.getByRole('button', {name: 'Действия объекта', exact: true});
        await menuButton.focus();
        await page.keyboard.press('ArrowDown');
        await expect(frame.getByRole('menu', {name: 'Действия объекта'})).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(menuButton).toBeFocused();
        if (width === 390) {
          await frame.locator('.contrast-scroll').focus();
          await page.keyboard.press('ArrowRight');
          await expect.poll(() => frame.locator('.contrast-scroll').evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
        }
        await frame.locator('#object-details summary').focus();
        await page.keyboard.press('Enter');
        await expect(frame.locator('#object-details p')).toBeVisible();
        await page.keyboard.press('Space');
        await expect(frame.locator('#object-details')).not.toHaveAttribute('open', '');
        for (const reference of ['palette', 'alpha']) {
          const disclosure = frame.locator(`section[aria-labelledby="${reference}"] details`);
          await expect(disclosure).not.toHaveAttribute('open', '');
          await disclosure.locator('summary').focus();
          await page.keyboard.press('Enter');
          await expect(disclosure).toHaveAttribute('open', '');
        }
        await expect.poll(() => page.locator('#preview').evaluate(iframe => ({
          fits: iframe.clientHeight >= iframe.contentDocument.body.scrollHeight,
          width: iframe.contentDocument.documentElement.scrollWidth <= iframe.clientWidth,
        }))).toEqual({fits: true, width: true});
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect((await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
        if (theme === 'DEFAULT' && appearance === 'light') {
          await page.goto(`${served.url}/index.html?card=DsNeutrals`);
          await expect(page.frameLocator('#preview').locator('#in-interface')).toBeVisible();
          await page.screenshot({path: testInfo.outputPath(`neutrals-${width}.png`)});
          for (const section of ['surfaces', 'contrast', 'guidelines', 'alpha', 'usage']) {
            await page.frameLocator('#preview').locator('#' + section).scrollIntoViewIfNeeded();
            await page.screenshot({path: testInfo.outputPath(`neutrals-${section}-${width}.png`)});
          }
        }
      }
    }
    await chooseCatalogueScope(page, 'appearance', 'light');
    const contrast = page.frameLocator('#preview').locator('[data-contrast="fg/surface"]');
    await expect(contrast).toContainText('15,94');
    await chooseCatalogueScope(page, 'appearance', 'dark');
    await expect(contrast).toContainText('15,46');
    await page.frameLocator('#preview').locator('html').evaluate(node => {
      node.style.setProperty('--ds-fg', '#000000');
      node.style.setProperty('--ds-surface', '#ffffff');
    });
    await expect(contrast).toContainText('21,00');
    await page.frameLocator('#preview').locator('html').evaluate(node => node.style.setProperty('--ds-fg', '#ffffff'));
    await expect(contrast).toContainText('1,00');
    await expect(contrast).toHaveAttribute('data-passes', 'false');
    await page.frameLocator('#preview').locator('html').evaluate(node => {
      node.style.setProperty('--ds-fg', '#070707');
      node.style.setProperty('--ds-surface', '#777777');
    });
    await expect(contrast).toContainText('4,50');
    await expect(contrast).toHaveAttribute('data-passes', 'false');
    await page.frameLocator('#preview').locator('html').evaluate(node => node.removeAttribute('style'));
    await expect(contrast).toContainText('15,46');
    const count = await page.locator('.page-contents a').count();
    await expect(page.locator('#compare')).toHaveCount(0);
    await expect(page.locator('#viewports iframe')).toHaveCount(1);
    await expect(page.locator('.page-contents a')).toHaveCount(count);
    await page.locator('.page-contents summary').click();
    await page.locator('.page-contents').getByRole('link', {name: 'Исходная шкала', exact: true}).click();
    await expect(page.frameLocator('#preview').locator('#palette')).toBeFocused();
    for (let index = 0; index < 1; index++) {
      await expect.poll(() => page.locator('#preview').evaluate(iframe =>
        iframe.contentDocument.documentElement.scrollWidth <= iframe.clientWidth && iframe.clientHeight >= iframe.contentDocument.body.scrollHeight
      )).toBe(true);
    }
    await expect(page.locator('#card-description').getByRole('button', {name: 'Копировать код'})).toHaveCount(1);
    await page.locator('#card-description').getByRole('link', {name: 'Оформление интерфейса', exact: true}).click();
    await expect(page.locator('#title')).toHaveText('Светлый и тёмный режим');
    expect(errors).toEqual([]);
  } finally {
    served.server.closeAllConnections();
    await new Promise(resolve => served.server.close(resolve));
  }
});
