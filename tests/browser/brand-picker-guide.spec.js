import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
test('brand picker updates both palettes and keeps reference accessible',async({page},testInfo)=>{
 await buildCatalogue({root,outDir:root+'/site'});
 const served=await serveRoot(root+'/site');
 try{
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   await page.goto(served.url+'/index.html?card=DsBrandPick&theme='+theme+'&appearance='+appearance+'&density='+density);
   const frame=page.frameLocator('#preview');
   await expect(page.locator('.page-contents')).toHaveCount(1);
   await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
   const before=await frame.locator('#p-btn button').evaluate(el=>getComputedStyle(el).backgroundColor);
   await frame.getByLabel('Цвет бренда',{exact:true}).fill('#553399');
   await expect(frame.locator('#p-btn button')).not.toHaveCSS('background-color',before);
   await expect(frame.locator('#bs')).toHaveValue('#553399');
   await frame.locator('#p-btn button').press('Enter');
   await expect(frame.locator('#p-result')).toContainText('Отчёт построен');
   await frame.locator('#d-btn button').press('Space');
   await expect(frame.locator('#d-result')).toContainText('Отчёт построен');
   await expect(frame.locator('#contrast-pairs .contrast-pair')).toHaveCount(6);
   await expect(frame.locator('#check-summary')).toContainText('Контраст:');
   const result=await frame.locator('#out-code').textContent();
   await frame.locator('#bt').fill('broken');
   await expect(frame.locator('#bt')).toHaveAttribute('aria-invalid','true');
   await expect(frame.locator('#input-error')).toContainText('#RRGGBB');
   await expect(frame.locator('#out-code')).toHaveText(result);
   await frame.locator('#bt').fill('#2b5f9e');
   await expect(frame.locator('#input-error')).toBeEmpty();
   for(const id of ['palette-reference','calculation','export-css']){
    const details=frame.locator('#'+id);
    await expect(details).not.toHaveAttribute('open','');
    await details.locator('summary').press('Enter');
    await expect(details).toHaveAttribute('open','');
    expect(await frame.locator('html').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    await details.locator('summary').press('Enter');
   }
   expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   if(theme==='DEFAULT'&&appearance==='light')await page.screenshot({path:testInfo.outputPath('brand-picker-'+width+'.png'),fullPage:true});
   if(width===390)await page.locator('.page-contents summary').click();
   await page.locator('.page-contents').getByRole('link',{name:'Краткая памятка',exact:true}).click();
   await expect(frame.locator('#choosing')).toBeFocused();
   await page.reload();await expect(frame.locator('#choosing')).toBeInViewport();
  }
  await page.goto(served.url+'/index.html?card=DsBrandPick&compare=1');
  await expect(page.locator('#viewports iframe')).toHaveCount(4);
  await expect(page.locator('.page-contents')).toHaveCount(1);
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
