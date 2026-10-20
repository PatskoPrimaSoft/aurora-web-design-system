import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {exampleDemo} from './helpers/live-example.js';
import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';

test('DsIconButton separates indicators and provides live object actions',async({page})=>{
  const served=await serveRoot(siteRoot());
  try{
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
      await page.setViewportSize({width,height:900});
      await page.goto(served.url+`/index.html?card=DsIconButton&theme=${theme}&appearance=${appearance}&density=${density}`);
      const f=page.frameLocator('#preview');
      const filters=f.getByRole('button',{name:'Настроить фильтры объектов'});
      await expect(filters).not.toHaveAttribute('aria-pressed');
      await expect(filters).toHaveAccessibleDescription('Применён фильтр: только активные объекты.');
      await filters.click();await f.getByRole('menuitem',{name:'Все объекты',exact:true}).click();
      await expect(filters).toHaveAccessibleDescription(/^Фильтры не применены\./);
      const object=exampleDemo(f,'Действия объекта');
      const edit=object.getByRole('button',{name:'Изменить название объекта'});
      await edit.focus();await page.keyboard.press('Enter');
      const field=object.getByRole('textbox',{name:'Название объекта'});
      await expect(field).toBeFocused();await field.fill('');
      await object.getByRole('button',{name:'Сохранить',exact:true}).click();
      await expect(object.getByText('Введите название объекта.',{exact:true})).toBeVisible();
      await field.fill('Scania R450');await page.keyboard.press('Enter');
      await expect(edit).toBeFocused();await expect(object.getByText('Scania R450',{exact:true})).toBeVisible();
      await edit.click();await field.fill('Отменённое имя');await object.getByRole('button',{name:'Отмена',exact:true}).click();
      await expect(object.getByText('Scania R450',{exact:true})).toBeVisible();
      const refresh=object.getByRole('button',{name:'Обновить данные объекта'});
      await refresh.click();await expect(refresh).toHaveAttribute('aria-busy','true');
      await expect(object.getByRole('status')).toHaveText('Данные объекта обновлены.');
      const more=object.getByRole('button',{name:'Другие действия с объектом'});
      await more.focus();await page.keyboard.press('ArrowDown');
      await expect(object.getByRole('menuitem',{name:'Добавить в избранное'})).toBeFocused();
      await page.keyboard.press('Enter');await expect(object.getByText('В избранном',{exact:true})).toBeVisible();
      await more.click();await object.getByRole('menuitem',{name:'Сбросить пример'}).click();
      await expect(object.getByText('Volvo FH16',{exact:true})).toBeVisible();
      await expect.poll(()=>page.locator('#preview').evaluate(el=>el.contentDocument.documentElement.scrollWidth<=el.clientWidth)).toBe(true);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});

test('DsIconButton tooltip and loading work in every mode and size',async({page})=>{
  const served=await serveRoot(siteRoot()),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
      await page.setViewportSize({width,height:900});
      await page.goto(served.url+`/index.html?card=DsIconButton&theme=${theme}&appearance=${appearance}&density=${density}`);
      const frame=page.frameLocator('#preview');
      const loading=exampleDemo(frame,'Загрузка');
      await expect(loading).toBeVisible();
      for(let i=0;i<3;i++){
        const buttons=loading.getByRole('button'),button=buttons.nth(i);
        await expect(button).not.toHaveAttribute('aria-label');
        await expect(button).toHaveAccessibleName('Обновить данные');
        await button.focus();
        await expect(frame.getByRole('tooltip')).toHaveText('Обновить данные');
        await expect(button).not.toHaveAttribute('title');
        await page.keyboard.press('Escape');
        await expect(frame.getByRole('tooltip')).toHaveCount(0);
        await button.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
        const read=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {w:r.width,h:r.height,bg:s.backgroundColor,fg:s.color};};
        const before=await button.evaluate(read);
        await page.keyboard.press(i%2?'Space':'Enter');
        await expect(button).toBeFocused();
        await expect(button).toHaveJSProperty('disabled',false);
        await expect(button).toHaveAttribute('aria-busy','true');
        await expect(button).toHaveAttribute('aria-disabled','true');
        await expect(button).toHaveAccessibleName('Обновить данные');
        expect(await button.evaluate(read)).toEqual(before);
        await expect(frame.getByRole('tooltip')).toHaveCount(0);
        const measurements=await button.evaluate(el=>{
          const b=el.getBoundingClientRect(),spinner=el.querySelector('[data-ds-icon-button-spinner]').getBoundingClientRect();
          const icon=el.querySelector('[data-ds-icon-button-content]').getBoundingClientRect();
          return {dx:Math.abs(b.x+b.width/2-spinner.x-spinner.width/2),dy:Math.abs(b.y+b.height/2-spinner.y-spinner.height/2),size:spinner.width,icon:icon.width};
        });
        expect(measurements.dx).toBeLessThanOrEqual(1);expect(measurements.dy).toBeLessThanOrEqual(1);
        expect(measurements.size).toEqual(measurements.icon);
        await expect(loading.getByRole('status')).toHaveText('Данные обновлены.');
        await expect(button).not.toHaveAttribute('aria-busy','true');
      }
      const toggle=frame.getByRole('button',{name:'Только активные объекты'});
      await expect(toggle).not.toHaveAttribute('aria-label');
      await expect(toggle).toHaveAccessibleName('Только активные объекты');
      await toggle.hover();await expect(frame.getByRole('tooltip')).toHaveText('Только активные объекты');
      await frame.getByRole('tooltip').hover();await expect(frame.getByRole('tooltip')).toBeVisible();
      await page.keyboard.press('Escape');await expect(frame.getByRole('tooltip')).toHaveCount(0);
      await toggle.focus();await page.keyboard.press('Space');await expect(toggle).toHaveAttribute('aria-pressed','true');
      await expect.poll(()=>page.locator('#preview').evaluate(el=>el.contentDocument.documentElement.scrollWidth<=el.clientWidth)).toBe(true);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
