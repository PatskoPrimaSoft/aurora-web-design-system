import {exampleDemo} from './helpers/live-example.js';
import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../site',import.meta.url));
const modes=[['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']];
async function fixture(page,served){
 await page.goto(served.url+'/index.html?card=DsToast');
 const f=page.frameLocator('#preview');await f.locator('body').waitFor();
 await f.locator('body').evaluate(()=>{
  const el=document.createElement('div');el.id='fixture';el.style.cssText='position:relative;transform:translateZ(0);min-height:160px';document.body.append(el);window.toastRoot=ReactDOM.createRoot(el);
  const h=React.createElement,S=AuroraWebDesignSystem_96e210;
  window.dismissCount=0;
  toastRoot.render(h(S.DsToastStack,null,h(S.DsToast,{key:'timer',autoDismiss:8000,onClose:()=>{window.dismissCount++;toastRoot.render(h(S.DsToastStack));}},'Готово')));
 });return f;
}
test('toast timer pauses for hover and focus, preserves remaining time and animates removal',async({page})=>{
 const served=await serveRoot(root);try{
 await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));const f=await fixture(page,served),toast=f.locator('#fixture [data-ds-toast]');
 await expect(toast).toHaveAttribute('role','status');await expect(toast).toHaveAttribute('aria-atomic','true');
 await page.clock.fastForward(3000);await toast.hover();await page.clock.fastForward(10000);await expect(toast).toBeVisible();
 await toast.getByRole('button',{name:'Закрыть',exact:true}).focus();await page.mouse.move(0,0);await page.clock.fastForward(10000);await expect(toast).toBeVisible();
 await f.getByRole('button',{name:'Архивировать объект'}).focus();await page.clock.fastForward(4999);await expect(toast).toBeVisible();
 await page.clock.fastForward(1);await expect(f.locator('#fixture [data-ds-toast-item]')).toHaveAttribute('data-exiting','true');
 await page.clock.fastForward(250);await expect(toast).toHaveCount(0);expect(await f.locator('body').evaluate(()=>dismissCount)).toBe(1);
 await f.locator('body').evaluate(()=>{const h=React.createElement,S=AuroraWebDesignSystem_96e210;toastRoot.render(h(S.DsToast,{tone:'danger',announcement:'polite',autoDismiss:8000,onClose:()=>dismissCount++},'Ошибка'));});
 await page.clock.fastForward(20000);await expect(f.locator('#fixture').getByRole('status')).toContainText('Ошибка');expect(await f.locator('body').evaluate(()=>dismissCount)).toBe(1);
 await f.locator('body').evaluate(()=>{const h=React.createElement,S=AuroraWebDesignSystem_96e210;toastRoot.render(h(S.DsToastStack,null,h(S.DsToast,{key:'cancel',autoDismiss:1,onClose:()=>dismissCount++},'Внешнее закрытие')));});
 await expect(f.locator('#fixture [data-ds-toast]')).toBeVisible();await page.clock.fastForward(7999);expect(await f.locator('body').evaluate(()=>dismissCount)).toBe(1);
 await f.locator('body').evaluate(()=>ReactDOM.flushSync(()=>toastRoot.render(React.createElement(AuroraWebDesignSystem_96e210.DsToastStack))));await page.clock.fastForward(250);expect(await f.locator('body').evaluate(()=>dismissCount)).toBe(1);
 await f.locator('body').evaluate(()=>toastRoot.unmount());await page.clock.fastForward(20000);expect(await f.locator('body').evaluate(()=>dismissCount)).toBe(1);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
test('toast handles long content, inverse controls and responsive stacks in every mode',async({page})=>{
 const served=await serveRoot(root);try{for(const [theme,appearance,density] of modes)for(const width of [390,1280]){
 await page.setViewportSize({width,height:900});await page.goto(`${served.url}/index.html?card=DsToast&theme=${theme}&appearance=${appearance}&density=${density}`);
 const f=page.frameLocator('#preview');await f.getByRole('button',{name:'Архивировать объект'}).waitFor();
 await f.locator('body').evaluate(()=>{const el=document.createElement('div');el.id='narrow';el.style.width='240px';document.body.append(el);ReactDOM.createRoot(el).render(React.createElement(AuroraWebDesignSystem_96e210.DsToast,{tone:'danger',announcement:'off',action:()=>{},actionLabel:'Повторить загрузку',onClose:()=>{}},'ОтчётОченьДлинноеНазвание'.repeat(10)));});
 const narrow=f.locator('#narrow');await expect(narrow.getByRole('alert')).toHaveCount(0);await expect(narrow.getByRole('status')).toHaveCount(0);
 expect(await narrow.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(false);
 const close=narrow.getByRole('button',{name:'Закрыть',exact:true});expect(await close.evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThanOrEqual(28);
 await close.focus();await expect(close).toHaveCSS('outline-style','solid');
 const before=await close.evaluate(el=>getComputedStyle(el).backgroundImage);await close.hover();await expect.poll(()=>close.evaluate(el=>getComputedStyle(el).backgroundImage)).not.toBe(before);
 await page.mouse.move(0,0);await page.emulateMedia({reducedMotion:'reduce'});await expect(narrow.locator('[data-ds-toast]')).toHaveCSS('animation-name','none');
 expect(await f.locator('html').evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(false);
 await page.emulateMedia({reducedMotion:'no-preference'});
 } }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});

test('toast live examples support undo, retry, queue dismissal and modal keyboard access',async({page})=>{
 const served=await serveRoot(root);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{await page.clock.install();for(const [theme,appearance,density] of modes)for(const width of [390,1280]){
 await page.setViewportSize({width,height:900});await page.goto(`${served.url}/index.html?card=DsToast&theme=${theme}&appearance=${appearance}&density=${density}`);
 const f=page.frameLocator('#preview');await exampleDemo(f,'Действие, отмена и закрытие').waitFor();
 const archive=exampleDemo(f,'Действие, отмена и закрытие');await archive.getByRole('button',{name:'Архивировать объект'}).click();await archive.getByRole('button',{name:'Отменить',exact:true}).focus();await page.keyboard.press('Space');await expect(archive.getByRole('status')).toContainText('восстановлен');await page.clock.fastForward(250);
 await archive.getByRole('button',{name:'Закрыть',exact:true}).focus();await page.keyboard.press('Enter');await page.clock.fastForward(250);await expect(archive.locator('[data-ds-toast]')).toHaveCount(0);await expect(archive.getByRole('button',{name:'Архивировать объект'})).toBeFocused();
 const retry=exampleDemo(f,'Ошибка и повторная попытка');const button=retry.getByRole('button');await button.focus();await page.keyboard.press('Enter');await page.keyboard.press('Enter');await expect(retry.getByRole('status')).toContainText('Загружаем');await page.clock.fastForward(1500);await expect(retry.getByRole('status')).toContainText('Отчёт загружен');await expect(button).toBeFocused();
 const queue=exampleDemo(f,'Несколько уведомлений');for(let i=0;i<3;i++)await queue.getByRole('button',{name:'Добавить уведомление'}).click();await expect(queue.getByRole('status')).toHaveCount(3);await queue.getByRole('button',{name:'Закрыть уведомление 2',exact:true}).focus();await page.keyboard.press('Enter');await page.clock.fastForward(250);await expect(queue.getByRole('status')).toHaveCount(2);await expect(queue.getByRole('button',{name:'Добавить уведомление'})).toBeFocused();
 const auto=exampleDemo(f,'Автозакрытие с паузой');await auto.getByRole('button',{name:'Показать на 8 секунд'}).click();await queue.getByRole('button',{name:'Добавить уведомление'}).focus();await page.clock.fastForward(8300);await expect(auto.getByRole('status')).toHaveCount(0);await expect(queue.getByRole('button',{name:'Добавить уведомление'})).toBeFocused();
 const modal=exampleDemo(f,'Уведомление поверх диалога');await modal.getByRole('button',{name:'Открыть диалог'}).click();const dialog=f.getByRole('dialog',{name:'Настройки отчёта'});await dialog.getByRole('button',{name:'Сохранить в диалоге'}).click();await expect(dialog.getByRole('status')).toBeVisible();
 const close=dialog.getByRole('button',{name:'Закрыть',exact:true}).last();await close.focus();await page.keyboard.press('Tab');await expect(dialog.getByRole('button',{name:'Закрыть',exact:true}).first()).toBeFocused();await close.focus();await page.keyboard.press('Enter');await page.clock.fastForward(250);await expect(dialog.getByRole('status')).toHaveCount(0);await expect(dialog.getByRole('button',{name:'Сохранить в диалоге'})).toBeFocused();await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
 await expect.poll(()=>page.locator('#preview').evaluate(iframe=>Math.abs(iframe.getBoundingClientRect().height-iframe.contentDocument.body.getBoundingClientRect().height))).toBeLessThanOrEqual(3);
 expect(await f.locator('html').evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(false);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.locator('#preview').screenshot({path:`.tmp/toast-final-${width}-${theme}-${appearance}.png`});
 }expect(errors).toEqual([]);}finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
