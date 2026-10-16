import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
test('sorting guide applies real ordering and keeps documentation neutral',async({page},testInfo)=>{
  await buildCatalogue({root,outDir:root+'/site'});
  const served=await serveRoot(root+'/site');
  try{
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
      for(const width of [1440,390]){
        await page.setViewportSize({width,height:1000});
        await page.goto(`${served.url}/index.html?card=DsSortingMenu&theme=${theme}&appearance=${appearance}&density=${density}`);
        const frame=page.frameLocator('#preview'),scene=frame.locator('#ready-interface');
        await expect(page.locator('.page-contents')).toHaveCount(1);
        await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
        for(const [axis,value] of Object.entries({theme,appearance,density}))await expect(scene).toHaveAttribute(`data-ds-${axis}`,value);
        const list=scene.getByRole('list',{name:'Объекты с сортировкой'});
        await expect(list.getByRole('listitem').first()).toContainText('Volvo FH16');
        const trigger=scene.getByRole('button',{name:/^Сортировка:/});
        await trigger.press('Enter');
        await expect(scene.locator('[data-ds-filter-clear]')).toHaveCount(0);
        const directions=frame.getByRole('dialog').locator('button');
        for(const button of await directions.all())expect(await button.locator('[data-ds-button-label]').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
        for(const button of await frame.getByRole('dialog').locator('button[aria-pressed]').all())expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(24);
        await expect(list.getByRole('listitem').first()).toContainText('14.10.2026');
        await frame.getByRole('radio',{name:'Названию',exact:true}).check();
        await frame.getByRole('button',{name:'А → Я',exact:true}).click();
        await expect(list.getByRole('listitem').first()).toContainText('Volvo FH16');
        await frame.getByRole('button',{name:'Применить',exact:true}).click();
        await expect(list.getByRole('listitem').first()).toContainText('ГАЗ Next');
        await expect(trigger).toBeFocused();
        await trigger.press('Space');
        await frame.getByRole('radio',{name:'Скорости',exact:true}).check();
        await page.keyboard.press('Escape');
        await expect(list.getByRole('listitem').first()).toContainText('ГАЗ Next');
        await trigger.press('Enter');
        await frame.getByRole('radio',{name:'Скорости',exact:true}).check();
        await frame.getByRole('button',{name:'Сначала больше',exact:true}).click();
        await frame.getByRole('button',{name:'Применить',exact:true}).click();
        await expect(list.getByRole('listitem').first()).toContainText('МАЗ 5440');
        await trigger.press('Enter');
        await frame.getByRole('button',{name:'Сбросить порядок',exact:true}).click();
        await expect(list.getByRole('listitem').first()).toContainText('Volvo FH16');
        await expect(list.getByRole('listitem')).toHaveCount(4);
        const reference=frame.locator('#sorting-reference');
        await expect(reference).not.toHaveAttribute('open','');
        await reference.locator('summary').press('Enter');
        await expect(reference).toHaveAttribute('open','');
        await reference.locator('summary').press('Enter');
        const code=page.locator('#card-description details');
        await code.locator('summary').press('Enter');
        await expect(code.getByRole('button',{name:'Копировать код',exact:true})).toBeVisible();
        await code.locator('summary').press('Enter');
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
        expect(await frame.locator('html').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
        expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
        if(theme==='DEFAULT'&&appearance==='light')await page.screenshot({path:testInfo.outputPath(`sorting-menu-${width}.png`),fullPage:true});
        if(width===390)await page.locator('.page-contents summary').click();
        await page.locator('.page-contents').getByRole('link',{name:'Краткая памятка',exact:true}).click();
        await expect(frame.locator('#choosing')).toBeFocused();
        await page.reload();
        await expect(frame.locator('#choosing')).toBeInViewport();
      }
    }
    await page.goto(`${served.url}/index.html?card=DsSortingMenu&compare=1`);
    await expect(page.locator('#viewports iframe')).toHaveCount(1);
    await expect(page.locator('.page-contents')).toHaveCount(1);
    for(let index=0;index<1;index++)await expect(page.frameLocator('#preview').getByRole('list',{name:'Объекты с сортировкой'}).getByRole('listitem')).toHaveCount(4);
  }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
