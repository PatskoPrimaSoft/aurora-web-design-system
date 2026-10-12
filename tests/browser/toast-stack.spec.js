import {exampleDemo} from './helpers/live-example.js';
import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../site',import.meta.url));
async function mount(page,url,useExplicitReturn=true){
 await page.goto(url+'/index.html?card=DsToastStack');
 const f=page.frameLocator('#preview');await f.locator('body').waitFor();
 await f.locator('body').evaluate(useExplicitReturn=>{
  document.getElementById('root').style.display='none';
  const el=document.createElement('div');el.id='fixture';document.body.append(el);
  const h=React.createElement,S=AuroraWebDesignSystem_96e210;
  window.dismissedIds=[];
  function App(){const [ids,setIds]=React.useState([1,2,3,4,5]),[reverse,setReverse]=React.useState(false),trigger=React.useRef(null);
   window.removeToast=id=>setIds(list=>list.filter(x=>x!==id));
   window.showToast=id=>setIds([id]);
   return h('div',{style:{transform:'translateZ(0)',overflow:'hidden',height:40}},
    h('button',{ref:trigger,onClick:()=>setReverse(x=>!x)},'Order'),
    h(S.DsToastStack,{label:'Exports',portal:true,maxVisible:3,order:reverse?'newest-first':'oldest-first',returnFocusRef:useExplicitReturn?trigger:undefined},ids.map(id=>h(S.DsToast,{key:id,tone:'success',closeLabel:'Close '+id,autoDismiss:id===4?8000:0,onClose:()=>{dismissedIds.push(id);setIds(list=>list.filter(x=>x!==id));}},'Message '+id))));}
  ReactDOM.createRoot(el).render(h(App));
 },useExplicitReturn);return f;
}
test('stack queues without mounting pending toasts and manages keyboard focus through dismissal',async({page})=>{
 const served=await serveRoot(root);try{
 const f=await mount(page,served.url);
 const stack=f.getByRole('region',{name:'Exports'});await expect(stack).toBeVisible();
 await expect(stack.locator('[data-ds-toast]')).toHaveCount(3);
 await expect(stack).not.toContainText('Message 4');
 expect(await stack.evaluate(el=>el.parentElement===document.body)).toBe(true);
 await f.getByRole('button',{name:'Order',exact:true}).click();
 await expect(stack.locator('[data-ds-toast-body]')).toHaveText(['Message 3','Message 2','Message 1']);
 await f.getByRole('button',{name:'Order',exact:true}).click();
 await stack.getByRole('button',{name:'Close 2',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(stack.getByRole('button',{name:'Close 3',exact:true})).toBeFocused();
 await expect(stack.locator('[data-ds-toast-body]')).toHaveText(['Message 1','Message 3','Message 4']);
 for(const id of [3,4,5,1]){
  const close=stack.getByRole('button',{name:'Close '+id,exact:true});await close.focus();await page.keyboard.press('Enter');
  await expect(stack.locator('[data-ds-toast-item][data-exiting="true"]')).toHaveCount(0);
 }
 await expect(stack).toHaveCount(0);await expect(f.getByRole('button',{name:'Order',exact:true})).toBeFocused();
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
test('pending toast timer starts on admission and background removals never steal focus',async({page})=>{
 const served=await serveRoot(root);try{
 await page.clock.install();const f=await mount(page,served.url,false);const stack=f.getByRole('region',{name:'Exports'});
 await expect(stack.locator('[data-ds-toast]')).toHaveCount(3);
 await f.getByRole('button',{name:'Order',exact:true}).focus();await page.clock.fastForward(10000);
 expect(await f.locator('body').evaluate(()=>dismissedIds)).toEqual([]);
 await f.locator('body').evaluate(()=>removeToast(1));await page.clock.fastForward(250);
 await expect(stack.getByRole('button',{name:'Close 4',exact:true})).toBeVisible();
 await page.clock.fastForward(7900);expect(await f.locator('body').evaluate(()=>dismissedIds)).toEqual([]);
 await page.clock.fastForward(400);expect(await f.locator('body').evaluate(()=>dismissedIds)).toEqual([4]);
 await expect(f.getByRole('button',{name:'Order',exact:true})).toBeFocused();
 await expect(stack.locator('[data-ds-toast-body]')).toHaveText(['Message 2','Message 3','Message 5']);
 await f.locator('body').evaluate(()=>ReactDOM.flushSync(()=>[2,3,5].forEach(removeToast)));
 await page.clock.fastForward(300);await expect(stack).toHaveCount(0);
 await f.getByRole('button',{name:'Order',exact:true}).focus();await f.locator('body').evaluate(()=>showToast(6));
 const close=stack.getByRole('button',{name:'Close 6',exact:true});await close.focus();await page.keyboard.press('Enter');
 await expect(f.getByRole('button',{name:'Order',exact:true})).toBeFocused();
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});

test('stack examples support overflow, order, portal and dialog keyboard access in all modes',async({page})=>{
 const served=await serveRoot(root),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
 await page.setViewportSize({width,height:900});await page.goto(`${served.url}/index.html?card=DsToastStack&theme=${theme}&appearance=${appearance}&density=${density}`);
 const f=page.frameLocator('#preview'),q=exampleDemo(f,'Очередь, порядок и позиция'),group=q.getByRole('region',{name:'Результаты операций'});
 await expect(group.locator('[data-ds-toast]')).toHaveCount(3);await expect(q).toContainText('Ожидают: 2');
 await expect(page.locator('main h2')).toHaveText(['Живые примеры','Правила применения','Пример кода','Параметры','Токены']);
 await expect(page.getByRole('table',{name:'Параметры DsToastStack'})).toContainText('maxVisible');
 await q.getByRole('button',{name:'Новые сверху',exact:true}).click();await expect(group.locator('[data-ds-toast-body]').first()).toHaveText('Изменение 3 сохранено.');
 await q.getByRole('button',{name:'Старые сверху',exact:true}).click();
 await q.getByRole('button',{name:'Закрыть уведомление 2',exact:true}).focus();await page.keyboard.press('Enter');await expect(q.getByRole('button',{name:'Закрыть уведомление 3',exact:true})).toBeFocused();
 await expect(group.locator('[data-ds-toast-body]').last()).toHaveText('Экспорт 4 готов к скачиванию.');
 await q.getByRole('button',{name:'Закрыть уведомление 1',exact:true}).click();await expect(group.locator('[data-ds-toast-body]').last()).toContainText('всех подразделений');
 await page.mouse.move(0,0);await q.getByRole('button',{name:'Добавить уведомление'}).focus();await page.waitForTimeout(250);
 await page.locator('#preview').screenshot({path:`.tmp/toast-stack-queue-${width}-${theme}-${appearance}.png`});
 const portal=exampleDemo(f,'Portal за пределами обрезающего контейнера');await portal.getByRole('button',{name:'Показать через portal'}).click();
 const toast=portal.locator('[data-ds-toast]');await expect(toast).toBeVisible();
 expect(await toast.evaluate(e=>!!e.closest('[data-ds-toast-stack]').parentElement.classList.contains('demo'))).toBe(true);
 await toast.getByRole('button',{name:'Закрыть',exact:true}).focus();await page.keyboard.press('Enter');await expect(portal.getByRole('button',{name:'Показать через portal'})).toBeFocused();
 const modal=exampleDemo(f,'Уведомление поверх диалога');await modal.getByRole('button',{name:'Открыть диалог'}).click();const dialog=f.getByRole('dialog');
 await dialog.getByRole('button',{name:'Сохранить в диалоге'}).click();await expect(dialog.getByRole('region',{name:'Уведомления'})).toBeVisible();
 const close=dialog.locator('[data-ds-toast]').getByRole('button',{name:'Закрыть',exact:true});await close.focus();await page.keyboard.press('Tab');await expect(dialog.getByRole('button',{name:'Закрыть',exact:true}).first()).toBeFocused();
 await close.focus();await page.keyboard.press('Enter');await expect(dialog.getByRole('button',{name:'Сохранить в диалоге'})).toBeFocused();await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
 await expect.poll(()=>page.locator('#preview').evaluate(e=>Math.abs(e.clientHeight-e.contentDocument.body.getBoundingClientRect().height))).toBeLessThanOrEqual(3);
 expect(await f.locator('html').evaluate(e=>e.scrollWidth>e.clientWidth)).toBe(false);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }expect(errors).toEqual([]);}finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
