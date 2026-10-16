import {test, expect} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {chooseCatalogueScope} from '../browser/helpers/catalogue-scope.js';

let served;
test.beforeAll(async () => {
  served = await serveRoot(fileURLToPath(new URL('../../site/', import.meta.url)));
});
test.afterAll(async () => {
  served.server.closeAllConnections();
  await new Promise(resolve => served.server.close(resolve));
});
test.beforeEach(async ({page}) => {
  page.on('pageerror', error => { throw error; });
});

test('menu supports keyboard choice, dismissal and focus return', async ({page}) => {
  await page.goto(`${served.url}/index.html?card=DsMenu`);
  const frame = page.frameLocator('#preview');
  const trigger = frame.getByRole('button', {name: 'Период', exact: true});
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  const menu = frame.getByRole('menu', {name: 'Период', exact: true});
  await expect(menu).toBeVisible();
  await expect(frame.getByRole('menuitemradio', {name: 'Сегодня', exact: true})).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(trigger).toBeFocused();
  await expect(menu).toHaveCount(0);
  await expect(frame.getByRole('status', {name: 'Выбранный период'})).toContainText('За неделю');
  await trigger.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('select validates forms, submits selection and resets', async ({page}) => {
  await page.goto(`${served.url}/index.html?card=DsSelect`);
  const frame = page.frameLocator('#preview');
  const select = frame.getByRole('combobox', {name: 'Группа для отчёта', exact: true});
  const save = frame.getByRole('button', {name: 'Сохранить', exact: true});
  await save.click();
  await expect(select).toBeFocused();
  await expect(select).toHaveAttribute('aria-invalid', 'true');
  await select.press('ArrowDown');
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect(select).toContainText('Грузовики');
  await expect(select).not.toHaveAttribute('aria-invalid');
  await save.click();
  await expect(frame.getByRole('status').filter({hasText: 'Сохранено:'})).toHaveText('Сохранено: trucks');
  await frame.getByRole('button', {name: 'Сбросить', exact: true}).click();
  await expect(select).toContainText('Выберите вариант');
});

test('select popover in dialog consumes first Escape and restores focus', async ({page}) => {
  await page.goto(`${served.url}/index.html?card=DsSelect`);
  const frame = page.frameLocator('#preview');
  const trigger = frame.getByRole('button', {name: 'Открыть настройки'});
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = frame.getByRole('dialog', {name: 'Настройки отчёта'});
  const select = dialog.getByRole('combobox', {name: 'Группа в настройках'});
  await expect(dialog).toBeVisible();
  await select.focus();
  await select.press('ArrowDown');
  const list = frame.getByRole('listbox');
  await expect(list).toBeVisible();
  expect(await list.evaluate(node => node.closest('[popover]').matches(':popover-open'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(list).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await expect(select).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('four scopes preserve state and narrow contents navigation has no overflow', async ({page}) => {
  await page.goto(`${served.url}/index.html?card=DsCheckbox`);
  const frame = page.frameLocator('#preview');
  const checkbox = frame.getByRole('checkbox', {name: 'Отправка команд', exact: true});
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(checkbox).not.toBeChecked();
  const demo = frame.locator('[data-ds-example-demo]').first();
  const background = await demo.evaluate(node => getComputedStyle(node).backgroundColor);
  for (const [theme, appearance, density] of [
    ['DEFAULT', 'light', 'cozy'], ['DEFAULT', 'dark', 'compact'],
    ['RED2', 'light', 'cozy'], ['RED2', 'dark', 'compact'],
  ]) {
    for (const [axis, value] of Object.entries({theme, appearance, density})) {
      await chooseCatalogueScope(page, axis, value);
      await expect(demo).toHaveAttribute(`data-ds-${axis}`, value);
    }
    await expect(checkbox).not.toBeChecked();
    if (appearance === 'dark') expect(await demo.evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe(background);
  }
  await page.setViewportSize({width: 390, height: 900});
  const contents = page.locator('.page-contents');
  await contents.locator('summary').click();
  const link = contents.getByRole('link', {name: 'Правила применения', exact: true});
  await link.focus();
  await link.press('Enter');
  await expect(page).toHaveURL(/#.+/);
  await expect(page.locator('#card-description h2').first()).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect.poll(() => page.locator('#preview').evaluate(node => node.contentDocument.documentElement.scrollWidth <= node.clientWidth)).toBe(true);
});
