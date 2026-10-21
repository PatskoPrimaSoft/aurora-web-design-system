import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {exampleDemo} from './helpers/live-example.js';
import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
const modes=[['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']];
test('spinner reserves space during delay and keeps rotation with reduced motion',async({page},testInfo)=>{
 const served=await serveRoot(siteRoot());
 try{await page.clock.install();page.setDefaultTimeout(3000);
 for(const [theme,appearance,density] of modes){
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(`${served.url}/index.html?card=DsSpinner&theme=${theme}&appearance=${appearance}&density=${density}`);
 const f=page.frameLocator('#preview');await f.getByRole('button',{name:'Обновить отчёт'}).waitFor();
 await f.locator('body').evaluate(()=>{const el=document.createElement('div');el.id='fixture';document.body.append(el);window.spinnerRoot=ReactDOM.createRoot(el);spinnerRoot.render(React.createElement(AuroraWebDesignSystem_96e210.DsSpinner,{delay:500,size:32,label:'Тестовая загрузка'}));});
 const host=f.locator('#fixture [data-ds-spinner]');await expect(host).toHaveCSS('width','32px');await expect(host).toHaveCSS('height','32px');
 await expect(f.getByRole('status',{name:'Тестовая загрузка'})).toHaveCount(0);
 await page.clock.fastForward(500);await expect(f.getByRole('status',{name:'Тестовая загрузка'})).toBeAttached();
 await expect(host.locator('[data-ds-spinner-intro]')).toHaveCSS('animation-name','ds-spinner-enter');
 await expect(host.locator('[data-ds-spinner-ring]')).toHaveCSS('animation-name','ds-spin');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(host.locator('[data-ds-spinner-intro]')).toHaveCSS('animation-name','none');
 await expect(host.locator('[data-ds-spinner-ring]')).toHaveCSS('animation-name','ds-spin');
 await f.locator('body').evaluate(()=>{spinnerRoot.unmount();spinnerRoot=ReactDOM.createRoot(document.getElementById('fixture'));spinnerRoot.render(React.createElement(AuroraWebDesignSystem_96e210.DsSpinner,{delay:1000,label:'Отменённая загрузка'}));});
 await f.locator('#fixture [data-ds-spinner]').waitFor();await page.clock.fastForward(200);
 await f.locator('body').evaluate(()=>spinnerRoot.unmount());await page.clock.fastForward(1000);
 await expect(f.getByRole('status',{name:'Отменённая загрузка'})).toHaveCount(0);
 }
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
test('refresh and retry examples retain geometry, content and focus',async({page},testInfo)=>{
 const served=await serveRoot(siteRoot()),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{await page.clock.install();page.setDefaultTimeout(3000);
 for(const [theme,appearance,density] of modes)for(const width of [390,1280]){
 await page.setViewportSize({width,height:900});await page.goto(`${served.url}/index.html?card=DsSpinner&theme=${theme}&appearance=${appearance}&density=${density}`);
 const f=page.frameLocator('#preview'),refresh=exampleDemo(f,'Обновление существующих данных'),retry=exampleDemo(f,'Ошибка и повторная попытка');
 const button=refresh.getByRole('button',{name:'Обновить отчёт'});await button.waitFor();
 await expect(f.locator('.variants').getByRole('status')).toHaveCount(0);
 const geometry=()=>refresh.locator('.data').evaluate(el=>({left:el.offsetLeft,top:el.offsetTop,width:el.offsetWidth,height:el.offsetHeight}));const before=await geometry();await button.focus();await page.keyboard.press('Enter');
 await expect(refresh.locator('[aria-busy]')).toHaveAttribute('aria-busy','true');
 await expect(refresh.getByText('Отчёт: 24 объекта.',{exact:true})).toBeVisible();
 await expect(refresh.getByRole('status')).toHaveText('Обновление отчёта…');
 expect(await refresh.locator('[data-ds-spinner-ring]').count()).toBe(1);
 expect(await geometry()).toEqual(before);
 await page.clock.fastForward(750);await page.keyboard.press('Enter');await page.clock.fastForward(750);
 await expect(refresh.getByRole('status')).toHaveText('Отчёт обновлён.');await expect(button).toBeFocused();
 const load=retry.getByRole('button');await load.focus();await page.keyboard.press('Enter');expect(await retry.locator('[data-ds-spinner-ring]').count()).toBe(1);await page.clock.fastForward(1500);
 await expect(retry.getByRole('status')).toHaveText('Не удалось загрузить отчёт. Повторите попытку.');await expect(load).toBeFocused();
 await expect(load).toHaveText('Повторить загрузку');await page.keyboard.press('Enter');await page.clock.fastForward(1500);
 await expect(retry.getByRole('status')).toHaveText('Отчёт загружен.');await expect(load).toBeFocused();
 await expect(retry.getByText('Отчёт: 24 объекта.',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await f.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:testInfo.outputPath(`spinner-final-${width}-${theme}-${appearance}.png`),fullPage:true});
 }expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
