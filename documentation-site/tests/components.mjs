import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import { pageViolations } from './accessibility.mjs';

/** Public component pages: behaviour and documentation, independent of shell smoke checks. */
export async function checkComponents({ page, url, modes }) {
  for (const width of [1472, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [theme, appearance, density] of modes) {
      await page.goto(
        url + `components/icon?theme=${theme}&appearance=${appearance}&density=${density}`,
      );
      await expect(page.locator('h1')).toHaveText('Icon');
      await expect(page.locator('.example')).toHaveCount(5);
      await expect(page.locator('.example aurora-code-block details[open]')).toHaveCount(0);
      await expect(page.locator('body')).toHaveAttribute('data-ds-appearance', 'light');
      for (const demo of await page.locator('.demo').all()) {
        await expect(demo).toHaveAttribute('data-ds-theme', theme);
        await expect(demo).toHaveAttribute('data-ds-appearance', appearance);
        await expect(demo).toHaveAttribute('data-ds-density', density);
      }
      const headings = await page
        .locator('article h2[id], article h3[id]')
        .evaluateAll((elements) =>
          elements.map((heading) => {
            const copy = heading.cloneNode(true);
            copy.querySelectorAll('aurora-heading-anchor').forEach((anchor) => anchor.remove());
            return copy.textContent ?? '';
          }),
        );
      await expect(page.locator('.page-contents a')).toHaveText(headings.map((s) => s.trim()));
      await expect(page.locator('section[aria-labelledby="parameters"] tbody tr')).toHaveCount(4);
      await expect(page.locator('section[aria-labelledby="tokens"] tbody tr')).toHaveCount(4);
      await page.evaluate(() => document.fonts.ready);

      const decorative = page.locator('#basic-demo ds-icon');
      await expect(decorative).toHaveAttribute('aria-hidden', 'true');
      assert.equal(await decorative.getAttribute('role'), null);
      assert.equal(await decorative.getAttribute('tabindex'), null);
      await expect(page.getByRole('img', { name: 'Доступ ограничен', exact: true })).toBeVisible();

      const actualSizes = await page.locator('#sizes-demo ds-icon').evaluateAll((icons) =>
        icons.map((icon) => ({
          width: getComputedStyle(icon).width,
          height: getComputedStyle(icon).height,
          glyph: getComputedStyle(icon.querySelector('span')).fontSize,
        })),
      );
      const expected = density === 'compact' ? [12, 14, 18, 20] : [14, 16, 20, 24];
      assert.deepEqual(
        actualSizes,
        expected.map((size) => ({ width: `${size}px`, height: `${size}px`, glyph: `${size}px` })),
      );
      for (const icon of await page.locator('#color-demo ds-icon').all()) {
        assert.equal(
          await icon.evaluate((el) => getComputedStyle(el).color),
          await icon.evaluate((el) => getComputedStyle(el.parentElement).color),
        );
      }

      const direction = page.locator('#rotation-demo .row > ds-icon');
      await expect(direction).toHaveAttribute('aria-label', 'Направление: 45°');
      const turn = page.getByRole('button', { name: 'Повернуть на 45°', exact: true });
      await turn.focus();
      await page.keyboard.press('Enter');
      await expect(direction).toHaveAttribute('aria-label', 'Направление: 90°');
      await expect(page.locator('#rotation-demo output')).toHaveText('Курс: 90°');
      await expect(turn).toBeFocused();
      assert.equal(
        await direction.evaluate((el) => getComputedStyle(el).transform),
        'matrix(0, 1, -1, 0, 0, 0)',
      );
      for (let step = 0; step < 6; step++) await turn.click();
      await expect(direction).toHaveAttribute('aria-label', 'Направление: 0°');
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        'Component page must keep table/code overflow inside their containers',
      );
      assert.deepEqual(await pageViolations(page), [], 'Icon page accessibility');
    }
  }
  await page.setViewportSize({ width: 1472, height: 1000 });
  await page.goto(url + 'components/icon#rotation');
  await expect(page.locator('#rotation')).toBeFocused();
  await expect(page.locator('.page-contents a[aria-current="location"]')).toHaveText('Поворот');
  await checkButtonPage({ page, url, modes });
  await checkFabPage({ page, url, modes });
  await checkCheckboxPage({ page, url, modes });
}

async function checkButtonPage({ page, url, modes }) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1472, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [theme, appearance, density] of modes) {
      await page.goto(
        url + `components/button?theme=${theme}&appearance=${appearance}&density=${density}`,
      );
      await expect(page.locator('h1')).toHaveText('Button');
      await expect(page.locator('.example')).toHaveCount(8);
      await expect(page.locator('.example aurora-code-block details[open]')).toHaveCount(0);
      await expect(page.locator('body')).toHaveAttribute('data-ds-appearance', 'light');
      for (const demo of await page.locator('.demo').all()) {
        await expect(demo).toHaveAttribute('data-ds-theme', theme);
        await expect(demo).toHaveAttribute('data-ds-appearance', appearance);
        await expect(demo).toHaveAttribute('data-ds-density', density);
      }
      const headings = await page
        .locator('article h2[id], article h3[id]')
        .evaluateAll((elements) =>
          elements.map((heading) => {
            const copy = heading.cloneNode(true);
            copy.querySelectorAll('aurora-heading-anchor').forEach((anchor) => anchor.remove());
            return copy.textContent ?? '';
          }),
        );
      await expect(page.locator('.page-contents a')).toHaveText(headings.map((s) => s.trim()));
      await expect(page.locator('#button-tones-demo button')).toHaveCount(7);
      await page.evaluate(() => document.fonts.ready);

      const basic = page.getByRole('button', { name: 'Выполнить действие', exact: true });
      await basic.focus();
      await page.keyboard.press('Space');
      await expect(page.locator('#button-basic-demo [role="status"]')).toHaveText('Нажатий: 1');
      await expect(basic).toHaveAttribute('type', 'button');

      const onlyIcons = page.locator('#button-icons-demo button[aria-label]');
      await expect(onlyIcons).toHaveCount(3);
      for (const button of await onlyIcons.all()) {
        const geometry = await button.evaluate((el) => {
          const style = getComputedStyle(el);
          const size = el.getAttribute('data-ds-size');
          return {
            width: el.getBoundingClientRect().width,
            height: el.getBoundingClientRect().height,
            expected: parseFloat(
              style.getPropertyValue(size === 'md' ? '--ds-control-h' : '--ds-control-h-' + size),
            ),
            padding: style.paddingLeft,
          };
        });
        assert.equal(geometry.width, geometry.expected);
        assert.equal(geometry.height, geometry.expected);
        assert.equal(geometry.padding, '0px');
        await expect(button.locator('ds-icon')).toHaveAttribute('aria-hidden', 'true');
      }
      await page.getByRole('button', { name: 'Добавить запись: md', exact: true }).click();
      await expect(page.locator('#button-icons-demo [role="status"]')).toHaveText(
        'Действий выполнено: 1',
      );

      const disabled = page.getByRole('button', { name: 'Выполнить', exact: true });
      await expect(disabled).toBeDisabled();
      await disabled.evaluate((el) => el.click());
      await expect(page.locator('#button-disabled-demo [role="status"]')).toHaveText(
        'Выполнено: 0',
      );
      await page.getByRole('button', { name: 'Разрешить действие', exact: true }).click();
      await disabled.click();
      await expect(page.locator('#button-disabled-demo [role="status"]')).toHaveText(
        'Выполнено: 1',
      );

      const save = page.getByRole('button', { name: 'Сохранить изменения', exact: true });
      const before = await save.boundingBox();
      await save.click();
      await expect(save).toHaveAttribute('aria-busy', 'true');
      await expect(save).toHaveAttribute('aria-disabled', 'true');
      // ARIA marks loading as unavailable, while the native button keeps focus.
      assert.equal(await save.evaluate((el) => el.disabled), false);
      const during = await save.boundingBox();
      assert.equal(during.width, before.width);
      assert.equal(during.height, before.height);
      await save.evaluate((el) => el.click());
      await expect(page.locator('#button-loading-demo')).toContainText('Запущено операций: 1');
      await expect(page.locator('#button-loading-demo [role="status"]')).toHaveText(
        'Изменения сохранены.',
      );
      await expect(save).not.toHaveAttribute('aria-busy', 'true');

      const field = page.getByLabel('Название объекта', { exact: true });
      await field.fill('Проверка');
      await page.getByRole('button', { name: 'Обычное действие', exact: true }).click();
      await expect(page.locator('#button-form-demo [role="status"]')).toContainText(
        'форма не отправлена',
      );
      await page.getByRole('button', { name: 'Отправить', exact: true }).click();
      await expect(page.locator('#button-form-demo [role="status"]')).toHaveText(
        'Отправлено: Проверка',
      );
      await field.fill('');
      await page.getByRole('button', { name: 'Отправить', exact: true }).click();
      await expect(field).toBeFocused();
      await page.getByRole('button', { name: 'Сбросить', exact: true }).click();
      await expect(field).toHaveValue('Новый объект');
      await expect(page.locator('#button-form-demo [role="status"]')).toHaveText('Форма сброшена.');
      for (const button of await page.locator('#button-layout-demo button').all()) {
        assert.equal(await button.evaluate((el) => el.scrollWidth <= el.clientWidth), true);
      }
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(await pageViolations(page), [], 'Button page accessibility');
    }
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1472, height: 1000 });
}

async function checkFabPage({ page, url, modes }) {
  for (const width of [1472, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [theme, appearance, density] of modes) {
      await page.goto(
        url + 'components/fab?theme=' + theme + '&appearance=' + appearance + '&density=' + density,
      );
      await expect(page.locator('h1')).toHaveText('FAB');
      await expect(page.locator('.example')).toHaveCount(5);
      await expect(page.locator('.example details[open]')).toHaveCount(0);
      for (const demo of await page.locator('.demo').all()) {
        await expect(demo).toHaveAttribute('data-ds-theme', theme);
        await expect(demo).toHaveAttribute('data-ds-appearance', appearance);
        await expect(demo).toHaveAttribute('data-ds-density', density);
      }
      const sizes = page.locator('#fab-sizes-demo button');
      for (let index = 0; index < 3; index++) {
        const box = await sizes.nth(index).boundingBox();
        assert.equal(box.width, [40, 48, 56][index]);
        assert.equal(box.height, box.width);
      }
      const round = page.locator('#fab-basic-demo button').first();
      await round.focus();
      await expect(round.locator('[role="tooltip"]')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(round.locator('[role="tooltip"]')).toBeHidden();
      await page.keyboard.press('Enter');
      await expect(page.locator('#fab-basic-demo [role="status"]')).toHaveText(
        'Добавлено объектов: 1',
      );
      const long = page.locator('#fab-tooltip-demo button');
      await long.focus();
      await expect(long.locator('[role="tooltip"]')).toBeVisible();
      await expect(long).toHaveAccessibleName('Добавить новый объект в выбранную группу');
      assert.equal(
        await long.locator('[data-ds-fab-label]').evaluate((el) => el.scrollWidth > el.clientWidth),
        true,
      );
      await page.keyboard.press('Escape');
      const save = page.locator('#fab-states-demo button').first();
      const before = await save.boundingBox();
      await save.click();
      await expect(save).toHaveAttribute('aria-busy', 'true');
      assert.equal((await save.boundingBox()).width, before.width);
      await expect(page.locator('#fab-states-demo [role="status"]')).toHaveText(
        'Изменения сохранены.',
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(await pageViolations(page), [], 'FAB page accessibility');
    }
  }
  await page.setViewportSize({ width: 1472, height: 1000 });
}

export async function checkCheckboxPage({ page, url, modes }) {
  for (const width of [1472, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [theme, appearance, density] of modes) {
      await page.goto(
        url +
          'components/checkbox?theme=' +
          theme +
          '&appearance=' +
          appearance +
          '&density=' +
          density,
      );
      await expect(page.locator('h1')).toHaveText('Checkbox');
      await expect(page.locator('.example')).toHaveCount(7);
      for (const demo of await page.locator('.demo').all()) {
        await expect(demo).toHaveAttribute('data-ds-theme', theme);
        await expect(demo).toHaveAttribute('data-ds-appearance', appearance);
        await expect(demo).toHaveAttribute('data-ds-density', density);
      }
      const basic = page.locator('#checkbox-basic-demo input');
      await expect(basic).toBeChecked();
      await page.locator('#checkbox-basic-demo .description').click();
      await expect(basic).not.toBeChecked();
      await basic.focus();
      await page.keyboard.press('Space');
      await expect(basic).toBeChecked();
      await page.keyboard.press('Enter');
      await expect(basic).toBeChecked();
      const all = page.locator('#checkbox-tree-demo input').first();
      await expect(all).toHaveAttribute('aria-checked', 'mixed');
      await all.click();
      await expect(all).toBeChecked();
      await expect(page.locator('#checkbox-tree-demo [role="status"]')).toHaveText(
        'Выбрано объектов: 4 из 4.',
      );
      await page
        .locator('#checkbox-tree-demo')
        .getByRole('checkbox', { name: 'МАЗ 5440', exact: true })
        .uncheck();
      await expect(all).toHaveAttribute('aria-checked', 'mixed');
      const input = page.locator('#checkbox-forms-demo input').first();
      await input.check();
      await expect(page.locator('#checkbox-forms-demo code').first()).toContainText('true');
      await page
        .locator('#checkbox-forms-demo')
        .getByRole('button', { name: 'Сбросить форму', exact: true })
        .click();
      await expect(input).not.toBeChecked();
      const align = page.locator('#checkbox-alignment-demo .control');
      for (const control of await align.all()) {
        const centers = await control.evaluate((el) => {
          const mark = el.querySelector('.mark').getBoundingClientRect();
          const text = el.querySelector('.text')?.getBoundingClientRect();
          return text ? Math.abs(mark.top + mark.height / 2 - text.top - text.height / 2) : 0;
        });
        assert.ok(centers < 1, 'mark is centered against the whole text block');
      }
      const label = await align.last().boundingBox();
      const outer = await page.locator('#checkbox-alignment-demo').boundingBox();
      if (outer.x + outer.width - 24 > label.x + label.width + 8) {
        const before = await align.last().locator('input').isChecked();
        await page.mouse.click(outer.x + outer.width - 24, label.y + label.height / 2);
        assert.equal(
          await align.last().locator('input').isChecked(),
          before,
          'empty row area must not toggle',
        );
      }
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(await pageViolations(page), [], 'Checkbox page accessibility');
    }
  }
  await page.setViewportSize({ width: 1472, height: 1000 });
}
