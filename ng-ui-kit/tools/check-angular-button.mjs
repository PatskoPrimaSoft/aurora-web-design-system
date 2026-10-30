import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function assertAngularButton(page, url) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url + '/index.html');
  const action = page.locator('#action'),
    counts = page.locator('#counts');
  await expect(action).toHaveAttribute('type', 'submit');
  await expect(action).toHaveAttribute('name', 'action');
  await expect(action).toHaveAttribute('value', 'save');
  await expect(action).toHaveAttribute('data-purpose', 'save');
  await page.locator('#default-type').click();
  await expect(counts).toHaveText('0 / 0 / 1');
  await action.click();
  await expect(counts).toHaveText('1 / 1 / 1');
  await action.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Enter');
  await expect(counts).toHaveText('3 / 3 / 1');
  const before = await action.boundingBox();
  await page.locator('#loading').check();
  await action.focus();
  await expect(action).toHaveAttribute('aria-busy', 'true');
  assert.equal(
    await action.evaluate((el) => el.disabled),
    false,
    'loading must preserve focusability',
  );
  const during = await action.boundingBox();
  assert.equal(during.width, before.width);
  assert.equal(during.height, before.height);
  await action.evaluate((el) => el.click());
  await page.keyboard.press('Space');
  await page.keyboard.press('Enter');
  await expect(counts).toHaveText('3 / 3 / 1');
  await expect(action).toBeFocused();
  await expect(action).toHaveAccessibleName(/Сохранить/);
  await page.locator('#form-field').focus();
  await page.keyboard.press('Enter');
  await expect(counts).toHaveText('3 / 3 / 1');
  await page.locator('#loading').uncheck();
  await page.locator('#disabled').check();
  assert.equal(await action.evaluate((el) => el.disabled), true);
  await action.evaluate((el) => el.click());
  await expect(counts).toHaveText('3 / 3 / 1');
  await page.locator('#disabled').uncheck();
  await action.click();
  await expect(counts).toHaveText('4 / 4 / 1');
  await page.locator('#type').selectOption('button');
  await action.click();
  await expect(counts).toHaveText('5 / 4 / 1');
  await page.locator('#autoload').check();
  await action.click();
  await expect(action).toBeFocused();
  await action.evaluate((el) => el.click());
  await expect(counts).toHaveText('6 / 4 / 1');
  await page.locator('#autoload').uncheck();
  await page.locator('#loading').uncheck();
  await page.locator('#type').selectOption('reset');
  await page.locator('#form-field').fill('changed');
  await action.click();
  await expect(page.locator('#form-field')).toHaveValue('initial');
  await expect(counts).toHaveText('7 / 4 / 1');
  await expect(page.locator('#fieldset-button')).toBeDisabled();
  await page.locator('#fieldset-button').evaluate((el) => el.click());
  await expect(counts).toHaveText('7 / 4 / 1');
  await page.locator('#external-button').click();
  await expect(counts).toHaveText('7 / 5 / 1');
  await expect(page.locator('#icon-only')).toHaveAccessibleName('Добавить');
  await expect(page.locator('#icon-only ds-icon')).toHaveCount(1);
  await expect(page.locator('#icon-only ds-icon')).toHaveAttribute('aria-hidden', 'true');
  const dynamicIcon = page.locator('#icon-dynamic-label');
  const emptyGeometry = await dynamicIcon.boundingBox();
  assert.equal(
    emptyGeometry.width,
    emptyGeometry.height,
    'empty projected label uses square geometry',
  );
  await page.locator('#projected-label-toggle').click();
  await expect(dynamicIcon.locator('[data-ds-button-label]')).toHaveText('Добавить запись');
  await expect
    .poll(() => dynamicIcon.evaluate((el) => el.getBoundingClientRect().width))
    .toBeGreaterThan(emptyGeometry.width);
  await page.locator('#projected-label-toggle').click();
  await expect
    .poll(() => dynamicIcon.evaluate((el) => el.getBoundingClientRect().width))
    .toBe(emptyGeometry.width);
  await expect(page.locator('#aria')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#aria')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('#false-attributes')).toBeEnabled();
  await expect(page.locator('#false-attributes')).not.toHaveAttribute('aria-busy', 'true');
  await page.locator('#icon').fill('');
  await page.locator('#icon-right').fill('');
  await expect(action.locator('.material-symbols-outlined')).toHaveCount(0);

  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [theme, appearance, density] of [
      ['DEFAULT', 'light', 'cozy'],
      ['DEFAULT', 'dark', 'compact'],
      ['RED2', 'light', 'cozy'],
      ['RED2', 'dark', 'compact'],
    ]) {
      await page.locator('button-demo').evaluate(
        (el, s) => {
          for (const [k, v] of Object.entries(s)) el.setAttribute('data-ds-' + k, v);
        },
        { theme, appearance, density },
      );
      for (const tone of [
        'primary',
        'secondary',
        'subtle',
        'ghost',
        'danger',
        'accent',
        'inverse',
      ]) {
        await page.locator('#tone').selectOption(tone);
        // Inverse is intended for an inverse surface.
        await page
          .locator('form')
          .first()
          .evaluate(
            (el, t) => (el.style.background = t === 'inverse' ? 'var(--ds-surface-inverse)' : ''),
            tone,
          );
        const colors = {
          primary: ['--ds-brand', '--ds-on-brand'],
          secondary: ['--ds-surface', '--ds-fg'],
          subtle: ['--ds-brand-subtle', '--ds-brand-text'],
          ghost: [null, '--ds-fg-muted'],
          danger: ['--ds-danger-solid', '--ds-on-solid'],
          accent: ['--ds-accent', '--ds-accent-on'],
          inverse: [null, '--ds-fg-action-on-inverse'],
        }[tone];
        await expect
          .poll(() =>
            action.evaluate((el, [bg, fg]) => {
              const probe = document.createElement('span');
              probe.style.background = bg ? `var(${bg})` : 'transparent';
              probe.style.color = `var(${fg})`;
              el.append(probe);
              const actual = getComputedStyle(el),
                expected = getComputedStyle(probe);
              const match =
                actual.backgroundColor === expected.backgroundColor &&
                actual.color === expected.color;
              probe.remove();
              return match;
            }, colors),
          )
          .toBe(true);
        await action.dispatchEvent('pointerenter', { pointerType: 'mouse' });
        const hover = await action.evaluate((el) => {
          const s = getComputedStyle(el);
          return s.backgroundColor + '|' + s.backgroundImage;
        });
        await action.dispatchEvent('pointerdown', { pointerType: 'mouse', button: 0 });
        await expect
          .poll(() =>
            action.evaluate((el) => {
              const s = getComputedStyle(el);
              return s.backgroundColor + '|' + s.backgroundImage;
            }),
          )
          .not.toBe(hover);
        await action.dispatchEvent('pointerleave', { pointerType: 'mouse' });
        const toneAccessibility = await new AxeBuilder({ page }).include('#action').analyze();
        assert.deepEqual(
          toneAccessibility.violations.map((v) => v.id),
          [],
          `${tone}: accessibility`,
        );
        await expect
          .poll(() =>
            action.evaluate((el, tone) => {
              const probe = document.createElement('span');
              probe.style.borderColor =
                tone === 'secondary' ? 'var(--ds-border-field)' : 'transparent';
              el.append(probe);
              const actual = getComputedStyle(el),
                expected = getComputedStyle(probe);
              const match =
                actual.borderTopWidth === '1px' &&
                actual.borderTopColor === expected.borderTopColor;
              probe.remove();
              return match;
            }, tone),
          )
          .toBe(true);
        await page.locator('#disabled').check();
        await expect
          .poll(() =>
            action.evaluate((el, tone) => {
              const probe = document.createElement('span'),
                unfilled = tone === 'secondary' || tone === 'ghost';
              probe.style.background = unfilled ? 'transparent' : 'var(--ds-surface-disabled)';
              probe.style.color = 'var(--ds-fg-disabled)';
              probe.style.borderColor = unfilled ? 'var(--ds-border)' : 'transparent';
              el.append(probe);
              const actual = getComputedStyle(el),
                expected = getComputedStyle(probe);
              const match =
                actual.backgroundColor === expected.backgroundColor &&
                actual.color === expected.color &&
                actual.borderTopColor === expected.borderTopColor;
              probe.remove();
              return match;
            }, tone),
          )
          .toBe(true);
        await page.locator('#disabled').uncheck();
        for (const size of ['sm', 'md', 'lg']) {
          await page.locator('#size').selectOption(size);
          const geometry = await action.evaluate((el, size) => {
            const c = getComputedStyle(el);
            return {
              height: el.getBoundingClientRect().height,
              min: parseFloat(
                c.getPropertyValue(size === 'md' ? '--ds-control-h' : '--ds-control-h-' + size),
              ),
            };
          }, size);
          assert.ok(
            geometry.height >= geometry.min,
            `${theme}/${appearance}/${density}/${size}: minimum height`,
          );
          const iconGeometry = await page.locator('#icon-only').evaluate((el, size) => {
            const css = getComputedStyle(el),
              glyph = el.querySelector('ds-icon');
            return {
              width: el.getBoundingClientRect().width,
              height: el.getBoundingClientRect().height,
              padding: css.paddingLeft,
              min: parseFloat(
                css.getPropertyValue(size === 'md' ? '--ds-control-h' : '--ds-control-h-' + size),
              ),
              glyph: getComputedStyle(glyph).width,
            };
          }, size);
          assert.equal(
            iconGeometry.width,
            iconGeometry.min,
            'icon-only width follows the control token',
          );
          assert.equal(
            iconGeometry.height,
            iconGeometry.min,
            'icon-only height follows the control token',
          );
          assert.equal(iconGeometry.padding, '0px');
          assert.equal(
            iconGeometry.glyph,
            await page.locator('#icon-only').evaluate(
              (el, size) =>
                getComputedStyle(el)
                  .getPropertyValue(size === 'sm' ? '--ds-icon-sm' : '--ds-icon')
                  .trim(),
              size,
            ),
          );
        }
        const full = await page.locator('#icon-full-width').boundingBox();
        const container = await page.locator('#icon-full-container').boundingBox();
        assert.ok(
          Math.abs(full.width - container.width) < 1,
          'fullWidth overrides automatic square width',
        );
      }
      await page.locator('#tone').selectOption('primary');
      await page
        .locator('form')
        .first()
        .evaluate((el) => (el.style.background = ''));
      assert.ok(
        await page.locator('#long').evaluate((el) => el.scrollWidth <= el.clientWidth),
        'long label must wrap',
      );
      assert.ok(
        await page
          .locator('#long [data-ds-button-label]')
          .evaluate((el) => el.scrollWidth <= el.clientWidth),
        'long label with both icons must wrap',
      );
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        'no page overflow',
      );
      await page.keyboard.press('Tab');
      await action.focus();
      assert.notEqual(
        await action.evaluate((el) => getComputedStyle(el).outlineStyle),
        'none',
        'visible keyboard focus',
      );
      const accessibility = await new AxeBuilder({ page }).include('button-demo').analyze();
      assert.deepEqual(
        accessibility.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        [],
      );
    }
  }
  await page.locator('#tone').selectOption('primary');
  await action.dispatchEvent('pointerenter', { pointerType: 'touch' });
  await expect(action).not.toHaveAttribute('data-ds-hover', 'true');
  await action.dispatchEvent('pointerdown', { pointerType: 'touch', button: 0 });
  await expect(action).toHaveAttribute('data-ds-pressed', 'true');
  await action.dispatchEvent('pointercancel');
  await expect(action).not.toHaveAttribute('data-ds-pressed', 'true');
  console.log(
    'angular-button: forms, loading, inputs, keyboard, scopes, responsive layout and AXE passed: ' +
      url,
  );
}
