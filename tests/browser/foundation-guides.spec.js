import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));

test('foundation guides retain readable docs, scoped demos and usable interactions',async({page})=>{
 test.setTimeout(120000);
 await buildCatalogue({root,outDir:`${root}/site`});
 const served=await serveRoot(`${root}/site`),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  for(const id of ['DsSpacing','DsAccessibility','DsContent','DsMotion']){
   for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(`${served.url}/index.html?card=${id}&theme=${theme}&appearance=${appearance}&density=${density}`);
    const frame=page.frameLocator('#preview');
    await expect(frame.locator('#demo')).toHaveAttribute('data-ds-theme',theme);
    await expect(frame.locator('#demo')).toHaveAttribute('data-ds-appearance',appearance);
    await expect(frame.locator('#demo')).toHaveAttribute('data-ds-density',density);
    await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
    await expect(frame.locator('#demo').getByRole('button').or(frame.locator('#demo').getByRole('textbox')).or(frame.locator('#demo').getByRole('switch')).first()).toBeVisible();
    if(id==='DsSpacing'){
     const grouped=await frame.locator('[data-spacing-form]').evaluate(el=>parseFloat(getComputedStyle(el).gap));
     await frame.getByRole('button',{name:'Всё на одинаковом расстоянии'}).click();
     const uniform=await frame.locator('[data-spacing-form]').evaluate(el=>parseFloat(getComputedStyle(el).gap));
     expect(grouped).toBeGreaterThan(uniform);
     await expect(frame.getByRole('textbox',{name:'Название',exact:true})).toHaveValue('МАЗ 5440');
    }
    if(id==='DsAccessibility'){
     await frame.getByRole('textbox',{name:'Название объекта'}).fill('Volvo');
     await page.keyboard.press('Tab');
     await expect(frame.getByRole('button',{name:'Сохранить',exact:true})).toBeFocused();
     await page.keyboard.press('Enter');
     await expect(frame.getByRole('status')).toContainText('Volvo');
    }
    if(id==='DsContent'){
     await frame.getByRole('button',{name:'Ошибка',exact:true}).click();
     await expect(frame.getByRole('status')).toContainText('Не удалось загрузить');
    }
    if(id==='DsMotion'){
     await frame.getByRole('switch').first().focus();
     await page.keyboard.press('Space');
     await expect(frame.getByRole('switch').last()).toBeChecked();
     await expect(frame.locator('[data-motion-reduced] [data-ds-switch-thumb]')).toHaveCSS('transition-duration','0s');
     await frame.getByText('Исключение: индикатор загрузки',{exact:true}).click();
     await frame.getByRole('button',{name:'Проверить загрузку'}).click();
     await expect(frame.getByRole('status')).toHaveText('Загружаем объекты…');
     await expect(frame.getByRole('status')).toHaveText('Объекты загружены.');
    }
    const contents=page.getByRole('navigation',{name:'На этой странице'});
    await expect(contents.getByRole('link').first()).toBeVisible();
    await contents.getByRole('link').first().click();
    await expect(page).toHaveURL(/#in-interface$/);
    await page.reload();
    await expect(frame.locator('#in-interface')).toBeVisible();
    await page.setViewportSize({width:390,height:844});
    expect(await frame.locator('body').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    if(id!=='DsContent'){
     const technical=page.locator('#card-description details');
     await expect(technical).not.toHaveAttribute('open','');
     await technical.locator('summary').click();
     await expect(technical.locator('pre')).toBeVisible();
     await expect(technical).not.toContainText('<details>');
     await expect(technical).not.toContainText('<dl');
    }
   }
   const results=await new AxeBuilder({page}).include('#preview').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   expect(results.violations).toEqual([]);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.frameLocator('#preview').locator('#demo [data-ds-switch-thumb]').first()).toHaveCSS('transition-duration','0s');
  await page.frameLocator('#preview').getByText('Исключение: индикатор загрузки',{exact:true}).click();
  await page.frameLocator('#preview').getByRole('button',{name:'Проверить загрузку'}).click();
  await expect(page.frameLocator('#preview').locator('[data-ds-spinner-intro]')).toHaveCSS('animation-name','none');
  expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
