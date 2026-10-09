import { test, expect } from '@playwright/test';
import { buildCatalogue } from '../../tools/catalog/build.mjs';
import { serveRoot } from '../../tools/baseline/render.mjs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));

test('density comparison keeps local sizes and synchronized controls in four scopes', async ({ page }, testInfo) => {
  await buildCatalogue({ root, outDir: `${root}/site` });
  const served = await serveRoot(`${root}/site`);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(served.url + '/index.html?card=DsDensity&compare=1');
    await expect(page.locator('#title')).toHaveText('Плотность интерфейса');
    for (let index = 0; index < 4; index++) {
      const frame = page.frameLocator('#preview-' + index);
      for (const [density, rowHeight, buttonHeight, fieldHeight] of [['cozy', 44, 36, 40], ['compact', 34, 30, 32]]) {
        const sample = frame.locator('section[data-ds-density="' + density + '"]');
        await expect(sample.getByRole('table')).toBeVisible();
        await expect(sample.locator('tbody tr')).toHaveCount(4);
        await expect(sample.locator('tbody tr').first()).toHaveCSS('height', rowHeight + 'px');
        await expect(sample.getByRole('button', { name: 'Сбросить' })).toHaveCSS('height', buttonHeight + 'px');
        await expect(sample.locator('[data-ds-field]')).toHaveCSS('height', fieldHeight + 'px');
      }
      await frame.getByRole('textbox', { name: 'Поиск объекта' }).first().fill('Volvo');
      await expect(frame.locator('tbody tr')).toHaveCount(2);
      await expect(frame.getByRole('textbox').last()).toHaveValue('Volvo');
      await frame.getByRole('button', { name: 'Сбросить' }).last().focus();
      await page.keyboard.press('Enter');
      await expect(frame.locator('tbody tr')).toHaveCount(8);
      await expect(frame.getByRole('textbox').first()).toHaveValue('');
      await frame.getByRole('button', { name: 'Объект: сортировать по убыванию', exact: true }).first().focus();
      await page.keyboard.press('Enter');
      for (const table of await frame.getByRole('table').all()) {
        await expect(table.locator('th').first()).toHaveAttribute('aria-sort', 'descending');
        await expect(table.locator('tbody tr').first()).toContainText('Volvo FH16');
      }
    }
    await page.goto(served.url + '/components/DsDensity/preview.html');
    await page.setViewportSize({ width: 1180, height: 720 });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath('density-light.png'), fullPage: true });
    await page.setViewportSize({ width: 360, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
    expect(errors).toEqual([]);
  } finally {
    served.server.closeAllConnections();
    await new Promise(resolve => served.server.close(resolve));
  }
});
