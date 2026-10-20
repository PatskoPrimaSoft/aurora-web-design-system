import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {exampleDemo} from './helpers/live-example.js';
import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
test('DsFab tooltip, truncation and loading stay accessible in every mode',async({page})=>{
  const served=await serveRoot(siteRoot()),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
      await page.setViewportSize({width,height:900});
      await page.goto(served.url+'/index.html?card=DsFab&theme='+theme+'&appearance='+appearance+'&density='+density);
      const frame=page.frameLocator('#preview');
      await expect(exampleDemo(frame,'Размеры')).toBeVisible();
      await frame.locator('#root').evaluate(el=>{
        const React=window.React,h=React.createElement,S=window[Object.keys(window).find(k=>k.startsWith('AuroraWebDesignSystem_'))];
        const host=document.createElement('div');el.append(host);const root=window.ReactDOM.createRoot(host);
        window.fabFixture={clicks:0,submits:0,escapes:0};
        window.fabFixture.render=(loading,extended,size,tone='primary',disabled=false)=>{
          window.ReactDOM.flushSync(()=>root.render(h('form',{style:{width:200,display:'flex'},onSubmit:e=>{e.preventDefault();window.fabFixture.submits++;},onKeyDown:e=>{if(e.key==='Escape'&&!e.defaultPrevented)window.fabFixture.escapes++;}},
            h(S.DsFab,{label:extended?'Добавить объект в выбранную группу':'Добавить объект',loading,extended,size,tone,disabled,type:'submit','data-testid':'fab-fixture',onClick:()=>window.fabFixture.clicks++}))));
        };
      });
      const button=frame.getByTestId('fab-fixture');
      for(const extended of [false,true])for(const size of ['sm','md','lg'])for(const tone of ['primary','accent','surface']){
        await frame.locator('#root').evaluate((el,args)=>window.fabFixture.render(false,...args),[extended,size,tone]);
        await button.focus();
        await expect(frame.getByRole('tooltip')).toHaveText(extended?'Добавить объект в выбранную группу':'Добавить объект');
        await expect(button).not.toHaveAttribute('title');
        await page.keyboard.press('Escape');
        await expect(frame.getByRole('tooltip')).toHaveCount(0);
        await button.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
        const before=await button.evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {w:r.width,h:r.height,bg:s.backgroundColor,color:s.color};});
        expect(before.w).toBeLessThanOrEqual(200);
        if(extended)expect(await button.locator('[data-ds-fab-label]').evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
        await expect(button).toHaveAccessibleName(extended?'Добавить объект в выбранную группу':'Добавить объект');
        await frame.locator('#root').evaluate((el,args)=>window.fabFixture.render(true,...args),[extended,size,tone]);
        await expect(button).toBeFocused();await expect(button).toHaveJSProperty('disabled',false);
        await expect(button).toHaveAttribute('aria-busy','true');await expect(button).toHaveAttribute('aria-disabled','true');
        expect(await button.evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {w:r.width,h:r.height,bg:s.backgroundColor,color:s.color};})).toEqual(before);
        const spinner=button.locator('[data-ds-fab-spinner]');
        expect(await spinner.evaluate(el=>{const a=el.getBoundingClientRect(),b=el.parentElement.getBoundingClientRect();return Math.max(Math.abs(a.x+a.width/2-b.x-b.width/2),Math.abs(a.y+a.height/2-b.y-b.height/2));})).toBeLessThanOrEqual(1);
        await page.keyboard.press('Enter');await page.keyboard.press('Space');await button.evaluate(el=>el.click());
        expect(await frame.locator('#root').evaluate(()=>[window.fabFixture.clicks,window.fabFixture.submits,window.fabFixture.escapes])).toEqual([0,0,0]);
        await button.blur();
      }
      await frame.locator('#root').evaluate(()=>window.fabFixture.render(false,false,'md'));
      await button.hover();await expect(frame.getByRole('tooltip')).toBeVisible();
      await frame.getByRole('tooltip').hover();await expect(frame.getByRole('tooltip')).toBeVisible();
      await button.focus();await page.keyboard.press('Escape');await page.keyboard.press('Escape');
      expect(await frame.locator('#root').evaluate(()=>window.fabFixture.escapes)).toBe(1);
      await page.keyboard.press('Enter');
      expect(await frame.locator('#root').evaluate(()=>[window.fabFixture.clicks,window.fabFixture.submits])).toEqual([1,1]);
      await frame.locator('#root').evaluate(()=>window.fabFixture.render(false,true,'md','primary',true));
      await expect(button).toBeDisabled();
      expect(await frame.locator('body').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});

test('DsFab opens an object form, cancels and adds without covering content',async({page})=>{
  const served=await serveRoot(siteRoot());
  try{
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
      await page.setViewportSize({width,height:900});
      await page.goto(served.url+'/index.html?card=DsFab&theme='+theme+'&appearance='+appearance+'&density='+density);
      const frame=page.frameLocator('#preview'),region=exampleDemo(frame,'Действие над содержимым');
      const fab=region.getByRole('button',{name:'Добавить объект',exact:true}),input=region.getByRole('textbox',{name:'Название объекта'});
      await fab.focus();await page.keyboard.press('Enter');await expect(input).toBeFocused();
      await input.fill('Отменённый объект');await region.getByRole('button',{name:'Отмена',exact:true}).click();
      await expect(input).toHaveCount(0);await expect(fab).toBeFocused();await expect(region.getByRole('listitem')).toHaveCount(3);
      await page.keyboard.press('Space');await expect(input).toBeFocused();
      await region.getByRole('button',{name:'Добавить',exact:true}).click();
      await expect(input).toBeFocused();await expect(region.getByText('Введите название объекта.',{exact:true})).toBeVisible();
      await input.fill('MAZ 5440');await page.keyboard.press('Enter');
      await expect(input).toHaveCount(0);await expect(fab).toBeFocused();
      await expect(region.getByRole('listitem')).toHaveCount(4);
      await expect(region.getByRole('status')).toHaveText('Объект «MAZ 5440» добавлен.');
      const last=await region.getByRole('listitem').last().boundingBox(),button=await fab.boundingBox();
      expect(last.y+last.height).toBeLessThanOrEqual(button.y);
      expect(await frame.locator('body').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    }
  }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
