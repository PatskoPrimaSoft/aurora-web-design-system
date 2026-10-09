import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
let served;test.beforeAll(async()=>{served=await serveRoot(fileURLToPath(new URL('../../site/',import.meta.url)))});
test.afterAll(async()=>{served.server.closeAllConnections();await new Promise(r=>served.server.close(r))});
test('deprecated status appears next to navigation title and page title and clears on navigation',async({page},testInfo)=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
for(const width of [390,1280]){
await page.setViewportSize({width,height:900});await page.goto(`${served.url}/index.html?card=DsDuration&theme=${theme}&appearance=${appearance}&density=${density}`);
const link=page.locator('nav a[data-id="DsDuration"]');await expect(link).toContainText('Устарело');await expect(page.locator('#title')).toHaveText('DsDuration');await expect(page.locator('#card-status')).toHaveText('Устарело');
await link.focus();await page.keyboard.press('Enter');await expect(page.locator('#card-status')).toHaveText('Устарело');
await page.locator('#search').fill('DsDuration');await expect(page.locator('nav a')).toHaveCount(1);await expect(page.locator('nav')).toContainText('Устарело');await page.locator('#search').fill('');
await page.locator('nav a[data-id="DsPanel"]').click();await expect(page.locator('#card-status')).toBeHidden();await expect(page.locator('#title')).toHaveText('DsPanel');
await page.goBack();await expect(page.locator('#card-status')).toHaveText('Устарело');
expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
await page.screenshot({path:testInfo.outputPath(`status-${theme}-${appearance}-${width}.png`),fullPage:true});
}}
expect(errors).toEqual([]);
});
