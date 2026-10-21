import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {expectPreviewFits} from './helpers/preview-layout.js';
test('read first provides a short guide and working search in four scopes and on mobile',async({page})=>{
 const served=await serveRoot(siteRoot()),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
   await page.goto(`${served.url}/index.html?card=overview&theme=${theme}&appearance=${appearance}&density=${density}`);
   const frame=page.frameLocator('#preview');
   await expect(frame.getByRole('heading',{name:'С чего начать',exact:true})).toBeVisible();
   await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
   await expect(frame.locator('#demo')).toHaveAttribute('data-ds-appearance',appearance);
   await expect(frame.locator('#demo')).toHaveAttribute('data-ds-theme',theme);
   await expect(frame.locator('#demo')).toHaveAttribute('data-ds-density',density);
   const search=frame.getByRole('searchbox',{name:'Поиск объекта',exact:true});
   await search.fill('Volvo');
   await expect(frame.getByRole('list',{name:'Объекты'})).toContainText('Volvo FH16');
   await expect(frame.getByRole('list',{name:'Объекты'})).not.toContainText('МАЗ');
   await search.fill('нет такого объекта');
   await expect(frame.getByRole('status')).toContainText('Найдено: 0');
   await expect(frame.getByText('Объекты не найдены. Измените запрос.')).toBeVisible();
   await search.fill('');
   await expect(frame.getByRole('list',{name:'Объекты'}).getByRole('listitem')).toHaveCount(3);
  }
  await page.setViewportSize({width:390,height:844});
  const frame=page.frameLocator('#preview');
  await expectPreviewFits(page);
  await frame.getByRole('link',{name:'Типографика',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#title')).toHaveText('Типографика');
  await expect(page.locator('#theme')).toContainText('RED2');
  expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
