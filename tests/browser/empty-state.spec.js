import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';

test('empty state keeps semantic headings, optional visuals and narrow actions across modes',async({page})=>{
 const served=await serveRoot(fileURLToPath(new URL('../../site',import.meta.url))),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   await page.goto(`${served.url}/index.html?card=DsEmptyState&theme=${theme}&appearance=${appearance}&density=${density}`);
   const f=page.frameLocator('#preview');
   await expect(page.locator('main h2')).toHaveText(['Живые примеры','Правила применения','Пример кода','Параметры','Токены']);
   await expect(f.locator('[data-ds-empty-state] h4')).toHaveCount(5);
   await expect(f.locator('[data-ds-empty-state][role="status"]')).toHaveCount(1);
   const two=f.getByRole('region',{name:'Без иконки · два действия'});
   await expect(two.locator('.material-symbols-outlined')).toHaveCount(0);
   const button=two.getByRole('button',{name:'Выбрать последние 7 дней'});
   await button.focus();await page.keyboard.press('Enter');
   await expect(two.getByRole('status')).toContainText('Период изменён');
   await expect(two.getByRole('button',{name:'Вернуть исходный период'})).toBeFocused();
   const link=two.getByRole('link',{name:'О хранении маршрутов'});
   await link.focus();await page.keyboard.press('Enter');
   await expect(two.locator('#retention-help')).toBeFocused();
   await two.getByRole('button',{name:'Закрыть пояснение'}).focus();await page.keyboard.press('Space');
   await expect(link).toBeFocused();
   const first=f.getByRole('region',{name:'Первый объект',exact:true});
   expect(await first.getByRole('button',{name:'Добавить объект'}).evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(await f.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor));
   // Long unbroken content and two actions must fit a narrow host independently of page width.
   await f.locator('body').evaluate(()=>{
    const host=document.createElement('div');host.id='long-content';host.style.width='240px';document.body.appendChild(host);
    const S=window.AuroraWebDesignSystem_96e210,h=React.createElement;
    ReactDOM.createRoot(host).render(h(S.DsEmptyState,{icon:null,headingLevel:'h5',title:'ОченьДлинноеНазвание'.repeat(10),
     description:'https://example.com/'+ 'longsegment'.repeat(30),
     action:h(S.DsButton,null,'Выбрать другой период'),secondary:h(S.DsButton,{tone:'secondary'},'Сбросить все фильтры')}));
   });
   await expect(f.locator('#long-content h5')).toBeVisible();
   expect(await f.locator('#long-content').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   const actions=await f.locator('#long-content button').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().top));
   expect(actions[1]).toBeGreaterThan(actions[0]);
   await expect.poll(()=>page.locator('#preview').evaluate(el=>Math.abs(el.getBoundingClientRect().height-el.contentDocument.body.getBoundingClientRect().height))).toBeLessThanOrEqual(3);
   expect(await page.locator('#preview').evaluate(el=>el.contentDocument.documentElement.scrollWidth<=el.clientWidth)).toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.screenshot({path:`.tmp/empty-state-improved-${width}-${theme}-${appearance}.png`,fullPage:true});
  }
  expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});

test('retry preserves focus while busy, prevents duplicates and reveals loaded content',async({page})=>{
 const served=await serveRoot(fileURLToPath(new URL('../../site',import.meta.url)));
 try{
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
  await page.setViewportSize({width,height:900});
  await page.goto(`${served.url}/index.html?card=DsEmptyState&theme=${theme}&appearance=${appearance}&density=${density}`);
  const region=page.frameLocator('#preview').getByRole('region',{name:'Ошибка загрузки · компактный вариант'});
  const retry=region.getByRole('button',{name:'Повторить запрос'});
  await retry.focus();await page.keyboard.press('Enter');
  await expect(retry).toHaveAttribute('aria-busy','true',{timeout:1500});
  await expect(retry).toBeFocused();
  await expect(region.getByRole('status')).toContainText('Повторный запрос выполняется');
  await page.keyboard.press('Enter');
  await expect(region.getByText('Попыток: 1',{exact:true})).toBeVisible();
  await expect(region.getByText('Соединение восстановлено. Объекты загружены.',{exact:true})).toBeVisible();
  await expect(region.locator('.result')).toBeFocused();
  await region.getByRole('button',{name:'Снова показать пустое состояние'}).focus();await page.keyboard.press('Space');
  await expect(retry).toBeFocused();await expect(retry).not.toHaveAttribute('aria-busy','true');
  }
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
