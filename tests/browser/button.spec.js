import {test,expect} from '@playwright/test';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
test('DsButton keeps loading geometry, focus and form safety in every mode',async({page})=>{
  await buildCatalogue({root,outDir:root+'/site'});
  const served=await serveRoot(root+'/site');
  try{
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
      await page.setViewportSize({width,height:900});
      await page.goto(served.url+'/index.html?card=DsButton&theme='+theme+'&appearance='+appearance+'&density='+density);
      const frame=page.frameLocator('#preview');
      await expect(frame.getByRole('button',{name:'Сохранить изменения',exact:true}).first()).toBeVisible();
      await frame.locator('#root').evaluate(el=>{
        const React=window.React,h=React.createElement,S=window[Object.keys(window).find(k=>k.startsWith('AuroraWebDesignSystem_'))];
        const host=document.createElement('div');el.append(host);
        const root=window.ReactDOM.createRoot(host);
        window.buttonFixture={clicks:0,submits:0};
        window.buttonFixture.render=(loading,size,icons,fullWidth=false)=>{
          window.ReactDOM.flushSync(()=>root.render(h('form',{style:{width:200,display:'flex'},onSubmit:e=>{e.preventDefault();window.buttonFixture.submits++;}},
            h(S.DsButton,{size,icon:icons?'save':undefined,iconRight:icons?'arrow_forward':undefined,fullWidth,loading,type:'submit',onClick:()=>window.buttonFixture.clicks++,'data-testid':'fixture-button'},'Сохранить все изменения выбранных объектов'))));
        };
      });
      const button=frame.getByTestId('fixture-button');
      for(const size of ['sm','md','lg'])for(const icons of [false,true]){
        await frame.locator('#root').evaluate((el,args)=>window.buttonFixture.render(false,...args),[size,icons]);
        await button.focus();
        const before=await button.evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {width:r.width,height:r.height,bg:s.backgroundColor,color:s.color};});
        expect(before.width).toBeLessThanOrEqual(200);
        const label=button.locator('[data-ds-button-label]');
        expect(await label.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
        await expect(button).toHaveAccessibleName('Сохранить все изменения выбранных объектов');
        await frame.locator('#root').evaluate((el,args)=>window.buttonFixture.render(true,...args),[size,icons]);
        await expect(button).toBeFocused();
        await expect(button).toHaveAttribute('aria-busy','true');
        await expect(button).toHaveJSProperty('disabled',false);
        const after=await button.evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {width:r.width,height:r.height,bg:s.backgroundColor,color:s.color};});
        expect(after).toEqual(before);
        const spinner=button.locator('[data-ds-button-spinner]');
        const centers=await spinner.evaluate(el=>{const a=el.getBoundingClientRect(),b=el.parentElement.getBoundingClientRect();return [Math.abs(a.x+a.width/2-b.x-b.width/2),Math.abs(a.y+a.height/2-b.y-b.height/2)];});
        expect(Math.max(...centers)).toBeLessThanOrEqual(1);
        if(icons){
          const widths=await button.locator('.material-symbols-outlined').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().width));
          expect(widths[0]).toBe(widths[1]);
          expect((await spinner.boundingBox()).width).toBe(widths[0]);
        }
        await page.keyboard.press('Enter');await page.keyboard.press('Space');
        await button.evaluate(el=>el.click());
        expect(await frame.locator('#root').evaluate(()=>[window.buttonFixture.clicks,window.buttonFixture.submits])).toEqual([0,0]);
      }
      await frame.locator('#root').evaluate(()=>window.buttonFixture.render(false,'md',true,true));
      expect((await button.boundingBox()).width).toBe(200);
      await button.focus();await page.keyboard.press('Enter');
      expect(await frame.locator('#root').evaluate(()=>[window.buttonFixture.clicks,window.buttonFixture.submits])).toEqual([1,1]);
      expect(await frame.locator('body').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    }
  }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});

test('DsButton action groups validate, cancel and delete independently',async({page})=>{
  await buildCatalogue({root,outDir:root+'/site'});
  const served=await serveRoot(root+'/site');
  try{
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
      await page.setViewportSize({width,height:900});
      await page.goto(served.url+'/index.html?card=DsButton&theme='+theme+'&appearance='+appearance+'&density='+density);
      const frame=page.frameLocator('#preview'),form=frame.getByRole('region',{name:'Сохранение и отмена',exact:true});
      const save=form.getByRole('button',{name:'Сохранить',exact:true}),input=form.getByRole('textbox',{name:'Название объекта'});
      await expect(save).toBeEnabled();await save.click();
      await expect(form.getByText('Введите название объекта.',{exact:true})).toBeVisible();await expect(input).toBeFocused();
      await input.fill('MAZ 5440');await input.press('Enter');
      await expect(form.getByRole('status')).toHaveText('Объект «MAZ 5440» сохранён.');
      await form.getByRole('button',{name:'Отмена',exact:true}).click();
      await expect(input).toHaveValue('');await expect(form.getByRole('status')).toHaveText('Изменения отменены.');
      const deletion=frame.getByRole('region',{name:'Удаление и отмена',exact:true});
      await deletion.getByRole('button',{name:'Отмена',exact:true}).click();
      await expect(deletion.getByRole('status')).toHaveText('Удаление отменено. Объект сохранён.');
      await deletion.getByRole('button',{name:'Удалить объект',exact:true}).focus();await page.keyboard.press('Space');
      await expect(deletion.getByRole('status')).toHaveText('Объект удалён из примера.');
      await deletion.getByRole('button',{name:'Восстановить пример'}).click();
      await expect(deletion.getByRole('button',{name:'Удалить объект',exact:true})).toBeVisible();
      const unavailable=frame.getByRole('region',{name:'Причина недоступности',exact:true});
      await expect(unavailable.getByRole('button',{name:'Экспорт',exact:true})).toBeDisabled();
      await expect(unavailable.getByText('Экспорт доступен администратору. Обратитесь к администратору проекта.',{exact:true})).toBeVisible();
      expect(await frame.locator('body').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    }
  }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
