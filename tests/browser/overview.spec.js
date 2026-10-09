import {test,expect} from '@playwright/test';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
test('read first renders current components and interactive examples in four scopes',async({page})=>{
 const cards=await buildCatalogue({root,outDir:`${root}/site`}),served=await serveRoot(`${root}/site`),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
   await page.goto(`${served.url}/index.html?card=overview&theme=${theme}&appearance=${appearance}&density=${density}`);
   const frame=page.frameLocator('#preview');
   await expect(frame.locator('body')).toContainText(`${cards.length} карточек`);
   await expect(frame.getByRole('heading',{name:'Правила, из которых следует всё остальное'})).toBeVisible();
   const search=frame.getByRole('searchbox',{name:'Поиск объекта или номера',exact:true});
   await search.fill('Scania');
   await expect(frame.getByRole('table',{name:'Объекты',exact:true})).toContainText('Scania R450');
   await expect(frame.getByRole('table',{name:'Объекты',exact:true})).not.toContainText('MAZ 5440');
   await frame.getByRole('button',{name:'Очистить все',exact:true}).click();
   await expect(frame.getByRole('group',{name:'Применённые фильтры',exact:true})).toHaveCount(0);
  }
  expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
