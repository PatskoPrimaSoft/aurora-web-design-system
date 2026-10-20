import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';

test('DsTabs preserves drafts, exposes feedback and reveals selected tabs in every mode',async({page},testInfo)=>{
 const served=await serveRoot(siteRoot()),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   await page.goto(served.url+`/index.html?card=DsTabs&theme=${theme}&appearance=${appearance}&density=${density}`);
   const f=page.frameLocator('#preview');
   const tabs=f.getByRole('tablist',{name:'Карточка группы'}),history=tabs.getByRole('tab',{name:/История/});
   await history.hover();await expect(history.locator('[data-ds-tab-indicator]')).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)');
   await page.mouse.down();await expect(history).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)');await page.mouse.up();
   await expect(history).toHaveAttribute('aria-selected','true');
   await history.focus();await page.keyboard.press('ArrowRight');
   await expect(tabs.getByRole('tab',{name:'Настройки',exact:true})).toBeFocused();
   await expect(f.getByRole('tabpanel',{name:'Настройки',exact:true})).toContainText('Название группы');
   await page.keyboard.press('Home');await expect(tabs.getByRole('tab',{name:'Обзор',exact:true})).toHaveAttribute('aria-selected','true');
   const segmented=f.getByRole('tablist',{name:'Период отчёта'}),week=segmented.getByRole('tab',{name:/Неделя/});
   await expect(week.locator('[data-ds-tab-count]')).toHaveText('7');await week.hover();
   await expect(week).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)');
   const hover=await week.evaluate(el=>getComputedStyle(el).backgroundColor);
   await page.mouse.down();await expect.poll(()=>week.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(hover);await page.mouse.up();
   await expect(f.getByRole('tabpanel',{name:/Неделя/})).toContainText('94 поездки');
   const field=f.getByRole('textbox',{name:'Название группы',exact:true});await field.fill('Черновик группы');
   const draftTabs=f.getByRole('tablist',{name:'Редактирование группы'});
   await draftTabs.getByRole('tab',{name:'Подсказка',exact:true}).click();await expect(field).toBeHidden();
   await draftTabs.getByRole('tab',{name:'Название',exact:true}).click();await expect(field).toHaveValue('Черновик группы');
   const rail=f.getByRole('tablist',{name:'Разделы карточки'}),viewport=rail.locator('..');
   const visible=()=>rail.locator('[aria-selected="true"]').evaluate(el=>{
    const item=el.getBoundingClientRect(),view=el.parentElement.parentElement.getBoundingClientRect();
    return item.left>=view.left-1&&item.right<=view.right+1;
   });
   await expect.poll(visible).toBe(true);
   await rail.getByRole('tab',{name:'Отчёты по поездкам',exact:true}).focus();await page.keyboard.press('End');
   await expect(rail.getByRole('tab',{name:'Настройки доступа',exact:true})).toBeFocused();
   await expect.poll(visible).toBe(true);
   await expect(rail.getByRole('tab',{name:'Настройки доступа',exact:true})).toHaveCSS('outline-style','solid');
   await viewport.evaluate(el=>el.parentElement.style.maxWidth='260px');await expect.poll(visible).toBe(true);
   await page.keyboard.press('Home');await expect(rail.getByRole('tab',{name:'Обзор',exact:true})).toBeFocused();
   await expect.poll(visible).toBe(true);await expect.poll(()=>viewport.evaluate(el=>el.scrollLeft)).toBe(0);
   for(const name of ['Навигация в шапке','Короткая навигация в одну строку']){
    const nav=f.getByRole('navigation',{name,exact:true}),reports=nav.getByRole('button',{name:'Отчёты',exact:true});
    await reports.hover();const bg=await reports.evaluate(el=>getComputedStyle(el).backgroundColor);
    await page.mouse.down();await expect.poll(()=>reports.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(bg);await page.mouse.up();
    await expect(reports).toHaveAttribute('aria-current','page');await reports.focus();await page.keyboard.press('Space');
    await expect(reports).toHaveAttribute('aria-current','page');
   }
   const neutral=await history.locator('[data-ds-tab-count]').evaluate(el=>getComputedStyle(el).backgroundColor);
   const header=await f.getByRole('navigation',{name:'Навигация в шапке',exact:true}).locator('[data-ds-tab-count]').evaluate(el=>getComputedStyle(el).backgroundColor);
   expect(neutral).not.toBe(header);
   await expect.poll(()=>page.locator('#preview').evaluate(iframe=>Math.abs(iframe.getBoundingClientRect().height-iframe.contentDocument.body.getBoundingClientRect().height))).toBeLessThanOrEqual(3);
   expect(await f.locator('body').evaluate(el=>el.scrollWidth>innerWidth+1)).toBe(false);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
   await page.screenshot({path:testInfo.outputPath(`tabs-updated-${width}-${theme}-${appearance}.png`),fullPage:true});
  }
  expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});

test('DsTabs moves one indicator, follows resizing and respects reduced motion',async({page},testInfo)=>{
 const served=await serveRoot(siteRoot());
 try{
  for(const reducedMotion of ['no-preference','reduce']){
   await page.emulateMedia({reducedMotion});
   await page.goto(served.url+'/index.html?card=DsTabs');
   const f=page.frameLocator('#preview');
   for(const [role,name,target] of [['tablist','Карточка группы','Настройки'],['navigation','Навигация в шапке','Отчёты']]){
    const rail=f.getByRole(role,{name,exact:true}),marker=rail.locator('[data-ds-tabs-indicator]');
    await expect(marker).toHaveCount(1);
    await marker.evaluate(el=>el.dataset.instance='original');
    const button=rail.getByRole(role==='tablist'?'tab':'button',{name:target,exact:true});
    await button.click();await expect(marker).toHaveAttribute('data-instance','original');
    await expect.poll(()=>marker.evaluate(el=>getComputedStyle(el).transitionDuration)).toBe(reducedMotion==='reduce'?'0s, 0s':'0.12s, 0.12s');
    const aligned=()=>marker.evaluate(el=>{
     const selected=el.parentElement.querySelector('[aria-selected="true"],[aria-current="page"]');
     const a=el.getBoundingClientRect(),b=selected.getBoundingClientRect(),inset=selected.dataset.dsTab==='header'?10:0;
     return Math.abs(a.left-b.left-inset)<1&&Math.abs(a.width-b.width+inset*2)<1;
    });
    await expect.poll(aligned).toBe(true);
    await page.setViewportSize({width:390,height:900});await expect.poll(aligned).toBe(true);
    await button.evaluate(el=>el.style.paddingInline='24px');await expect.poll(aligned).toBe(true);
    await expect(button).toBeFocused();
   }
  }
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
