import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';

test('catalogue regions scroll independently and navigation remains usable on narrow screens',async({page})=>{
 const served=await serveRoot(siteRoot());
 try{
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
   await page.setViewportSize({width:1440,height:900});
   await page.goto(`${served.url}/index.html?card=DsCheckbox&theme=${theme}&appearance=${appearance}&density=${density}`);
   const navigation=page.getByRole('complementary',{name:'Навигация',exact:true}),main=page.getByRole('main');
   await expect(navigation).toBeVisible();await expect(page.locator('#title')).toHaveText('Checkbox');
   expect(await navigation.evaluate(node=>node.scrollHeight>node.clientHeight)).toBe(true);
   await navigation.evaluate(node=>node.scrollTop=150);
   expect(await main.evaluate(node=>node.scrollTop)).toBe(0);
   await main.evaluate(node=>node.scrollTop=150);
   expect(await main.evaluate(node=>node.scrollTop)).toBeGreaterThan(0);
   expect(await navigation.evaluate(node=>node.scrollTop)).toBe(150);
   await page.setViewportSize({width:390,height:844});
   const toggle=page.getByRole('button',{name:'Навигация',exact:true});
   await expect(toggle).toBeVisible();await expect(navigation).toBeHidden();
   await toggle.click();await expect(navigation).toBeVisible();
   await page.locator('#search').fill('DsButton');
   await page.locator('nav a[data-id="DsButton"]').click();await expect(page.locator('#title')).toHaveText('Button');
   await toggle.click();await expect(navigation).toBeHidden();
   const skip=page.getByRole('link',{name:'К содержимому',exact:true});await skip.focus();await page.keyboard.press('Enter');await expect(main).toBeFocused();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
