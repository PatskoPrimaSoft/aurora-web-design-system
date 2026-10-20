import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {serveRoot} from '../../tools/baseline/render.mjs';

test('density guide inherits scope and keeps comparison search and sorting synchronized', async ({page}, testInfo) => {

  const served = await serveRoot(siteRoot());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]) {
      for(const width of [1440,390]) {
        await page.setViewportSize({width,height:900});
        await page.goto(`${served.url}/index.html?card=DsDensity&theme=${theme}&appearance=${appearance}&density=${density}`);
        const frame = page.frameLocator('#preview');
        await expect(page.locator('.page-contents')).toHaveCount(1);
        await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
        const ready = frame.locator('#ready-interface');
        await expect(ready).toHaveAttribute('data-ds-density',density);
        await expect(ready).toHaveAttribute('data-ds-theme',theme);
        await expect(ready).toHaveAttribute('data-ds-appearance',appearance);
        await ready.getByRole('textbox',{name:'Поиск объекта'}).fill('volvo');
        await expect(ready.getByRole('textbox')).toHaveValue('volvo');
        await ready.getByRole('button',{name:'Сбросить'}).focus();
        await page.keyboard.press('Enter');
        await expect(ready.getByRole('textbox')).toHaveValue('');
        const cozy = frame.locator('#density-cozy'), compact = frame.locator('#density-compact');
        expect((await compact.boundingBox()).height).toBeLessThan((await cozy.boundingBox()).height);
        for(const mode of ['cozy','compact']) {
          const sample = frame.locator(`#density-${mode}`);
          await expect(sample).toHaveAttribute('data-ds-density',mode);
          await expect(sample).toHaveAttribute('data-ds-theme',theme);
          await expect(sample).toHaveAttribute('data-ds-appearance',appearance);
          await expect(sample.locator('tbody tr').first()).toHaveCSS('height',mode==='cozy'?'44px':'34px');
          await expect(sample.getByRole('button',{name:'Сбросить'})).toHaveCSS('height',mode==='cozy'?'36px':'30px');
          await expect(sample.locator('[data-ds-field]')).toHaveCSS('height',mode==='cozy'?'40px':'32px');
        }
        await cozy.getByRole('textbox').fill('нет такого объекта');
        await expect(compact.getByRole('textbox')).toHaveValue('нет такого объекта');
        await expect(compact.getByText('Объекты не найдены',{exact:true})).toBeVisible();
        await compact.getByRole('button',{name:'Сбросить'}).click();
        await expect(cozy.getByRole('textbox')).toHaveValue('');
        await cozy.getByRole('button',{name:/Скорость/}).focus();
        await page.keyboard.press('Enter');
        const names = sample => sample.locator('tbody tr td:first-child').allTextContents();
        await expect.poll(async()=>await names(cozy)).toEqual(['Volvo FH16','Renault T','ГАЗ Next','МАЗ 5440']);
        expect(await names(compact)).toEqual(await names(cozy));
        const reference = frame.locator('#density-reference');
        await expect(reference).not.toHaveAttribute('open','');
        await reference.locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(reference.getByRole('table')).toBeVisible();
        await expect.poll(() => page.locator('#preview').evaluate(el => ({height:el.clientHeight>=el.contentDocument.body.scrollHeight,width:el.contentDocument.documentElement.scrollWidth<=el.clientWidth}))).toEqual({height:true,width:true});
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
        expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
        await reference.locator('summary').focus();
        await page.keyboard.press('Enter');
        if(theme==='DEFAULT'&&appearance==='light') {
          await frame.locator('#in-interface').evaluate(el=>el.scrollIntoView());
          await page.screenshot({path:testInfo.outputPath(`density-${width}.png`)});
        }
        if(width===390) await page.locator('.page-contents summary').click();
        await page.locator('.page-contents').getByRole('link',{name:'Для собственных стилей',exact:true}).click();
        await expect(frame.locator('#reference')).toBeFocused();
        await page.reload();
        await expect(frame.locator('#reference')).toBeInViewport();
      }
    }
    await page.goto(`${served.url}/index.html?card=DsDensity&compare=1`);
    await expect(page.locator('#viewports iframe')).toHaveCount(1);
    await expect(page.locator('.page-contents')).toHaveCount(1);
    for(let index=0;index<1;index++) {
      const frame=page.frameLocator('#preview');
      for(const mode of ['cozy','compact']) {
        const sample=frame.locator('#density-'+mode);
        await expect(sample.locator('tbody tr')).toHaveCount(4);
        await expect(sample.locator('tbody tr').first()).toHaveCSS('height',mode==='cozy'?'44px':'34px');
      }
    }
    expect(errors).toEqual([]);
  } finally {served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
