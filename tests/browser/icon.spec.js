import {test,expect} from '@playwright/test';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));

test('icon examples keep token sizes, readable surface colors and keyboard interactions across modes',async({page},testInfo)=>{
 await buildCatalogue({root,outDir:`${root}/site`});
 const served=await serveRoot(`${root}/site`),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
   for(const width of [390,1280]){
    await page.setViewportSize({width,height:900});
    await page.goto(`${served.url}/index.html?card=DsIcon&theme=${theme}&appearance=${appearance}&density=${density}`);
    await expect(page.locator('main h2')).toHaveText(['Живые примеры','Правила применения','Пример кода','Параметры','Токены']);
    const frame=page.frameLocator('#preview');
    await expect(frame.getByRole('button',{name:'Повернуть на 45°'})).toBeVisible();
    const sizes=await frame.locator('section[aria-label="Размеры"] .row').first().locator('.material-symbols-outlined').evaluateAll(nodes=>nodes.map(node=>({size:parseFloat(getComputedStyle(node).fontSize),width:node.getBoundingClientRect().width})));
    expect(sizes.map(item=>item.size)).toEqual(density==='cozy'?[14,16,20,24]:[12,14,18,20]);
    for(const item of sizes)expect(item.width).toBeCloseTo(item.size,1);
    const rotation=frame.getByRole('button',{name:'Повернуть на 45°'});
    await rotation.focus();await page.keyboard.press('Enter');
    await expect(frame.locator('section[aria-label="Направление"]')).toContainText('Курс: 90°');
    await expect(frame.locator('section[aria-label="Направление"] [role="img"]')).toHaveCount(0);
    await expect(frame.getByRole('img',{name:'Доступ ограничен',exact:true})).toHaveCount(1);
    const button=frame.getByRole('button',{name:'Сохранить в избранное',exact:true});
    await button.focus();await page.keyboard.press('Space');
    await expect(button).toHaveAttribute('aria-pressed','true');
    await expect(frame.getByRole('status')).toHaveText('Сохранено в избранном');
    const area=await button.boundingBox();expect(area.width).toBeGreaterThanOrEqual(24);expect(area.height).toBeGreaterThanOrEqual(24);
    const choose=frame.getByRole('button',{name:'Измерение',exact:true});
    await choose.focus();await page.keyboard.press('Enter');
    await expect(choose).toHaveAttribute('aria-pressed','true');
    await expect(frame.locator('section[aria-label="Выбор иконки"] code')).toHaveText('straighten');
    const ratios=await frame.locator('[data-icon-surface]').evaluateAll(surfaces=>{
     const rgb=value=>value.match(/[\d.]+/g).slice(0,3).map(Number);
     const lum=value=>rgb(value).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
     return surfaces.flatMap(surface=>Array.from(surface.querySelectorAll('.sample')).map(node=>{
      const bg=surface.dataset.iconSurface==='inverse'?getComputedStyle(surface).backgroundColor:getComputedStyle(document.body).backgroundColor;
      const a=lum(getComputedStyle(node).color),b=lum(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
     }));
    });
    for(const ratio of ratios)expect(ratio).toBeGreaterThanOrEqual(3);
    await expect.poll(()=>page.locator('#preview').evaluate(el=>el.contentDocument.documentElement.scrollWidth<=el.clientWidth)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:testInfo.outputPath(`icon-${width}-${theme}-${appearance}.png`),fullPage:true});
   }
  }
  expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});

