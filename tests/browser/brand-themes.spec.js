import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
test('brand themes preserve document readability, scope examples and support keyboard navigation', async ({page}, testInfo) => {
  await buildCatalogue({root, outDir: root + '/site'});
  const served = await serveRoot(root + '/site');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    for (const [theme, appearance, density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]) {
      for (const width of [1440,390]) {
        await page.setViewportSize({width,height:900});
        await page.goto(`${served.url}/index.html?card=DsBrandThemes&theme=${theme}&appearance=${appearance}&density=${density}`);
        const frame = page.frameLocator('#preview');
        await expect(page.locator('.page-contents')).toHaveCount(1);
        await expect(frame.getByRole('heading', {name:'Цветовые темы в интерфейсе',exact:true})).toBeVisible();
        await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
        await expect(frame.locator('#ready-interface')).toHaveAttribute('data-ds-theme',theme);
        await expect(frame.locator('#ready-interface')).toHaveAttribute('data-ds-appearance',appearance);
        await frame.locator('#ready-interface').getByRole('button',{name:'Сохранить изменения',exact:true}).focus();
        await page.keyboard.press('Enter');
        await expect(frame.locator('#save-status')).toHaveText('Изменения сохранены.');
        const fullCode = page.locator('#card-description details');
        await expect(fullCode).not.toHaveAttribute('open','');
        await fullCode.locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(fullCode.locator('pre')).toBeVisible();
        await page.keyboard.press('Enter');
        await expect(fullCode.locator('pre')).not.toBeVisible();
        const summary = frame.locator('#theme-reference > summary');
        await expect(frame.locator('#theme-reference')).not.toHaveAttribute('open','');
        await summary.focus();
        await page.keyboard.press('Enter');
        await expect(frame.locator('[data-token="--ds-brand"] .value')).not.toBeEmpty();
        await expect.poll(() => page.locator('#preview').evaluate(el => ({fits:el.clientHeight >= el.contentDocument.body.scrollHeight,width:el.contentDocument.documentElement.scrollWidth <= el.clientWidth}))).toEqual({fits:true,width:true});
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const results = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        expect(results.violations).toEqual([]);
        if (theme==='DEFAULT' && appearance==='light') {
          await summary.focus();
          await page.keyboard.press('Enter');
          await frame.locator('#in-interface').evaluate(el => el.scrollIntoView());
          await page.screenshot({path:testInfo.outputPath(`themes-top-${width}.png`)});
        }
        if(width===390) await page.locator('.page-contents summary').click();
        await page.locator('.page-contents').getByRole('link',{name:'Настройка новой темы',exact:true}).click();
        await expect(frame.locator('#new-theme')).toBeFocused();
        await page.reload();
        await expect(frame.locator('#new-theme')).toBeInViewport();
        if (theme==='DEFAULT' && appearance==='light') await page.screenshot({path:testInfo.outputPath(`themes-${width}.png`),fullPage:true});
      }
    }
    await page.goto(`${served.url}/index.html?card=DsBrandThemes&compare=1`);
    await expect(page.locator('.page-contents')).toHaveCount(1);
    await expect(page.locator('#viewports iframe')).toHaveCount(1);
    expect(errors).toEqual([]);
  } finally {served.server.closeAllConnections();await new Promise(resolve => served.server.close(resolve));}
});
