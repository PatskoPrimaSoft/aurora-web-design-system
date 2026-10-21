import {siteRoot} from '../helpers/browser-snapshot.mjs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { buildDist } from '../../../tools/build.js';
import { serveRoot } from '../../tools/baseline/render.mjs';

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

test('focus guide supports keyboard forms and navigation in every mode', async ({page}, testInfo) => {

  const served=await serveRoot(siteRoot());
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try {
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]) {
      for(const width of [1440,390]) {
        await page.setViewportSize({width,height:900});
        await page.goto(`${served.url}/index.html?card=DsFocus&theme=${theme}&appearance=${appearance}&density=${density}`);
        const frame=page.frameLocator('#preview'),scene=frame.locator('#ready-interface');
        await expect(page.locator('.page-contents')).toHaveCount(1);
        await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
        await expect(scene).toHaveAttribute('data-ds-theme',theme);
        await expect(scene).toHaveAttribute('data-ds-appearance',appearance);
        await expect(scene).toHaveAttribute('data-ds-density',density);
        const field=scene.getByRole('textbox',{name:'Название объекта'});
        await field.click();
        await expect(field.locator('..')).toHaveCSS('outline-width','2px');
        await field.fill('МАЗ 5440');
        await page.keyboard.press('Tab');
        const check=scene.getByRole('checkbox',{name:'Показывать названия'});
        await expect(check).toBeFocused();
        await expect(check.locator('+ span')).toHaveCSS('outline-width','2px');
        await page.keyboard.press('Space');await expect(check).toBeChecked();
        await page.keyboard.press('Tab');
        const save=scene.getByRole('button',{name:'Сохранить',exact:true});
        await expect(save).toBeFocused();await expect(save).toHaveCSS('outline-offset','2px');
        await page.keyboard.press('Enter');await expect(scene.getByRole('status')).toHaveText('Настройки сохранены.');
        await page.keyboard.press('Tab');await expect(scene.getByRole('button',{name:'Отмена',exact:true})).toBeFocused();
        await page.keyboard.press('Shift+Tab');await expect(save).toBeFocused();
        const tab=frame.getByRole('tab',{name:'Объекты',exact:true});
        await tab.focus();await page.keyboard.press('ArrowRight');
        const events=frame.getByRole('tab',{name:'События',exact:true});
        await expect(events).toBeFocused();await expect(events).toHaveAttribute('aria-selected','true');
        await expect(events).toHaveCSS('outline-width','2px');
        const trigger=frame.getByRole('button',{name:'Действия',exact:true});
        await trigger.focus();await page.keyboard.press('Enter');
        await expect(frame.getByRole('menuitem',{name:'Экспортировать'})).toBeFocused();
        await page.keyboard.press('ArrowDown');await expect(frame.getByRole('menuitem',{name:'Копировать'})).toBeFocused();
        await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
        const reference=frame.locator('#focus-reference');
        await expect(reference).not.toHaveAttribute('open','');
        await reference.locator('summary').focus();await page.keyboard.press('Enter');
        await expect(reference.getByRole('table')).toBeVisible();
        await expect.poll(()=>page.locator('#preview').evaluate(el=>({height:el.clientHeight>=el.contentDocument.body.scrollHeight,width:el.contentDocument.documentElement.scrollWidth<=el.clientWidth}))).toEqual({height:true,width:true});
        expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
        await reference.locator('summary').click();
        if(theme==='DEFAULT'&&appearance==='light') {
          await frame.locator('#in-interface').evaluate(el=>el.scrollIntoView());
          await page.screenshot({path:testInfo.outputPath(`focus-${width}.png`)});
        }
        if(width===390) await page.locator('.page-contents summary').click();
        await page.locator('.page-contents').getByRole('link',{name:'Для собственной разметки',exact:true}).click();
        await expect(frame.locator('#reference')).toBeFocused();
        await page.reload();await expect(frame.locator('#reference')).toBeInViewport();
      }
    }
    await page.goto(`${served.url}/index.html?card=DsFocus&compare=1`);
    await expect(page.locator('#viewports iframe')).toHaveCount(1);
    await expect(page.locator('.page-contents')).toHaveCount(1);
    for(let i=0;i<1;i++) await expect(page.frameLocator('#preview').getByRole('button',{name:'Сохранить',exact:true})).toBeVisible();
    expect(errors).toEqual([]);
  } finally {served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
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
