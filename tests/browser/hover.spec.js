import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
test('hover guide demonstrates transient feedback and confirms activation',async({page},testInfo)=>{
  await buildCatalogue({root,outDir:root+'/site'});
  const served=await serveRoot(root+'/site');
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try {
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]) {
      for(const width of [1440,390]) {
        await page.setViewportSize({width,height:900});
        await page.goto(`${served.url}/index.html?card=DsHover&theme=${theme}&appearance=${appearance}&density=${density}`);
        const frame=page.frameLocator('#preview'),scene=frame.locator('#ready-interface');
        await expect(page.locator('.page-contents')).toHaveCount(1);
        await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
        await expect(scene).toHaveAttribute('data-ds-theme',theme);
        await expect(scene).toHaveAttribute('data-ds-appearance',appearance);
        await expect(scene).toHaveAttribute('data-ds-density',density);
        const save=scene.getByRole('button',{name:'Сохранить',exact:true});
        await expect(save).toHaveCSS('background-image','none');
        await save.hover();
        const hovered=await save.evaluate(el=>getComputedStyle(el).backgroundImage);
        expect(hovered).not.toBe('none');
        const comparison=frame.locator('#state-comparison');
        await expect(comparison.locator('[data-state="hover"]')).toHaveCSS('background-image',hovered);
        await expect(comparison.locator('[data-state="rest"]')).toHaveCSS('background-image','none');
        await save.hover();
        await page.mouse.down();
        const pressed=await save.evaluate(el=>getComputedStyle(el).backgroundImage);
        expect(pressed).not.toBe(hovered);
        await expect(comparison.locator('[data-state="press"]')).toHaveCSS('background-image',pressed);
        await page.mouse.up();
        await expect(scene.getByRole('status')).toHaveText('Изменения сохранены.');
        await scene.getByRole('button',{name:'Отмена',exact:true}).focus();
        await page.keyboard.press('Enter');
        await expect(scene.getByRole('status')).toHaveText('Изменения отменены.');
        await save.focus();await page.keyboard.press('Space');
        await expect(scene.getByRole('status')).toHaveText('Изменения сохранены.');
        await expect(scene.getByRole('button',{name:'Недоступно'})).toBeDisabled();
        const fullCode=page.locator('#card-description details');
        await expect(fullCode).not.toHaveAttribute('open','');
        await fullCode.locator('summary').focus();await page.keyboard.press('Enter');
        await expect(fullCode.locator('pre')).toBeVisible();
        await fullCode.locator('summary').press('Enter');
        const reference=frame.locator('#hover-reference');
        await expect(reference).not.toHaveAttribute('open','');
        await reference.locator('summary').focus();await page.keyboard.press('Enter');
        await expect(reference.getByRole('table')).toBeVisible();
        await expect.poll(()=>page.locator('#preview').evaluate(el=>({height:el.clientHeight>=el.contentDocument.body.scrollHeight,width:el.contentDocument.documentElement.scrollWidth<=el.clientWidth}))).toEqual({height:true,width:true});
        expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
        await reference.locator('summary').click();
        if(theme==='DEFAULT'&&appearance==='light') {
          await frame.locator('#in-interface').evaluate(el=>el.scrollIntoView());
          await page.screenshot({path:testInfo.outputPath(`hover-${width}.png`)});
        }
        if(width===390) await page.locator('.page-contents summary').click();
        await page.locator('.page-contents').getByRole('link',{name:'Для собственных контролов',exact:true}).click();
        await expect(frame.locator('#reference')).toBeFocused();
        await page.reload();await expect(frame.locator('#reference')).toBeInViewport();
      }
    }
    await page.goto(`${served.url}/index.html?card=DsHover&compare=1`);
    await expect(page.locator('#viewports iframe')).toHaveCount(1);
    await expect(page.locator('.page-contents')).toHaveCount(1);
    for(let index=0;index<1;index++) await expect(page.frameLocator('#preview').getByRole('button',{name:'Сохранить',exact:true})).toBeVisible();
    expect(errors).toEqual([]);
  } finally {served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
