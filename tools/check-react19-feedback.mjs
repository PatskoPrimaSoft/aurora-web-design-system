import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect} from '@playwright/test';

// Probe the named shared-cause candidates through their real public controls.
// Keep per-case diagnostics so a source resemblance alone never justifies a fix.
export async function checkDevelopmentFeedback(page, work) {
  const errors = [];
  const evidence = [];
  const diagnostics = [];
  let currentCase = 'initial';
  const consoleError = message => {if (message.type() === 'error') errors.push({case:currentCase, message:message.text()});};
  const pageError = error => errors.push({case:currentCase, message:error.message});
  page.on('console', consoleError);
  page.on('pageerror', pageError);
  const root = page.locator('[data-feedback-root]');
  async function update(key, value, attribute) {
    await page.evaluate(({key, value}) => window.feedbackConsumer[key](value), {key, value});
    await expect(root).toHaveAttribute(attribute, String(value));
  }
  async function style(node, token, overlay, state) {
    await node.evaluate(node => node.style.transition = 'none');
    const value = await node.evaluate((node, token) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = token === 'transparent' ? token : `var(${token})`;
      node.parentElement.append(probe);
      const expected = getComputedStyle(probe).backgroundColor;
      probe.remove();
      const css = getComputedStyle(node);
      return {color:css.backgroundColor, image:css.backgroundImage, expected};
    }, token);
    assert.equal(value.color, value.expected, `${currentCase} ${state} background`);
    assert.equal(value.image !== 'none', overlay, `${currentCase} ${state} overlay`);
    evidence.push({case:currentCase, state, ...value});
  }
  try {
    await page.waitForFunction(() => window.feedbackConsumer);
    for (const theme of ['light', 'dark']) {
      await update('setTheme', theme, 'data-ds-appearance');
      for (const kind of ['checkbox', 'radio', 'chip', 'table', 'list', 'tree']) {
        currentCase = `${theme}/${kind}`;
        await update('setKind', kind, 'data-kind');
        const start = errors.length;
        const host = page.locator(`[data-feedback="${kind}"]`);
        const drawing = kind === 'checkbox' || kind === 'radio';
        const target = drawing ? host.locator('label') : kind === 'table' ? host.locator('tbody tr')
          : kind === 'list' ? host.locator('[data-ds-list-row]') : kind === 'tree' ? host.locator('[data-ds-tree-row] > button').last() : host.locator('button');
        const ground = drawing ? host.locator('[aria-hidden="true"]').first() : target;
        const feedback = kind === 'list' ? host.locator('[data-ds-list-row]') : ground;
        const idle = drawing || kind === 'chip' ? '--ds-surface' : 'transparent';
        await target.scrollIntoViewIfNeeded();
        await page.mouse.move(1090, 0);
        await target.blur();
        await style(feedback, idle, false, 'idle');
        await target.hover();
        await style(feedback, drawing ? idle : '--ds-surface-hover', false, 'hover');
        // Toggle controlled state while hovered to cover background + overlay changes.
        if (drawing) await update('setChecked', 'checked', 'data-checked');
        else await update('setSelected', true, 'data-selected');
        await style(feedback, drawing ? '--ds-brand' : kind === 'chip' ? '--ds-brand-subtle' : kind === 'tree' ? 'transparent' : '--ds-surface-selected', true, 'selected hover');
        await page.mouse.move(1090, 0);
        await style(feedback, drawing ? '--ds-brand' : kind === 'chip' ? '--ds-brand-subtle' : kind === 'tree' ? 'transparent' : '--ds-surface-selected', false, 'selected leave');
        if (drawing || kind === 'chip') {
          await update('setDisabled', true, 'data-disabled');
          await style(feedback, '--ds-surface-disabled', false, 'disabled');
          await update('setDisabled', false, 'data-disabled');
        }
        if (drawing) await update('setChecked', 'unchecked', 'data-checked');
        else await update('setSelected', false, 'data-selected');
        await style(feedback, idle, false, 'reset');
        if (kind === 'list' || kind === 'tree') {
          await target.hover();
          await page.mouse.down();
          await style(feedback, '--ds-surface-active', false, 'pressed');
          await page.mouse.up();
          await target.blur();
          await page.mouse.move(1090, 0);
        }
        // Split tree chevron has its own feedback object with backgroundImage undefined.
        if (kind === 'tree') {
          const toggle = host.locator('button[data-ds-tree-chevron]');
          await toggle.hover();
          await style(toggle, '--ds-surface-hover', false, 'toggle hover');
          await page.mouse.down();
          await style(toggle, '--ds-surface-active', false, 'toggle pressed');
          await page.mouse.up();await toggle.blur();await page.mouse.move(1090, 0);
          await style(toggle, 'transparent', false, 'toggle reset');
        }
        diagnostics.push({case:currentCase, errors:errors.length-start});
      }
    }
    assert.deepEqual(errors, [], 'React19 development shared feedback must emit no console errors or page errors');
    console.log('ok   React19 DEVELOPMENT: checkbox/radio, chip, table/list/tree semantic feedback (light + dark)');
  } finally {
    writeFileSync(join(work, 'development-feedback.json'), JSON.stringify({diagnostics, evidence, errors}, null, 2));
    page.off('console', consoleError);page.off('pageerror', pageError);
  }
}
