import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
test('filter dropdown supports grouped and flat draft selection in every mode',async({page})=>{
 const served=await serveRoot(fileURLToPath(new URL('../../site',import.meta.url))),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
 await page.setViewportSize({width:390,height:900});await page.goto(`${served.url}/index.html?card=DsFilterMenu&theme=${theme}&appearance=${appearance}&density=${density}`);
 const f=page.frameLocator('#preview');
 for(const [regionName,label,optionName,initial,count] of [['Выбор нескольких вариантов','Состояние объектов','Нет связи',2,0],['Выбор с группами','Состояние по категориям','Тревога',1,3]]){
 const region=f.getByRole('region',{name:regionName}),trigger=region.locator('[data-ds-filter-trigger]');
 const feedback=async()=>{
   const paint=()=>trigger.evaluate(el=>{const css=getComputedStyle(el);return css.backgroundColor+' '+css.backgroundImage;});
   await page.mouse.move(0,0);const idle=await paint();
   await trigger.getByText('expand_more',{exact:true}).hover();await expect.poll(paint).not.toBe(idle);
   const hover=await paint();await page.mouse.down();await expect.poll(paint).not.toBe(hover);await page.mouse.move(0,0);await page.mouse.up();
 };
 await feedback();
 const open=async()=>{await trigger.evaluate(el=>el.scrollIntoView({block:'start'}));await trigger.click();};
 await open();const dialog=region.getByRole('dialog');await expect(dialog.getByRole('group')).toHaveCount(count);
 for(const name of ['Очистить','Применить']){
   const action=dialog.getByRole('button',{name,exact:true}),paint=()=>action.evaluate(el=>{const css=getComputedStyle(el);return css.backgroundColor+' '+css.backgroundImage;});
   await page.mouse.move(0,0);const idle=await paint();await action.hover();await expect.poll(paint).not.toBe(idle);const hovered=await paint();await page.mouse.down();await expect.poll(paint).not.toBe(hovered);await page.mouse.move(0,0);await page.mouse.up();
 }
 const option=dialog.getByRole('checkbox',{name:optionName,exact:true});await option.focus();await page.keyboard.press('Space');await expect(option).toBeChecked();
 await expect(region.getByRole('status')).toHaveText('Применено состояний: '+initial+'.');
 const row=option.locator('..');const selected=await row.evaluate(el=>getComputedStyle(el).backgroundColor);await row.hover();await expect.poll(()=>row.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(selected);
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
 await open();await expect(option).not.toBeChecked();await dialog.getByText(optionName,{exact:true}).click();await expect(option).toBeChecked();await dialog.getByRole('button',{name:'Применить',exact:true}).click();
 await expect(region.getByRole('status')).toHaveText('Применено состояний: '+(initial+1)+'.');await expect(trigger).toBeFocused();
 await expect(trigger).toContainText('Движение +'+initial);await expect(trigger).toHaveAttribute('aria-label',new RegExp(optionName));
 await region.getByRole('button',{name:'Очистить: '+label,exact:true}).click();await expect(region.getByRole('status')).toHaveText('Применено состояний: 0.');await expect(trigger).toBeFocused();await expect(dialog).toHaveCount(0);await expect(region.locator('[data-ds-filter-clear]')).toHaveCount(0);
 await expect(trigger).toContainText('filter_alt');
 const radius=await trigger.evaluate(el=>({actual:getComputedStyle(el).borderTopRightRadius,expected:getComputedStyle(el).borderTopLeftRadius}));expect(radius.actual).toBe(radius.expected);expect(parseFloat(radius.actual)).toBeGreaterThan(0);
 await feedback();
 expect(await page.locator('#preview').evaluate(el=>el.contentDocument.documentElement.scrollWidth<=el.clientWidth)).toBe(true);
 }
 const text=f.getByRole('region',{name:'Текстовый фильтр'}),textTrigger=text.locator('[data-ds-filter-trigger]');
 await textTrigger.evaluate(el=>el.scrollIntoView({block:'start'}));await textTrigger.click();const dialog=text.getByRole('dialog');
 const long='Грузовик с очень длинным названием '.repeat(5);await dialog.getByRole('textbox').fill(long);await expect(textTrigger).toHaveAccessibleName('Название объекта');
 await dialog.getByRole('button',{name:'Применить',exact:true}).click();await expect(textTrigger).toHaveAccessibleName('Название объекта: '+long.trim());
 expect(await page.locator('#preview').evaluate(el=>el.contentDocument.documentElement.scrollWidth<=el.clientWidth)).toBe(true);
 await text.getByRole('button',{name:'Очистить: Название объекта',exact:true}).focus();await page.keyboard.press('Space');await expect(textTrigger).toBeFocused();await expect(textTrigger).toHaveAccessibleName('Название объекта');await expect(text.getByRole('dialog')).toHaveCount(0);
 const range=f.getByRole('region',{name:'Числовой диапазон'});await expect(range.locator('[data-ds-filter-trigger]')).toContainText('От 60');await range.getByRole('button',{name:'Очистить: Скорость, км/ч',exact:true}).click();await expect(range.locator('[data-ds-filter-trigger]')).toHaveAccessibleName('Скорость, км/ч');
 }
 await page.setViewportSize({width:1280,height:900});const f=page.frameLocator('#preview'),trigger=f.getByRole('region',{name:'Выбор с группами'}).locator('[data-ds-filter-trigger]');await trigger.evaluate(el=>el.scrollIntoView({block:'start'}));await trigger.click();await page.screenshot({path:'.tmp/filter-grouped.png'});
 expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});

test('filter editor searches, validates, handles keyboard and escapes clipped containers',async({page})=>{
 const served=await serveRoot(fileURLToPath(new URL('../../site',import.meta.url)));
 try{
 for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
 await page.setViewportSize({width:390,height:900});await page.goto(`${served.url}/index.html?card=DsFilterMenu&theme=${theme}&appearance=${appearance}&density=${density}`);
 const f=page.frameLocator('#preview'),group=f.getByRole('region',{name:'Выбор с группами'}),trigger=group.locator('[data-ds-filter-trigger]');
 await trigger.evaluate(el=>el.scrollIntoView({block:'start'}));await trigger.click();const panel=group.getByRole('dialog'),search=panel.getByRole('searchbox',{name:'Поиск вариантов'});
 await expect(search).toBeFocused();await search.fill('трев');await expect(panel.getByRole('group')).toHaveCount(1);await expect(panel.getByRole('checkbox')).toHaveCount(1);
 await page.keyboard.press('ArrowDown');await expect(panel.getByRole('checkbox',{name:'Тревога',exact:true})).toBeFocused();await page.keyboard.press('Space');await expect(panel.getByRole('checkbox',{name:'Тревога',exact:true})).toBeChecked();
 await search.fill('missing');await expect(panel.getByRole('status')).toHaveText('Ничего не найдено');await search.fill('');await search.focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('End');await expect(panel.getByRole('checkbox',{name:'Тревога',exact:true})).toBeFocused();
 await expect(panel.getByRole('checkbox',{name:'Некорректные данные',exact:true})).toBeDisabled();await page.keyboard.press('Home');await expect(panel.getByRole('checkbox',{name:'Движение',exact:true})).toBeFocused();await page.keyboard.press('Tab');await expect(panel.getByRole('button',{name:'Очистить',exact:true})).toBeFocused();
 await page.keyboard.press('Tab');await expect(panel.getByRole('button',{name:'Применить',exact:true})).toBeFocused();await page.keyboard.press('Tab');await expect(group.getByRole('dialog')).toHaveCount(0);await expect(group.getByRole('status')).toHaveText('Применено состояний: 1.');
 const range=f.getByRole('region',{name:'Числовой диапазон'});await range.locator('[data-ds-filter-trigger]').evaluate(el=>el.scrollIntoView({block:'start'}));await range.locator('[data-ds-filter-trigger]').click();const editor=range.getByRole('dialog'),from=editor.getByRole('spinbutton',{name:'От',exact:true}),to=editor.getByRole('spinbutton',{name:'До',exact:true});
 await from.fill('90');await to.fill('10');await editor.getByRole('button',{name:'Применить',exact:true}).click();await expect(to).toBeFocused();await expect(to).toHaveAttribute('aria-invalid','true');await expect(editor).toContainText('Значение «До» должно быть не меньше «От».');await expect(editor.getByRole('button',{name:'Применить',exact:true})).toBeEnabled();
 await to.fill('100');await expect(to).not.toHaveAttribute('aria-invalid','true');await page.keyboard.press('Enter');await expect(range.getByRole('dialog')).toHaveCount(0);await expect(range.locator('[data-ds-filter-trigger]')).toContainText('90–100');
 const states=f.getByRole('region',{name:'Состояния списка'});await states.getByRole('button',{name:'Загрузка вариантов',exact:true}).click();await states.locator('[data-ds-filter-trigger]').click();await expect(states.getByRole('status')).toContainText('Загрузка вариантов');await expect(states.getByRole('checkbox')).toHaveCount(0);await expect(states.locator('[data-ds-filter-trigger]')).toContainText('Движение');await page.keyboard.press('Escape');
 await states.getByRole('button',{name:'Загрузка вариантов',exact:true}).click();await states.getByRole('button',{name:'Нет вариантов',exact:true}).click();await states.locator('[data-ds-filter-trigger]').click();await expect(states.getByRole('status')).toHaveText('Нет вариантов');await page.keyboard.press('Escape');await states.getByRole('button',{name:'Недоступно',exact:true}).click();await expect(states.locator('[data-ds-filter-trigger]')).toBeDisabled();await expect(states.locator('[data-ds-filter-clear]')).toBeDisabled();
 const sort=f.getByRole('region',{name:'Сортировка'});await sort.locator('[data-ds-filter-trigger]').click();const sorting=sort.getByRole('dialog');await sorting.getByRole('radio',{name:'Последнее сообщение',exact:true}).focus();await page.keyboard.press('Space');await sorting.getByRole('button',{name:'Сначала новые',exact:true}).click();await expect(sorting.getByRole('button',{name:'Сначала новые',exact:true})).toHaveAttribute('aria-pressed','true');await sorting.getByRole('button',{name:'Применить',exact:true}).click();await expect(sort.locator('[data-ds-filter-trigger]')).toContainText('Последнее сообщение · Сначала новые');
 await f.locator('body').evaluate(()=>{
  const host=document.createElement('div');host.id='clipped';host.style='position:fixed;right:0;bottom:0;width:160px;height:60px;overflow:hidden';document.body.append(host);
  window.ReactDOM.flushSync(()=>window.ReactDOM.createRoot(host).render(window.React.createElement(window.AuroraWebDesignSystem_96e210.DsFilterMenu,{label:'Clipped',type:'checkbox-list',width:800,options:['One','Two'],value:[],onApply:()=>{}})));
 });
 await page.locator('#preview').evaluate(el=>el.scrollIntoView({block:'end'}));const clipped=f.locator('#clipped');await clipped.locator('[data-ds-filter-trigger]').click();
 expect(await clipped.locator('[data-ds-filter-popup]').evaluate(el=>el.matches(':popover-open'))).toBe(true);
 const bounds=await clipped.evaluate(el=>{const popup=el.querySelector('[data-ds-filter-popup]').getBoundingClientRect(),button=el.querySelector('button').getBoundingClientRect();return {left:popup.left,right:popup.right,top:popup.top,bottom:popup.bottom,buttonTop:button.top,width:document.documentElement.clientWidth,height:window.innerHeight};});
 expect(bounds.left).toBeGreaterThanOrEqual(8);expect(bounds.right).toBeLessThanOrEqual(bounds.width-8);expect(bounds.bottom).toBeLessThanOrEqual(bounds.buttonTop);expect(bounds.top).toBeGreaterThanOrEqual(8);
 await page.keyboard.press('Escape');await expect(clipped.getByRole('dialog')).toHaveCount(0);
 await f.locator('body').evaluate(()=>{
  const host=document.createElement('div');host.id='nested';document.body.append(host);window.dialogCloses=0;
  const h=window.React.createElement,S=window.AuroraWebDesignSystem_96e210;
  window.ReactDOM.flushSync(()=>window.ReactDOM.createRoot(host).render(h(S.DsDialog,{title:'Nested',onClose:()=>window.dialogCloses++},h(S.DsFilterMenu,{label:'Nested filter',type:'checkbox-list',options:['One','Two'],onApply:()=>{}}))));
 });
 const nested=f.locator('#nested');await nested.locator('[data-ds-filter-trigger]').focus();await page.keyboard.press('Enter');await expect(nested.getByRole('dialog')).toHaveCount(2);await page.keyboard.press('Escape');await expect(nested.getByRole('dialog')).toHaveCount(1);expect(await f.locator('body').evaluate(()=>window.dialogCloses)).toBe(0);
 await nested.locator('[data-ds-filter-trigger]').focus();await page.keyboard.press('Enter');await nested.getByRole('checkbox',{name:'One',exact:true}).focus();await page.keyboard.press('Tab');await expect(nested.getByRole('button',{name:'Очистить',exact:true})).toBeFocused();await page.keyboard.press('Escape');await page.keyboard.press('Escape');expect(await f.locator('body').evaluate(()=>window.dialogCloses)).toBe(1);
 }
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
