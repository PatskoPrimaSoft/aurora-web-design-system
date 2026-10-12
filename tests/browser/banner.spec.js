import {exampleDemo} from './helpers/live-example.js';
import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';

test('DsBanner keeps explicit announcements, standard dismissal and narrow layout in every mode',async({page})=>{
 const served=await serveRoot(fileURLToPath(new URL('../../site',import.meta.url))),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   await page.goto(served.url+`/index.html?card=DsBanner&theme=${theme}&appearance=${appearance}&density=${density}`);
   await expect(page.locator('main h2')).toHaveText(['Живые примеры','Правила применения','Пример кода','Параметры','Токены']);
   const f=page.frameLocator('#preview'),tones=exampleDemo(f,'Тоны сообщения');
   await expect(tones.locator('[data-ds-banner]')).toHaveCount(5);
   await expect(tones.getByRole('alert')).toHaveCount(0);await expect(tones.getByRole('status')).toHaveCount(0);
   await expect(tones.getByRole('heading',{level:4})).toHaveCount(5);
   const expected=await tones.evaluate(el=>getComputedStyle(el).color);
   await expect(tones.locator('[data-ds-banner-body]').first()).toHaveCSS('color',expected);
   await expect(exampleDemo(f,'Компактное сообщение').getByRole('heading',{level:4})).toHaveCount(0);
   const action=exampleDemo(f,'Исправление проблемы');
   await expect(action.getByRole('status')).toHaveAttribute('aria-atomic','true');
   await action.getByRole('button',{name:'Выбрать последние 7 дней',exact:true}).click();
   await expect(action.getByRole('status')).toContainText('Доступны данные');
   const closing=exampleDemo(f,'Закрытие сообщения'),close=closing.getByRole('button',{name:'Скрыть сообщение о плановых работах',exact:true}),restore=closing.getByRole('button',{name:'Показать сообщение снова',exact:true});
   await close.hover();await expect(f.getByRole('tooltip')).toHaveText('Скрыть сообщение о плановых работах');
   const bg=await close.evaluate(el=>getComputedStyle(el).backgroundColor);
   await page.mouse.down();await expect.poll(()=>close.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(bg);await page.mouse.up();
   await expect(close).toHaveCount(0);await expect(restore).toBeFocused();await expect(f.getByRole('tooltip')).toHaveCount(0);
   await page.mouse.move(0,0);
   await page.keyboard.press('Enter');await close.focus();await expect(f.getByRole('tooltip')).toBeVisible();
   await page.keyboard.press('Escape');await expect(f.getByRole('tooltip')).toHaveCount(0);await expect(close).toBeVisible();
   await page.keyboard.press('Space');await expect(close).toHaveCount(0);await expect(restore).toBeFocused();
   await f.locator('body').evaluate(()=>{
    const fixture=document.createElement('div');fixture.id='narrow-fixture';fixture.style.width='240px';fixture.style.marginTop='20px';document.body.append(fixture);
    const h=window.React.createElement,S=window.AuroraWebDesignSystem_96e210;
    window.ReactDOM.createRoot(fixture).render(h(S.DsBanner,{tone:'danger',announcement:'assertive',title:'ОченьДлинноеНазвание'.repeat(8),headingLevel:'h5',onClose:()=>{},actions:[h(S.DsButton,{key:'retry',size:'sm',tone:'secondary'},'Повторить'),h(S.DsButton,{key:'cancel',size:'sm',tone:'secondary'},'Отмена')]},'https://example.com/'+ 'longpath'.repeat(30)));
   });
   const fixture=f.locator('#narrow-fixture');await expect(fixture.getByRole('alert')).toBeVisible();
   await expect(fixture.getByRole('heading',{level:5})).toHaveCount(1);
   const layout=await fixture.evaluate(el=>{
    const banner=el.querySelector('[data-ds-banner]'),icon=banner.firstElementChild,buttons=el.querySelectorAll('[data-ds-banner-actions] button');
    return {overflow:el.scrollWidth>el.clientWidth,iconWidth:icon.getBoundingClientRect().width,expectedIcon:parseFloat(getComputedStyle(icon).fontSize),wrapped:buttons[1].getBoundingClientRect().top>buttons[0].getBoundingClientRect().top};
   });
   expect(layout.overflow).toBe(false);expect(layout.iconWidth).toBe(layout.expectedIcon);expect(layout.wrapped).toBe(true);
   await expect.poll(()=>page.locator('#preview').evaluate(iframe=>Math.abs(iframe.getBoundingClientRect().height-iframe.contentDocument.body.getBoundingClientRect().height))).toBeLessThanOrEqual(3);
   expect(await f.locator('body').evaluate(el=>el.scrollWidth>innerWidth+1)).toBe(false);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  }
  expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});

test('DsBanner examples retry with loading, keep navigation as a link and omit optional titles',async({page})=>{
 const served=await serveRoot(fileURLToPath(new URL('../../site',import.meta.url)));
 try{
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
  await page.setViewportSize({width,height:900});await page.goto(served.url+`/index.html?card=DsBanner&theme=${theme}&appearance=${appearance}&density=${density}`);
  const f=page.frameLocator('#preview'),retry=exampleDemo(f,'Повторный запрос');
  await expect(retry).toBeVisible();
  const button=retry.getByRole('button',{name:'Повторить запрос',exact:true});
  await button.focus();await page.keyboard.press('Enter');await expect(button).toHaveAttribute('aria-busy','true');
  await expect(button).toBeFocused();await page.keyboard.press('Enter');
  await expect(retry).toContainText('Попыток: 1');await expect(retry.getByRole('status')).toContainText('Соединение восстановлено');
  await expect(retry.getByRole('button',{name:'Снова показать ошибку',exact:true})).toBeFocused();
  await retry.getByRole('button',{name:'Снова показать ошибку',exact:true}).click();
  await expect(retry.getByRole('status')).toContainText('Не удалось загрузить отчёт');
  const long=exampleDemo(f,'Сообщение с двумя действиями'),link=long.getByRole('link',{name:'О сроке хранения данных',exact:true});
  await link.focus();await page.keyboard.press('Enter');
  await expect(long.locator('#storage-help')).toBeVisible();await expect(long.locator('#storage-help')).toBeFocused();
  await long.getByRole('button',{name:'Закрыть пояснение',exact:true}).click();await expect(link).toBeFocused();await expect(long.locator('#storage-help')).toBeHidden();
  await long.getByRole('button',{name:'Выбрать 30 дней',exact:true}).click();await expect(long).toContainText('Период соответствует сроку хранения');
  const noTitle=exampleDemo(f,'Без заголовка');await expect(noTitle.locator('[data-ds-banner]')).toContainText('Автоматическое обновление отключено');await expect(noTitle.locator('[data-ds-banner] h1,[data-ds-banner] h2,[data-ds-banner] h3,[data-ds-banner] h4,[data-ds-banner] h5,[data-ds-banner] h6')).toHaveCount(0);
  await page.locator('#preview').screenshot({path:`.tmp/banner-final-${width}-${theme}-${appearance}.png`});
  }
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
