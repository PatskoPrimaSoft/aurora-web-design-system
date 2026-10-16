import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
test('brand logo guide displays the real header and accessible references in every scope',async({page},testInfo)=>{
 await buildCatalogue({root,outDir:root+'/site'});
 const served=await serveRoot(root+'/site');
 try{
 for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  await page.goto(served.url+'/index.html?card=BrandLogoLockup&theme='+theme+'&appearance='+appearance+'&density='+density);
  const f=page.frameLocator('#preview');
  await expect(page.locator('.page-contents')).toHaveCount(1);
  await expect(f.locator('body')).toHaveAttribute('data-ds-appearance','light');
  for(const [axis,value]of Object.entries({theme,appearance,density}))await expect(f.locator('#ready-interface')).toHaveAttribute('data-ds-'+axis,value);
  const logo=f.locator('#ready-interface header img');await expect(logo).toBeVisible();
  expect(await logo.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
  await expect(logo).toHaveAttribute('alt','');
  await expect(f.locator('#ready-interface header')).toContainText('Aurora');
  await expect(f.locator('#ready-interface header')).toHaveCSS('height',density==='compact'?'48px':'56px');
  await expect(f.locator('#compact-interface header img')).toBeVisible();
  await expect(f.locator('#compact-interface .visually-hidden')).toHaveText('Aurora');
  await expect(f.locator('#compact-interface header')).not.toContainText('DEV');
  await expect(f.getByText('Проверьте знак в обоих оформлениях', {exact:false})).toBeVisible();
  await expect(f.locator('.pair[data-ds-appearance]')).toHaveAttribute('data-ds-appearance','light');
  for(const id of ['logo-reference','logo-backgrounds']){
   const details=f.locator('#'+id);await expect(details).not.toHaveAttribute('open','');
   await details.locator('summary').press('Enter');await expect(details).toHaveAttribute('open','');
   expect(await f.locator('html').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   if(id==='logo-backgrounds'){
    for(const img of await details.locator('img').all())expect(await img.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
   }
   await details.locator('summary').press('Enter');
  }
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(theme==='DEFAULT'&&appearance==='light')await page.screenshot({path:testInfo.outputPath('logo-'+width+'.png'),fullPage:true});
  if(width===390)await page.locator('.page-contents summary').click();
  await page.locator('.page-contents').getByRole('link',{name:'Знак и фон',exact:true}).click();
  await expect(f.locator('#background')).toBeFocused();await page.reload();await expect(f.locator('#background')).toBeInViewport();
 }
 await page.goto(served.url+'/index.html?card=BrandLogoMark');await expect(page.locator('#title')).toHaveText('Логотип бренда');
 await page.goto(served.url+'/index.html?card=BrandLogoLockup&compare=1');
 await expect(page.locator('#viewports iframe')).toHaveCount(1);await expect(page.locator('.page-contents')).toHaveCount(1);
 for(let i=0;i<1;i++)await expect(page.frameLocator('#preview').locator('#ready-interface header img')).toBeVisible();
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
