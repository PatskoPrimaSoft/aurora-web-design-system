import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const modes=[['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']];

test('skeleton supports static rendering and reduced motion across themes',async({page})=>{
 const served=await serveRoot(fileURLToPath(new URL('../../site',import.meta.url)));
 try{
  for(const [theme,appearance,density] of modes){
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.goto(`${served.url}/index.html?card=DsSkeleton&theme=${theme}&appearance=${appearance}&density=${density}`);
   const f=page.frameLocator('#preview');
   await expect(f.locator('[data-ds-skeleton]').first()).toHaveCSS('animation-name','ds-pulse');
   await f.locator('body').evaluate(()=>{
    const host=document.createElement('div');host.id='static-fixture';document.body.append(host);
    const h=React.createElement,S=window.AuroraWebDesignSystem_96e210;
    ReactDOM.createRoot(host).render(h(S.DsSkeleton,{animated:false,width:80,height:20}));
   });
   const staticBlock=f.locator('#static-fixture [data-ds-skeleton]');
   await expect(staticBlock).toHaveCSS('animation-name','none');
   await expect(staticBlock).toHaveAttribute('aria-hidden','true');
   const expected=await f.locator('body').evaluate(el=>{
    const probe=document.createElement('span');probe.style.background='var(--ds-skeleton-bg)';el.append(probe);
    const bg=getComputedStyle(probe).backgroundColor;probe.remove();return bg;
   });
   expect(expected).not.toBe('rgba(0, 0, 0, 0)');
   await expect(staticBlock).toHaveCSS('background-color',expected);
   await page.emulateMedia({reducedMotion:'reduce'});
   await expect(f.locator('[data-ds-skeleton]').first()).toHaveCSS('animation-name','none');
   await expect(staticBlock).toHaveCSS('opacity','1');
  }
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});

test('loading resolves automatically without moving rows or keyboard focus',async({page})=>{
 const served=await serveRoot(fileURLToPath(new URL('../../site',import.meta.url))),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  page.setDefaultTimeout(5000);
  await page.clock.install();
  for(const [theme,appearance,density] of modes)for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   await page.goto(`${served.url}/index.html?card=DsSkeleton&theme=${theme}&appearance=${appearance}&density=${density}`);
   const f=page.frameLocator('#preview'),live=f.getByRole('region',{name:'Переход к загруженным данным'});
   await expect(page.locator('main h2')).toHaveText(['Живые примеры','Правила применения','Пример кода','Параметры','Токены']);
   const button=live.getByRole('button',{name:'Повторить загрузку'});
   await expect(button).toBeVisible();
   await page.clock.fastForward(1200);
   await expect(live.getByRole('status')).toHaveText('Загружено 3 пользователя.');
   await button.focus();await page.keyboard.press('Enter');
   const area=live.getByRole('region',{name:'Пользователи'});
   await expect(area).toHaveAttribute('aria-busy','true');
   await expect(live.getByRole('status')).toContainText('Загрузка');
   const before=await area.locator('.row').evaluateAll(els=>els.map(el=>({top:el.getBoundingClientRect().top,height:el.getBoundingClientRect().height})));
   await page.clock.fastForward(600);
   await page.keyboard.press('Enter'); // Repeat activation must not restart the pending request.
   await page.clock.fastForward(600);
   await expect(area).toHaveAttribute('aria-busy','false');
   await expect(area.getByText('Анна Смирнова',{exact:true})).toBeVisible();
   await expect(button).toBeFocused();
   const after=await area.locator('.row').evaluateAll(els=>els.map(el=>({top:el.getBoundingClientRect().top,height:el.getBoundingClientRect().height})));
   expect(after).toEqual(before);
   await expect(live.getByRole('status')).toHaveText('Загружено 3 пользователя.');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   expect(await page.locator('#preview').evaluate(el=>el.contentDocument.documentElement.scrollWidth<=el.clientWidth)).toBe(true);
   await page.screenshot({path:`.tmp/skeleton-ready-${width}-${theme}-${appearance}.png`,fullPage:true});
  }
  expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
