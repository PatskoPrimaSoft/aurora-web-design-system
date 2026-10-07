import { test, expect } from '@playwright/test';
import { buildDist } from '../../tools/build.js';
import { buildCatalogue } from '../../tools/catalog/build.mjs';
import { serveRoot } from '../../tools/baseline/render.mjs';
import { fileURLToPath } from 'node:url';

test('standalone fields and all keyboard controls share the token focus outline', async ({ page }) => {
  const { styles } = buildDist();
  await page.setContent(`<style>${styles}</style><button>Start</button>
    <input aria-label="Text"><textarea aria-label="Notes"></textarea><select aria-label="Choice"><option>One</option></select>
    <input type="range" aria-label="Scale"><input type="checkbox" aria-label="Check"><input type="radio" aria-label="Radio">
    <div role="slider" tabindex="0" aria-label="Custom scale"></div><div role="radio" tabindex="0" aria-checked="false">Custom radio</div>
    <a href="#end">Link</a><button disabled>Disabled</button>`);
  for (const label of ['Text', 'Notes', 'Choice']) {
    const field = page.getByLabel(label, { exact: true });
    await field.click();
    await expect(field).toHaveCSS('outline-style', 'solid');
    await expect(field).toHaveCSS('outline-width', '2px');
    await expect(field).toHaveCSS('outline-offset', '2px');
  }
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  for (const name of ['Text', 'Notes', 'Choice', 'Scale', 'Check', 'Radio', 'Custom scale']) {
    await page.keyboard.press('Tab');
    const control = page.getByLabel(name, { exact: true });
    await expect(control).toBeFocused();
    await expect(control).toHaveCSS('outline-width', '2px');
    await expect(control).toHaveCSS('outline-offset', '2px');
  }
  await page.keyboard.press('Tab');
  await expect(page.getByRole('radio', { name: 'Custom radio' })).toHaveCSS('outline-offset', '2px');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link')).toHaveCSS('outline-width', '2px');
});

test('focus foundation demonstrates real controls in every theme and density', async ({ page }, testInfo) => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const cards = await buildCatalogue({ root, outDir: `${root}/site` });
  expect(cards.find(card => card.id === 'DsFocus')?.group).toBe('2 · Основы');
  const served = await serveRoot(`${root}/site`);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    for (const [theme, appearance, density] of [['DEFAULT', 'light', 'cozy'], ['DEFAULT', 'dark', 'compact'], ['RED2', 'light', 'cozy'], ['RED2', 'dark', 'compact']]) {
      await page.goto(`${served.url}/components/DsFocus/preview.html?theme=${theme}&appearance=${appearance}&density=${density}`);
      const button = page.getByRole('button', { name: 'Построить', exact: true });
      await button.click();
      await expect(button).not.toHaveCSS('outline-style', 'solid');
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Сохранить', exact: true })).toHaveCSS('outline-width', '2px');
      await page.keyboard.press('Shift+Tab');
      await expect(button).toBeFocused();
      const projected = new Set();
      // Walk the actual Tab order, including visually hidden native selection inputs.
      for (let i = 0; i < 18; i++) {
        const result = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || !document.querySelector('main').contains(el)) return null;
          const shell = el.closest('[data-ds-field]');
          const hiddenSelection = el.matches('input[type=checkbox],input[type=radio]') && getComputedStyle(el).opacity === '0';
          const target = shell || (hiddenSelection ? el.nextElementSibling : el);
          const css = getComputedStyle(target);
          return { kind: el.getAttribute('role') || el.type || el.tagName.toLowerCase(), style: css.outlineStyle, width: css.outlineWidth, offset: css.outlineOffset, disabled: el.disabled, inner: shell ? getComputedStyle(el).outlineStyle : null };
        });
        expect(result).not.toBeNull();
        expect(result.disabled).not.toBe(true);
        expect(result.style).toBe('solid');
        expect(result.width).toBe('2px');
        expect(result.offset).toBe('2px');
        if (result.inner !== null) expect(result.inner).toBe('none');
        projected.add(result.kind);
        await page.keyboard.press('Tab');
      }
      for (const kind of ['button', 'a', 'checkbox', 'radio', 'switch', 'text', 'select-one', 'textarea', 'tab']) {
        expect(projected.has(kind), `visited ${kind}`).toBe(true);
      }
      const field = page.getByRole('textbox', { name: 'Название объекта' });
      await field.click();
      await expect(field.locator('..')).toHaveCSS('outline-style', 'solid');
      const choice = page.getByRole('combobox', { name: 'Группа' });
      await choice.click();
      await expect(choice.locator('..')).toHaveCSS('outline-style', 'solid');
      await page.keyboard.press('Escape');
      const tab = page.getByRole('tab', { name: 'Объекты', exact: true });
      await tab.focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.getByRole('tab', { name: 'События' })).toBeFocused();
      await expect(page.getByRole('tab', { name: 'События' })).toHaveCSS('outline-style', 'solid');
      const trigger = page.getByRole('button', { name: 'Действия', exact: true });
      await trigger.focus();
      await page.keyboard.press('Enter');
      const item = page.getByRole('menuitem', { name: 'Экспортировать' });
      await expect(item).toBeFocused();
      await expect(item).toHaveCSS('outline-offset', '2px');
      const clearance = await item.evaluate(el => {
        const box = el.getBoundingClientRect(), parent = el.parentElement.getBoundingClientRect();
        return Math.min(box.left - parent.left, parent.right - box.right, box.top - parent.top);
      });
      expect(clearance).toBeGreaterThanOrEqual(4);
      await page.keyboard.press('ArrowDown');
      await expect(page.getByRole('menuitem', { name: 'Копировать' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      const slider = page.getByRole('slider', { name: 'Масштаб' });
      await slider.focus();
      await page.keyboard.press('ArrowRight');
      await expect(slider).toHaveValue('51');
      await expect(slider).toHaveCSS('outline-width', '2px');
      await page.screenshot({ path: testInfo.outputPath(`focus-${theme}-${appearance}.png`), fullPage: true });
    }
    expect(errors).toEqual([]);
  } finally {
    served.server.closeAllConnections();
    await new Promise(resolve => served.server.close(resolve));
  }
});

test('fields show a solid focus outline on click and Tab while buttons use keyboard focus', async ({ page }) => {
  const { styles } = buildDist();
  for (const [theme, appearance, density] of [['DEFAULT', 'light', 'cozy'], ['DEFAULT', 'dark', 'compact'], ['RED2', 'light', 'cozy'], ['RED2', 'dark', 'compact']]) {
    await page.setContent(`<style>${styles}</style><main data-ds-theme="${theme}" data-ds-appearance="${appearance}" data-ds-density="${density}">
      <button>Action</button>
      ${['default', 'error', 'warning'].map(state => `<div data-ds-field="${state}"><input aria-label="${state}" style="outline:none;border:none"></div>`).join('')}
    </main>`);
    const button = page.getByRole('button');
    await button.click();
    await expect(button).not.toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('textbox', { name: 'default', exact: true })).toBeFocused();
    await expect(page.locator('[data-ds-field="default"]')).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Shift+Tab');
    await expect(button).toHaveCSS('outline-style', 'solid');
    for (const state of ['default', 'error', 'warning']) {
      const field = page.locator(`[data-ds-field="${state}"]`);
      const before = await field.boundingBox();
      await field.locator('input').click();
      await expect(field).toHaveCSS('outline-style', 'solid');
      await expect(field).toHaveCSS('outline-width', '2px');
      await expect(field).toHaveCSS('outline-offset', '2px');
      await expect(field).toHaveCSS('box-shadow', 'none');
      expect(await field.boundingBox()).toEqual(before);
      const colors = await field.evaluate((el, state) => {
        const css = getComputedStyle(el);
        const probe = document.createElement('span');
        el.append(probe);
        probe.style.color = 'var(--ds-focus-color)';
        const focus = getComputedStyle(probe).color;
        probe.style.color = `var(--ds-${state === 'error' ? 'danger-solid' : state === 'warning' ? 'warning-solid' : 'brand'})`;
        const border = getComputedStyle(probe).color;
        probe.remove();
        return { outline: css.outlineColor, focus, border: css.borderTopColor, expectedBorder: border };
      }, state);
      expect(colors.outline).toBe(colors.focus);
      expect(colors.border).toBe(colors.expectedBorder);
    }
  }
});
