import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../site/',import.meta.url));
const html=`<!doctype html><html data-ds-theme="DEFAULT" data-ds-appearance="light" data-ds-density="cozy"><head><meta charset="utf-8"><link rel="stylesheet" href="/styles.css"><script src="/runtime.js"></script><script src="/components.js"></script></head><body style="margin:0"><div id="root"></div><script>
var h=React.createElement,S=window.AuroraWebDesignSystem_96e210,root=ReactDOM.createRoot(document.getElementById('root'));
window.render=function(props){ReactDOM.flushSync(function(){root.render(h(S.DsPanel,Object.assign({title:'История',scroll:true,height:280},props),Array.from({length:30},function(_,i){return h('p',{key:i},'Событие '+i)})))})};render({});
</script></body></html>`;
let served;
test.beforeAll(async()=>{served=await serveRoot(root,new Map([['/panel-test.html',html]]))});
test.afterAll(async()=>{served.server.closeAllConnections();await new Promise(r=>served.server.close(r))});

test('panel title names its region and follows the document heading hierarchy',async({page})=>{
await page.goto(served.url+'/panel-test.html');
await expect(page.getByRole('region',{name:'История',exact:true})).toHaveCount(1);
await expect(page.getByRole('heading',{name:'История',level:2})).toBeVisible();
await page.evaluate(()=>render({headingLevel:'h3'}));await expect(page.getByRole('heading',{name:'История',level:3})).toBeVisible();
await page.evaluate(()=>render({title:null,'aria-label':'Сведения'}));await expect(page.getByRole('region',{name:'Сведения'})).toBeVisible();
await page.evaluate(()=>render({headingLevel:'none','aria-label':'Другая панель'}));await expect(page.getByRole('heading')).toHaveCount(0);await expect(page.getByRole('region',{name:'Другая панель'})).toBeVisible();
});

test('narrow panel wraps title, header actions and footer without clipping',async({page})=>{
await page.setViewportSize({width:320,height:800});await page.goto(served.url+'/panel-test.html');
await page.evaluate(()=>render({scroll:false,height:undefined,title:'Настройки уведомлений для транспортных средств и дополнительных объектов',actions:h(React.Fragment,null,h(S.DsButton,null,'Сбросить изменения'),h(S.DsButton,null,'Подробнее')),footer:h(React.Fragment,null,h(S.DsButton,{tone:'secondary'},'Отменить'),h(S.DsButton,null,'Сохранить изменения'))}));
const title=page.getByRole('heading');expect(await title.evaluate(n=>n.scrollWidth<=n.clientWidth&&n.scrollHeight<=n.clientHeight)).toBe(true);
expect(await title.evaluate(n=>n.getBoundingClientRect().height)).toBeGreaterThan(30);
expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
const footer=page.locator('footer');const buttons=footer.getByRole('button');expect((await buttons.last().boundingBox()).x+(await buttons.last().boundingBox()).width).toBeLessThanOrEqual(320);
await page.setViewportSize({width:900,height:800});const box=await footer.boundingBox(),last=await buttons.last().boundingBox();expect(box.x+box.width-last.x-last.width).toBeLessThan(30);
});

test('scroll body is reachable by Tab and scrolls with keyboard while header stays visible',async({page})=>{
await page.goto(served.url+'/panel-test.html');await page.keyboard.press('Tab');
const body=page.getByRole('group',{name:'История',exact:true});await expect(body).toBeFocused();
const header=page.locator('header'),top=(await header.boundingBox()).y;
await page.keyboard.press('PageDown');await expect.poll(()=>body.evaluate(n=>n.scrollTop)).toBeGreaterThan(0);
expect((await header.boundingBox()).y).toBe(top);
await page.evaluate(()=>render({scroll:false,height:undefined}));await expect(page.locator('[data-ds-panel-body]')).not.toHaveAttribute('tabindex');
});


test('catalog panel examples preserve focus through loading and work in four modes at narrow and wide widths',async({page},testInfo)=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
for(const width of [390,1280]){
await page.setViewportSize({width,height:900});await page.goto(`${served.url}/index.html?card=DsPanel&theme=${theme}&appearance=${appearance}&density=${density}`);
await expect(page.locator('main h2')).toHaveText(['Живые примеры','Правила применения','Пример кода','Параметры','Токены']);
const frame=page.frameLocator('#preview');const vehicle=frame.getByRole('region',{name:'Scania R450',exact:true});
await vehicle.getByRole('textbox',{name:'Госномер'}).fill('TEST 123');const save=vehicle.getByRole('button',{name:'Сохранить',exact:true});await save.focus();await page.keyboard.press('Enter');
await expect(save).toHaveAttribute('aria-disabled','true');await expect(vehicle.getByRole('status')).toHaveText('Сохранено: TEST 123');await expect(save).toBeFocused();
const notifications=frame.getByRole('region',{name:'Уведомления о событиях и изменениях транспортных средств',exact:true});
await frame.getByRole('button',{name:'Ошибка',exact:true}).click();await expect(notifications.getByRole('heading',{name:'Не удалось загрузить уведомления'})).toBeVisible();
await notifications.getByRole('button',{name:'Повторить',exact:true}).focus();await page.keyboard.press('Enter');await expect(notifications.getByRole('status',{name:'Загрузка уведомлений'})).toBeVisible();
await expect(notifications.getByRole('status')).toHaveText('Данные обновлены. Новых событий: 3.');await expect(notifications.getByRole('button',{name:'Обновить',exact:true})).toBeFocused();
await frame.getByRole('button',{name:'Пусто',exact:true}).click();await expect(notifications.getByRole('heading',{name:'Уведомлений пока нет'})).toBeVisible();
await notifications.getByRole('button',{name:'Обновить',exact:true}).click();await expect(notifications.getByRole('status',{name:'Загрузка уведомлений'})).toBeVisible();await expect(notifications.getByRole('heading',{name:'Уведомлений пока нет'})).toBeVisible();
for(const name of ['Без отступов','Без рамки']){const button=frame.getByRole('button',{name,exact:true});await button.focus();await page.keyboard.press('Space');await expect(button).toHaveAttribute('aria-pressed','true');await button.click();await expect(button).toHaveAttribute('aria-pressed','false');}
const iframe=page.locator('#preview');await expect.poll(()=>iframe.evaluate(n=>Math.abs(n.getBoundingClientRect().height-n.contentDocument.body.getBoundingClientRect().height))).toBeLessThanOrEqual(4);
expect(await iframe.evaluate(n=>n.contentDocument.documentElement.scrollWidth<=n.clientWidth)).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
await page.screenshot({path:testInfo.outputPath(`panel-${theme}-${appearance}-${width}.png`),fullPage:true});
}}
await page.getByRole('button',{name:'Сравнить 4 режима'}).click();await expect(page.locator('#viewports iframe')).toHaveCount(4);
expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
