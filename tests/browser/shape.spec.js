import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const scopes=[['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']];
test('shape guide supports layers, disclosure and navigation in every scope',async({page},testInfo)=>{
  await buildCatalogue({root,outDir:root+'/site'});
  const served=await serveRoot(root+'/site');
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try{
    for(const [theme,appearance,density] of scopes) for(const width of [1440,390]){
      await page.setViewportSize({width,height:900});
      await page.goto(`${served.url}/index.html?card=DsShape&theme=${theme}&appearance=${appearance}&density=${density}`);
      const frame=page.frameLocator('#preview'),contents=page.locator('.page-contents');
      await expect(contents.locator('a')).toHaveCount(8);
      await expect(frame.locator('main > section > h2')).toHaveText(['Форма и глубина в интерфейсе','Краткая памятка','Скругления и вложенность','Глубина и слои','Правила применения','Справочник токенов']);
      const trigger=frame.getByRole('button',{name:'Действия',exact:true});
      await trigger.focus();await page.keyboard.press('Enter');
      await expect(frame.getByRole('menu')).toBeVisible();
      await frame.getByRole('menuitem',{name:'Сведения об объекте'}).click();
      await expect(frame.getByRole('status')).toHaveText('Госномер: AB 1234-7');
      await trigger.focus();await page.keyboard.press('Enter');await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();await expect(frame.getByRole('menu')).toHaveCount(0);
      const dialogTrigger=frame.getByRole('button',{name:'Открыть диалог',exact:true});
      const stageHeight=await frame.locator('#ready-interface').evaluate(node=>node.getBoundingClientRect().height);
      await dialogTrigger.focus();await page.keyboard.press('Enter');
      await expect(frame.getByRole('dialog',{name:'Сведения об объекте'})).toBeVisible();
      expect(await frame.locator('#ready-interface').evaluate(node=>{
        const stage=node.getBoundingClientRect(),scrim=node.querySelector('.dialog-demo > div').getBoundingClientRect(),dialog=node.querySelector('[role="dialog"]').getBoundingClientRect();
        return {height:stage.height,covers:Math.abs(scrim.top-stage.top)<=1&&Math.abs(scrim.bottom-stage.bottom)<=1,contained:dialog.top>=stage.top&&dialog.bottom<=stage.bottom&&dialog.left>=stage.left&&dialog.right<=stage.right};
      })).toEqual({height:stageHeight,covers:true,contained:true});
      await page.keyboard.press('Escape');
      await expect(frame.getByRole('dialog')).toHaveCount(0);
      await expect(dialogTrigger).toBeFocused();
      const focusButton=frame.getByRole('button',{name:'Проверить фокус'});
      await focusButton.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
      await expect(focusButton).toBeFocused();
      expect(await focusButton.evaluate(button=>button.matches(':focus-visible'))).toBe(true);
      const scroll=frame.getByRole('region',{name:'Список объектов с прокруткой'});
      const header=frame.locator('.scroll-heading header');
      await expect(header).toHaveCSS('box-shadow','none');
      await scroll.focus();await page.keyboard.press('End');
      await expect.poll(()=>header.evaluate(node=>getComputedStyle(node).boxShadow)).not.toBe('none');
      await page.keyboard.press('Home');await expect(header).toHaveCSS('box-shadow','none');
      await expect(frame.locator('#theme-layers [data-ds-appearance]')).toHaveCount(2);
      for(const id of ['radius-reference','shadow-reference']){
        await expect(frame.locator('#'+id)).not.toHaveAttribute('open','');
        await frame.locator('#'+id+' summary').focus();await page.keyboard.press('Enter');
        await expect(frame.locator('#'+id)).toHaveAttribute('open','');
      }
      await expect(frame.locator('#radius-values li')).toHaveCount(7);
      await expect(frame.locator('#shadow-values li')).toHaveCount(5);
      await expect.poll(()=>page.locator('#preview').evaluate(iframe=>iframe.contentDocument.documentElement.scrollWidth<=iframe.clientWidth&&iframe.clientHeight>=iframe.contentDocument.body.scrollHeight)).toBe(true);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      if(width===390) await contents.locator('summary').click();
      else await expect(contents).toHaveCSS('position','sticky');
      await contents.getByRole('link',{name:'Глубина и слои',exact:true}).click();
      await expect(frame.locator('#depth')).toBeFocused();await expect(page).toHaveURL(/#depth$/);
      await page.reload();await expect(frame.locator('#depth')).toBeInViewport();
      await frame.locator('html').evaluate(()=>document.fonts.ready);
      expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
      if(theme==='DEFAULT'&&appearance==='light'){
        await page.goto(`${served.url}/index.html?card=DsShape&theme=${theme}&appearance=${appearance}&density=${density}`);
        await expect(frame.getByRole('button',{name:'Действия',exact:true})).toBeVisible();
        await expect.poll(()=>page.locator('#preview').evaluate(iframe=>iframe.clientHeight>=iframe.contentDocument.body.scrollHeight)).toBe(true);
        await page.screenshot({path:testInfo.outputPath(`shape-${width}.png`),fullPage:true});
      }
    }
    await expect(page.locator('#compare')).toHaveCount(0);await expect(page.locator('#viewports iframe')).toHaveCount(1);
    await expect(page.locator('.page-contents a')).toHaveCount(8);
    await page.locator('.page-contents summary').click();
    await page.locator('.page-contents').getByRole('link',{name:'Справочник токенов',exact:true}).click();
    await expect(page.frameLocator('#preview').locator('#reference')).toBeFocused();
    expect(errors).toEqual([]);
  }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
