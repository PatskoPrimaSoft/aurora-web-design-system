import {exampleDemo} from './helpers/live-example.js';
import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';

test('DsStepper exposes step states, completion and keyboard/pointer feedback in every mode',async({page})=>{
 const served=await serveRoot(fileURLToPath(new URL('../../site',import.meta.url))),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   await page.goto(served.url+`/index.html?card=DsStepper&theme=${theme}&appearance=${appearance}&density=${density}`);
   const f=page.frameLocator('#preview'),flow=exampleDemo(f,'Прохождение задачи');
   const list=flow.getByRole('list',{name:'Импорт объектов'});
   const file=list.getByRole('button',{name:/Файл.*Шаг 1 из 3/});
   await file.hover();await expect(file).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)');
   const hovered=await file.evaluate(el=>getComputedStyle(el).backgroundColor);
   await page.mouse.down();await expect.poll(()=>file.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(hovered);await page.mouse.up();
   await expect(file).toHaveAttribute('aria-current','step');
   const next=flow.getByRole('button',{name:'Далее',exact:true});await next.focus();await page.keyboard.press('Shift+Tab');
   await expect(file).toBeFocused();await expect(file).toHaveCSS('outline-style','solid');
   await expect(file).not.toHaveCSS('outline-width','0px');
   await page.keyboard.press('Enter');await expect(file).toHaveAttribute('aria-current','step');
   await next.click();await next.click();await flow.getByRole('button',{name:'Импортировать',exact:true}).click();
   await expect(flow.getByRole('status')).toHaveText('Импорт завершён.');
   await expect(list.locator('[aria-current]')).toHaveCount(0);await expect(list.locator('.material-symbols-outlined')).toHaveCount(3);await expect(list.getByRole('button')).toHaveCount(0);
   await flow.getByRole('button',{name:'Начать заново'}).click();await expect(list.locator('[aria-current="step"]')).toHaveCount(1);
   const revisit=exampleDemo(f,'Возврат к завершённым шагам');
   await expect(revisit.getByRole('button',{name:/Файл.*завершён, недоступен/})).toBeDisabled();
   const fields=revisit.getByRole('button',{name:/Поля/});await fields.focus();await page.keyboard.press('Space');
   await expect(fields).toHaveAttribute('aria-current','step');await expect(fields.locator('[aria-hidden="true"]').first()).toHaveText('2');
   await revisit.getByRole('button',{name:'К проверке'}).click();await expect(fields.locator('.material-symbols-outlined')).toHaveText('check');
   await expect(exampleDemo(f,'Только для чтения').getByRole('button')).toHaveCount(0);
   expect(await f.locator('body').evaluate(el=>el.scrollWidth<=innerWidth)).toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});

test('DsStepper keeps the current step visible without scrolling the page or stealing focus',async({page})=>{
 const served=await serveRoot(fileURLToPath(new URL('../../site',import.meta.url)));
 try{
  await page.setViewportSize({width:390,height:700});
  await page.goto(served.url+'/design-system/components/DsStepper/preview.html');
  await page.evaluate(()=>{
   const S=window[Object.keys(window).find(k=>k.startsWith('AuroraWebDesignSystem_'))],h=React.createElement;
   document.body.innerHTML='<div id="scroll-fixture"></div>';
   const steps=['Подготовка','Загрузка файла','Сопоставление','Проверка данных','Подтверждение','Результат'].map(label=>({label}));
   function App(){const [active,setActive]=React.useState(4);return h('div',{style:{paddingTop:800}},
    h('div',{id:'narrow',style:{width:340}},h(S.DsStepper,{steps,active,ariaLabel:'Проверка прокрутки'})),
    h(S.DsButton,{onClick:()=>setActive(5)},'Последний шаг'),h(S.DsButton,{onClick:()=>setActive(0)},'Первый шаг'));}
   ReactDOM.createRoot(document.getElementById('scroll-fixture')).render(h(App));
  });
  const list=page.getByRole('list',{name:'Проверка прокрутки'});
  const visible=()=>list.evaluate(el=>{const r=el.getBoundingClientRect(),s=el.querySelector('[aria-current]').getBoundingClientRect();return s.left>=r.left&&s.right<=r.right;});
  await expect.poll(visible).toBe(true);
  await expect(list).not.toHaveCSS('scrollbar-width','none');
  await page.getByRole('button',{name:'Последний шаг'}).scrollIntoViewIfNeeded();
  const top=await page.evaluate(()=>scrollY);
  await page.getByRole('button',{name:'Последний шаг'}).click();
  await expect.poll(visible).toBe(true);await expect(page.getByRole('button',{name:'Последний шаг'})).toBeFocused();
  expect(await page.evaluate(()=>scrollY)).toBe(top);
  await page.locator('#narrow').evaluate(el=>el.style.width='220px');await expect.poll(visible).toBe(true);
  await page.getByRole('button',{name:'Первый шаг'}).click();await expect.poll(visible).toBe(true);
  await expect.poll(()=>list.evaluate(el=>el.scrollLeft)).toBe(0);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
