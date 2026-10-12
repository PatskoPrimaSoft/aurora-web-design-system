import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../site',import.meta.url));

test('DsMenu supports selection, names, keyboard search and responsive placement',async({page})=>{
 const served=await serveRoot(root),errors=[];page.on('pageerror',e=>errors.push(e.stack));
 try{
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   await page.goto(served.url+`/index.html?card=DsMenu&theme=${theme}&appearance=${appearance}&density=${density}`);
   const f=page.frameLocator('#preview');
   const period=f.getByRole('button',{name:'Период',exact:true});await period.focus();await page.keyboard.press('ArrowDown');
   await expect(f.getByRole('menu',{name:'Период',exact:true})).toBeVisible();
   await expect(f.getByRole('menuitemradio',{name:'Сегодня'})).toHaveAttribute('aria-checked','true');
   await f.getByRole('menuitemradio',{name:'Сегодня'}).dispatchEvent('keydown',{key:'з',bubbles:true});await f.getByRole('menuitemradio',{name:'За неделю'}).dispatchEvent('keydown',{key:'а',bubbles:true});
   await expect(f.getByRole('menuitemradio',{name:'За неделю'})).toBeFocused();
   await page.keyboard.press('Enter');await expect(period).toBeFocused();
   await expect(f.getByRole('status',{name:'Выбранный период'})).toContainText('За неделю');
   const layers=f.getByRole('button',{name:'Слои',exact:true});await layers.evaluate(el=>el.scrollIntoView({block:'center'}));await layers.click();
   const tracks=f.getByRole('menuitemcheckbox',{name:'Треки',exact:true});await tracks.click();
   await expect(tracks).toHaveAttribute('aria-checked','true');await expect(tracks).toBeFocused();
   await expect(f.getByRole('menu',{name:'Слои карты'})).toBeVisible();
   await expect(f.getByRole('status',{name:'Видимые слои'})).toContainText('Объекты, Треки');
   await expect(tracks).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)');
   await page.keyboard.press('Escape');await expect(layers).toBeFocused();
   const actions=f.getByRole('button',{name:'Действия с Volvo FH16'});await actions.evaluate(el=>el.scrollIntoView({block:'center'}));await actions.click();
   const slots=f.locator('[data-ds-menu-icon-slot]');await expect(slots).toHaveCount(4);
   const xs=await slots.evaluateAll(els=>els.map(el=>el.getBoundingClientRect().left));expect(new Set(xs).size).toBe(1);
   const bounds=await f.getByRole('menu').evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,view:innerWidth,top:r.top,bottom:r.bottom,height:innerHeight,popover:el.matches(':popover-open')};});
   expect(bounds.popover).toBe(true);expect(bounds.left).toBeGreaterThanOrEqual(8);expect(bounds.right).toBeLessThanOrEqual(bounds.view-8);
   expect(bounds.top).toBeGreaterThanOrEqual(8);expect(bounds.bottom).toBeLessThanOrEqual(bounds.height-8);
   await page.keyboard.press('Escape');
   await expect.poll(()=>page.locator('#preview').evaluate(el=>el.contentDocument.documentElement.scrollWidth<=el.clientWidth)).toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});

test('DsMenu escapes clipping, flips up, follows scrolling and stays in dialog focus scope',async({page})=>{
 const served=await serveRoot(root);
 try{
  await page.setViewportSize({width:390,height:600});await page.goto(served.url+'/components/DsMenu/preview.html');
  await page.waitForFunction(()=>Object.keys(window).some(key=>key.startsWith('AuroraWebDesignSystem_')));
  await page.addStyleTag({content:'*,*::before,*::after{box-sizing:border-box}'});
  await page.evaluate(()=>{
   const S=window[Object.keys(window).find(key=>key.startsWith('AuroraWebDesignSystem_'))],h=React.createElement;
   document.body.innerHTML='<div id="test-root"></div>';
   const items=[{id:'a',label:'Первое действие'},{id:'b',label:'Второе действие'}];
   function App(){const [dialog,setDialog]=React.useState(false);return h('div',null,
    h('div',{style:{position:'fixed',bottom:12,right:0,width:80,height:40,overflow:'hidden',transform:'translateZ(0)'}},h(S.DsMenu,{width:600,trigger:h(S.DsButton,null,'Край'),items})),
    h(S.DsButton,{onClick:()=>setDialog(true)},'Диалог'),
    dialog?h(S.DsDialog,{title:'Проверка меню',onClose:()=>setDialog(false)},
     h(S.DsMenu,{trigger:h(S.DsButton,null,'Внутри диалога'),items}),h(S.DsButton,null,'Следующая кнопка')):null);}
   ReactDOM.createRoot(document.getElementById('test-root')).render(h(App));
  });
  const edge=page.getByRole('button',{name:'Край',exact:true});await edge.click();
  const menu=page.getByRole('menu');await expect(menu).toBeVisible();
  const rect=await menu.boundingBox(),button=await edge.boundingBox();
  expect(rect.y+rect.height).toBeLessThan(button.y);expect(rect.x).toBeGreaterThanOrEqual(8);expect(rect.x+rect.width).toBeLessThanOrEqual(382);
  await page.getByRole('menuitem',{name:'Второе действие'}).click();await expect(edge).toBeFocused();
  await edge.evaluate(el=>{const clip=el.closest('div[style]');clip.style.position='absolute';clip.style.top='180px';clip.style.bottom='auto';document.body.style.minHeight='1400px'});
  await edge.click();const before=await menu.boundingBox();
  await page.evaluate(()=>window.scrollTo(0,50));
  await expect.poll(async()=>Math.round((await menu.boundingBox()).y-before.y)).toBe(-50);
  await page.keyboard.press('Escape');await page.evaluate(()=>window.scrollTo(0,0));
  await page.getByRole('button',{name:'Диалог',exact:true}).click();
  const dialog=page.getByRole('dialog'),trigger=dialog.getByRole('button',{name:'Внутри диалога'});
  await trigger.focus();await page.keyboard.press('ArrowDown');await expect(dialog.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Escape');await expect(dialog).toBeVisible();await expect(trigger).toBeFocused();
  await trigger.click();await page.keyboard.press('Tab');await expect(dialog.getByRole('menu')).toHaveCount(0);
  await expect(dialog.getByRole('button',{name:'Следующая кнопка'})).toBeFocused();
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
