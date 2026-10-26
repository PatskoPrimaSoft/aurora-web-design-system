import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect} from '@playwright/test';
import {checkDevelopmentFeedback} from './check-react19-feedback.mjs';

// Public tarball controls must update safely under development React, which diagnoses
// shorthand/longhand collisions that production React deliberately does not report.
export async function checkDevelopmentButtons(browser, url, work) {
  const page = await browser.newPage({viewport:{width:1100, height:900}});
  const errors = [];
  const evidence = [];
  const overrides = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
  page.on('response', response => {if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);});
  try {
    await page.goto(url);
    await page.waitForFunction(() => window.buttonConsumer);
    const cases = [
      ['button-secondary', '--ds-surface', 'ground'], ['button-ghost', 'transparent', 'ground'],
      ['button-primary', '--ds-brand', 'overlay'], ['icon-ghost', 'transparent', 'ground'],
      ['icon-secondary', '--ds-surface', 'ground'], ['icon-onHeader', 'transparent', 'header'],
      ['icon-primary', '--ds-brand', 'overlay'], ['icon-active', '--ds-brand-subtle', 'overlay'],
      ['fab-surface', '--ds-surface', 'ground'], ['fab-primary', '--ds-brand', 'overlay'],
    ];
    async function checkStyle(control, token, overlay, state) {
      const value = await control.evaluate((node, {token}) => {
        // Let the browser resolve semantic tokens, including color-mix, independently
        // of the component's inline style implementation.
        const probe = document.createElement('span');
        probe.style.backgroundColor = token === 'transparent' ? token : `var(${token})`;
        node.parentElement.append(probe);
        const expected = getComputedStyle(probe).backgroundColor;
        probe.remove();
        const css = getComputedStyle(node);
        return {color:css.backgroundColor, image:css.backgroundImage, expected};
      }, {token});
      assert.equal(value.color, value.expected, `${await control.getAttribute('data-testid')} ${state} background`);
      assert.equal(value.image !== 'none', overlay, `${await control.getAttribute('data-testid')} ${state} overlay`);
      evidence.push({theme:await page.locator('main').getAttribute('data-ds-appearance'), id:await control.getAttribute('data-testid'), state, ...value});
      return value;
    }
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => window.buttonConsumer.setTheme(theme), theme);
      await expect(page.locator('main')).toHaveAttribute('data-ds-appearance', theme);
      for (const [id, idle, kind] of cases) {
        const control = page.getByTestId(id);
        await page.mouse.move(1090, 890);
        // Disable transitions in the test page only, so computed color checks observe
        // the settled state rather than an arbitrary animation frame.
        await control.evaluate(node => node.style.transition = 'none');
        await checkStyle(control, idle, false, 'idle');
        await control.hover();
        const hover = await checkStyle(control, kind === 'overlay' ? idle : '--ds-surface-hover', kind === 'overlay', 'hover');
        await page.mouse.down();
        const pressed = await checkStyle(control, kind === 'overlay' ? idle : kind === 'header' ? '--ds-surface-hover' : '--ds-surface-active', kind !== 'ground', 'pressed');
        if (kind === 'overlay') assert.notEqual(hover.image, pressed.image, `${id} press overlay depth`);
        await page.mouse.up();
        await checkStyle(control, kind === 'overlay' ? idle : '--ds-surface-hover', kind === 'overlay', 'released');
        await page.mouse.move(1090, 890);
        await checkStyle(control, idle, false, 'leave');
        await control.focus();
        for (const key of ['Space', 'Enter']) {
          await page.keyboard.down(key);
          await checkStyle(control, kind === 'overlay' ? idle : kind === 'header' ? '--ds-surface-hover' : '--ds-surface-active', kind !== 'ground', key+' down');
          await page.keyboard.up(key);
          await checkStyle(control, idle, false, key+' up');
        }
        const clicks = await page.evaluate(id => window.buttonConsumer.clicks[id], id);
        assert.equal(clicks, theme === 'light' ? 3 : 6, `${id} pointer and keyboard activation`);
        if (!id.startsWith('fab-')) assert.equal(await control.evaluate((node, id) => window.buttonConsumer.refs[id] === node, id), true, `${id} real button ref`);
        for (const mode of ['disabled', 'loading']) {
          await control.hover();
          await page.evaluate(mode => window.buttonConsumer.setMode(mode), mode);
          await expect(page.locator('main')).toHaveAttribute('data-mode', mode);
          if (mode === 'disabled') await expect(control).toHaveAttribute('disabled', '');
          else await expect(control).toHaveAttribute('aria-busy', 'true');
          const offColor = mode === 'loading' ? idle : id === 'button-secondary' || id === 'button-ghost' || id.startsWith('icon-') ? 'transparent' : '--ds-surface-disabled';
          await checkStyle(control, offColor, false, mode);
          // Dispatch also tests the component guard for aria-disabled loading buttons.
          await control.evaluate(node => node.click());
          await control.dispatchEvent('keydown', {key:'Enter'});
          await control.dispatchEvent('keyup', {key:'Enter'});
          assert.equal(await page.evaluate(id => window.buttonConsumer.clicks[id], id), clicks, `${id} ${mode} blocks callbacks`);
          await page.mouse.move(1090, 890);
          await page.evaluate(() => window.buttonConsumer.setMode('enabled'));
          await expect(page.locator('main')).toHaveAttribute('data-mode', 'enabled');
          await checkStyle(control, idle, false, mode+' reset');
        }
        await control.blur();
      }
      await page.screenshot({path:join(work, `development-buttons-${theme}.png`)});
    }
    // Consumer styles have priority over the generated color during every update.
    // The shorthand is a supported override too, not just backgroundColor.
    for (const property of ['background', 'backgroundColor']) for (const kind of ['button', 'icon', 'fab']) {
      const control = page.getByTestId(`override-${property}-${kind}`);
      async function customColor(state) {
        await control.evaluate(node => node.style.transition = 'none');
        const color = await control.evaluate(node => getComputedStyle(node).backgroundColor);
        overrides.push({property, kind, state, color});
        assert.equal(color, 'rgb(213, 17, 73)', `${kind} consumer style.${property} ${state} keeps priority`);
      }
      await page.mouse.move(1090, 890);await customColor('idle');
      await control.hover();await customColor('hover');
      await page.mouse.down();await customColor('pressed');await page.mouse.up();
      await page.mouse.move(1090, 890);await customColor('leave');
      for (const mode of ['disabled', 'loading', 'enabled']) {
        await page.evaluate(mode => window.styleOverrides.setMode(mode), mode);
        await expect(page.locator('[data-style-overrides]')).toHaveAttribute('data-mode', mode);
        await customColor(mode);
      }
    }
    const events = await page.evaluate(() => window.buttonConsumer.events);
    for (const [id] of cases) for (const type of ['pointerenter', 'pointerleave', 'pointerdown', 'pointerup', 'keydown', 'keyup']) {
      assert.ok(events.some(([source, event, target]) => source === id && event === type && target === id), `${id} forwards ${type} with real currentTarget`);
    }
    assert.deepEqual(errors, [], 'React19 development controls must emit no console errors or page errors');
    console.log('ok   React19 DEVELOPMENT: button/icon/FAB states, semantic colors/overlays, pointer/keyboard, disabled/loading, refs/events (light + dark)');
    await checkDevelopmentFeedback(page, work);
  } finally {
    writeFileSync(join(work, 'development-buttons.json'), JSON.stringify({evidence, overrides, errors}, null, 2));
    await page.close();
  }
}
