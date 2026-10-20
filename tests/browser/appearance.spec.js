import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {serveRoot} from '../../tools/baseline/render.mjs';

test('appearance examples follow scope, preserve interaction and remain accessible', async ({page}, testInfo) => {

  const served = await serveRoot(siteRoot());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]) {
      for(const width of [1440,390]) {
        await page.setViewportSize({width,height:900});
        await page.goto(`${served.url}/index.html?card=DsAppearance&theme=${theme}&appearance=${appearance}&density=${density}`);
        const frame = page.frameLocator('#preview');
        await expect(page.locator('.page-contents')).toHaveCount(1);
        await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
        const demo = frame.locator('#ready-interface');
        await expect(demo).toHaveAttribute('data-ds-appearance',appearance);
        await expect(demo).toHaveAttribute('data-ds-theme',theme);
        await demo.getByRole('checkbox',{name:'Показывать трек'}).focus();
        await page.keyboard.press('Space');
        await expect(demo.getByRole('checkbox')).not.toBeChecked();
        await demo.getByRole('button',{name:'Сохранить изменения'}).focus();
        await page.keyboard.press('Enter');
        await expect(demo.getByRole('status')).toHaveText('Изменения сохранены.');
        for(const mode of ['light','dark']) {
          const sample = frame.locator(`#mode-${mode}`);
          await expect(sample).toHaveAttribute('data-ds-appearance',mode);
          await expect(sample).toHaveAttribute('data-ds-theme',theme);
        }
        await frame.locator('#mode-light').getByRole('textbox',{name:'Маршрут'}).fill('Минск — Гродно');
        await expect(frame.locator('#mode-dark').getByRole('textbox',{name:'Маршрут'})).toHaveValue('Минск — Гродно');
        await frame.locator('#mode-dark').getByRole('textbox',{name:'Маршрут'}).fill('Брест — Гродно');
        await expect(frame.locator('#mode-light').getByRole('textbox',{name:'Маршрут'})).toHaveValue('Брест — Гродно');
        const details = frame.locator('#appearance-reference');
        await expect(details).not.toHaveAttribute('open','');
        await details.locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(details.getByText('background: var(--ds-surface)',{exact:true})).toBeVisible();
        const fullCode = page.locator('#card-description details');
        await expect(fullCode).not.toHaveAttribute('open','');
        await fullCode.locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(fullCode.locator('pre')).toBeVisible();
        await page.keyboard.press('Enter');
        await expect(fullCode.locator('pre')).not.toBeVisible();
        await expect.poll(() => page.locator('#preview').evaluate(el => ({height:el.clientHeight>=el.contentDocument.body.scrollHeight,width:el.contentDocument.documentElement.scrollWidth<=el.clientWidth}))).toEqual({height:true,width:true});
        expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true);
        expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
        await details.locator('summary').focus();
        await page.keyboard.press('Enter');
        if(theme==='DEFAULT'&&appearance==='light') {
          await frame.locator('#in-interface').evaluate(el=>el.scrollIntoView());
          await page.screenshot({path:testInfo.outputPath(`appearance-${width}.png`)});
        }
        if(width===390) await page.locator('.page-contents summary').click();
        await page.locator('.page-contents').getByRole('link',{name:'Для собственных стилей',exact:true}).click();
        await expect(frame.locator('#reference')).toBeFocused();
        await page.reload();
        await expect(frame.locator('#reference')).toBeInViewport();
      }
    }
    await page.goto(`${served.url}/index.html?card=DsAppearance&compare=1`);
    await expect(page.locator('#viewports iframe')).toHaveCount(1);
    await expect(page.locator('.page-contents')).toHaveCount(1);
    expect(errors).toEqual([]);
  } finally {served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
