import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {exampleDemo} from './helpers/live-example.js';
import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
test('switch keeps focus, density targets, descriptions and value during loading',async({page},testInfo)=>{
 const served=await serveRoot(siteRoot());const errors=[];page.on('pageerror',e=>errors.push(e.message));

 try{
 for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
 await page.goto(`${served.url}/index.html?card=DsSwitch&theme=${theme}&appearance=${appearance}&density=${density}`);
 const frame=page.frameLocator('#preview');const setting=frame.getByRole('switch',{name:'Кластеризация объектов',exact:true});
 await expect(setting).toHaveAccessibleDescription('Группирует близкие метки при отдалении карты');
 await setting.focus();await page.keyboard.press('Space');await expect(setting).toBeChecked();
 const track=setting.locator('..').locator('[data-ds-switch-track]');await expect(track).toHaveCSS('outline-style','solid');
 const hit=await setting.locator('..').locator('[data-ds-switch-hit]').evaluate(el=>({height:el.getBoundingClientRect().height,expected:parseFloat(getComputedStyle(el).getPropertyValue('--ds-control-h'))}));expect(hit.height).toBe(hit.expected);
 await frame.locator('body').evaluate(()=>{const native=window.setTimeout;window.setTimeout=(callback,delay,...args)=>delay===1800?(window.finishSave=()=>callback(...args),0):native(callback,delay,...args);});
 const region=exampleDemo(frame,'Сохранение настройки'),toggle=region.getByRole('switch',{name:'Автоматическое обновление карты',exact:true});
 await toggle.focus();await page.keyboard.press('Space');await expect(toggle).toHaveAttribute('aria-busy','true');await expect(toggle).toBeChecked();await expect(toggle).toBeFocused();
 await expect(region.locator('[data-ds-spinner]')).toBeVisible();await expect(region.getByRole('status').filter({hasText:'Загрузка'})).toHaveCount(1);
 await region.getByText('Автоматическое обновление карты',{exact:true}).click({force:true});await expect(toggle).toBeChecked();
 await toggle.focus();await page.keyboard.press('Space');await expect(toggle).toBeChecked();
 await frame.locator('body').evaluate(()=>window.finishSave());await expect(toggle).not.toHaveAttribute('aria-busy','true');await expect(toggle).toBeChecked();await expect(toggle).toBeFocused();
 await region.getByRole('checkbox',{name:'Имитировать ошибку сохранения',exact:true}).focus();await page.keyboard.press('Space');
 await toggle.focus();await page.keyboard.press('Space');await expect(toggle).not.toBeChecked();await frame.locator('body').evaluate(()=>window.finishSave());await expect(toggle).toBeChecked();await expect(region.getByRole('status').filter({hasText:'Не удалось сохранить'})).toHaveCount(1);
 await expect(page.getByRole('table',{name:'Параметры DsSwitch'})).toContainText('loading');
 for(const width of [390,1280]){await page.setViewportSize({width,height:900});await expect.poll(()=>page.locator('#preview').evaluate(el=>el.contentDocument.documentElement.scrollWidth<=el.clientWidth)).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);}
 }
 await page.screenshot({path:testInfo.outputPath('switch-updated.png'),fullPage:true});
 expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
