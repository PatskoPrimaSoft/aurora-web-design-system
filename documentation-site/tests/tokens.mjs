import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export async function checkTokens({ root, page, url, modes }) {
  // Token samples intentionally show primitive values, including low-contrast text.
  // Check the page UI with axe while excluding these educational sample surfaces.
  const tokenMetadata = JSON.parse(
    readFileSync(join(root, 'documentation-site/.tmp/tokens-page.generated.json'), 'utf8'),
  );
  const { readTokenModel } = await import(
    pathToFileURL(join(root, 'design-system/tools/tokens/model.mjs')).href
  );
  const tokenModel = readTokenModel(
    JSON.parse(readFileSync(join(root, 'design-system/tokens/source.json'), 'utf8')),
  );
  assert.deepEqual(
    tokenMetadata.entries.map((entry) => entry.name),
    tokenModel.names,
  );
  await page.goto(url + 'tokens');
  await expect(page.locator('h1')).toHaveText('Дизайн-токены');
  const layout = await page.locator('.token-page-content').evaluate((element) => {
    const content = element.getBoundingClientRect();
    const main = element.closest('main').getBoundingClientRect();
    return {
      width: content.width,
      offset: Math.abs(content.left + content.width / 2 - main.left - main.width / 2),
    };
  });
  assert.ok(layout.width <= 1088, 'Token content must keep its original maximum width');
  assert.ok(layout.offset <= 1, 'Token content must be centred in the main area');
  const tokenPage = page.locator('.token-reference');
  const searchTokens = tokenPage.getByRole('searchbox', { name: 'Поиск токенов' });
  await expect(page.locator('[data-token-row]')).toHaveCount(tokenModel.names.length);
  await expect(tokenPage.locator('.token-count')).toHaveText(
    tokenMetadata.entries.filter((entry) => entry.group === 'main').length +
      ' из ' +
      tokenModel.names.length +
      ' токенов',
  );
  await tokenPage.locator('[data-token-group="chart"]').click();
  await expect(page).toHaveURL(/group=chart/);
  await expect(tokenPage.locator('[data-token-row]:visible')).toHaveCount(
    tokenMetadata.entries.filter((entry) => entry.group === 'chart').length,
  );
  await searchTokens.fill('--ds-series-1');
  await expect(tokenPage.locator('[data-token-row]:visible')).toHaveCount(1);
  await page.reload();
  await expect(searchTokens).toHaveValue('--ds-series-1');
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value) => {
          window.__copiedToken = value;
        },
      },
    }),
  );
  await tokenPage.locator('[data-copy="--ds-series-1"]').click();
  await expect(tokenPage.locator('.token-copy-status')).toHaveText(
    'Скопировано: var(--ds-series-1)',
  );
  assert.equal(await page.evaluate(() => window.__copiedToken), 'var(--ds-series-1)');
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('Clipboard unavailable');
        },
      },
    }),
  );
  await tokenPage.locator('[data-copy="--ds-series-1"]').click();
  await expect(tokenPage.locator('.token-copy-status')).toHaveText(
    'Для копирования: var(--ds-series-1)',
  );
  await searchTokens.fill('no-such-token-xyz');
  await expect(tokenPage.locator('.token-empty')).toBeVisible();
  await expect(tokenPage.locator('[data-token-row]:visible')).toHaveCount(0);
  await tokenPage.locator('[data-token-group="base"]').click();
  await expect(searchTokens).toHaveValue('');
  await tokenPage.getByRole('combobox', { name: 'Категория', exact: true }).selectOption('radius');
  await expect(tokenPage.locator('[data-token-row]:visible')).toHaveCount(
    tokenMetadata.entries.filter((entry) => entry.category === 'radius').length,
  );
  for (const [theme, appearance, density] of modes) {
    await page.goto(
      url +
        'tokens?category=text&theme=' +
        theme +
        '&appearance=' +
        appearance +
        '&density=' +
        density,
    );
    await expect(tokenPage.getByRole('combobox', { name: 'Бренд', exact: true })).toHaveValue(
      theme,
    );
    await expect(
      tokenPage.locator('[data-theme-value="' + theme + '.light"]:visible').first(),
    ).toBeVisible();
    await expect(
      tokenPage.locator(
        '[data-theme-value="' + (theme === 'RED2' ? 'DEFAULT' : 'RED2') + '.light"]:visible',
      ),
    ).toHaveCount(0);
    const tokenAxe = await new AxeBuilder({ page }).exclude('.token-sample').analyze();
    assert.deepEqual(
      tokenAxe.violations.map((item) => ({
        id: item.id,
        targets: item.nodes.map((node) => node.target),
      })),
      [],
      theme + ' token page UI accessibility',
    );
  }
  await tokenPage.getByRole('combobox', { name: 'Бренд', exact: true }).selectOption('DEFAULT');
  await expect(page.getByRole('combobox', { name: 'Бренд демонстраций' })).toHaveValue('DEFAULT');
  await page.goto(url + 'tokens?group=chart&q=series#ds-n-400');
  await expect(page.locator('#ds-n-400')).toBeVisible();
  await expect(page.locator('#ds-n-400')).toBeFocused();
  await expect(searchTokens).toHaveValue('');
  await expect(page).toHaveURL(/group=base/);
  await page.reload();
  await expect(page.locator('#ds-n-400')).toBeFocused();
  await tokenPage.getByRole('combobox', { name: 'Категория', exact: true }).selectOption('motion');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const motionButton = tokenPage.locator('.token-motion:visible').first();
  await motionButton.focus();
  await page.keyboard.press('Enter');
  await expect(tokenPage.locator('.token-copy-status')).toHaveText(
    'Движение отключено в настройках системы.',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await motionButton.click();
  await page.goto(url + 'tokens?q=--ds-brand-text');
  await page.screenshot({ path: join(root, '.tmp/tokens-wide.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url + 'tokens?q=--ds-brand-text&theme=RED2');
  await expect(tokenPage.locator('[data-token-row]:visible')).toHaveCount(1);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: join(root, '.tmp/tokens-mobile.png') });
  const tokenMobileAxe = await new AxeBuilder({ page }).exclude('.token-sample').analyze();
  assert.deepEqual(
    tokenMobileAxe.violations.map((item) => item.id),
    [],
    'mobile token page UI accessibility',
  );
  await page.setViewportSize({ width: 1472, height: 1000 });
}
