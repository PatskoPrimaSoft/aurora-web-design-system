import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../site',import.meta.url));
const html=`<!doctype html><html data-ds-theme="DEFAULT" data-ds-appearance="light" data-ds-density="cozy"><head><link rel="stylesheet" href="/dist/styles.css"><style>body{margin:0}#r{height:400px;width:100%}p{margin:0;padding:12px}</style><script src="/runtime.js"></script><script src="/components.js"></script></head><body><div id="r"></div><script>
var h=React.createElement,S=window.AuroraWebDesignSystem_96e210;
window.render=function(props){ReactDOM.flushSync(function(){window.root.render(h(S.DsPageLayout,Object.assign({responsive:true,scroll:'regions',leftLabel:'Объекты',rightLabel:'Сведения',header:h('header',null,'Шапка'),left:h('input',{'aria-label':'Поиск объектов',defaultValue:'Черновик'}),right:h('button',null,'Действие панели')},props),Array.from({length:40},function(_,i){return h('p',{key:i},'Запись '+i)})))})};
window.root=ReactDOM.createRoot(document.getElementById('r'));render({});</script></body></html>`;
let served;
test.beforeAll(async()=>{served=await serveRoot(root,new Map([['/layout-test.html',html]]))});
test.afterAll(async()=>{served.server.closeAllConnections();await new Promise(r=>served.server.close(r))});
test('narrow layout panels can be opened without squeezing main and preserve form state',async({page})=>{
await page.setViewportSize({width:390,height:800});await page.goto(served.url+'/layout-test.html');
await expect(page.getByRole('complementary')).toHaveCount(0);
const toggle=page.getByRole('button',{name:'Объекты',exact:true});await toggle.focus();await page.keyboard.press('Enter');
await expect(toggle).toHaveAttribute('aria-expanded','true');await expect(page.getByRole('complementary',{name:'Объекты'})).toBeVisible();
await page.getByRole('textbox',{name:'Поиск объектов'}).fill('Volvo');await toggle.click();await toggle.click();await expect(page.getByRole('textbox')).toHaveValue('Volvo');
expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
await page.setViewportSize({width:1280,height:800});await expect(page.getByRole('complementary')).toHaveCount(2);await expect(toggle).toBeHidden();
await page.getByRole('textbox').focus();await page.setViewportSize({width:390,height:800});await expect(toggle).toBeFocused();await expect(toggle).toHaveAttribute('aria-expanded','false');
});
test('region scroll keeps header still; page scroll moves all regions together',async({page})=>{
await page.setViewportSize({width:1280,height:800});await page.goto(served.url+'/layout-test.html');
const main=page.getByRole('main');const header=page.locator('header');const before=(await header.boundingBox()).y;
await main.evaluate(n=>n.scrollTop=300);expect(await main.evaluate(n=>n.scrollTop)).toBeGreaterThan(0);expect((await header.boundingBox()).y).toBe(before);
await page.evaluate(()=>render({scroll:'page'}));
const shell=page.locator('[data-ds-page-layout]');await shell.evaluate(n=>n.scrollTop=300);expect(await shell.evaluate(n=>n.scrollTop)).toBeGreaterThan(0);expect((await header.boundingBox()).y).toBeLessThan(before);
});
test('skip link focuses main; padding and gap work independently',async({page})=>{
await page.setViewportSize({width:1280,height:800});await page.goto(served.url+'/layout-test.html');
await page.keyboard.press('Tab');const skip=page.getByRole('link',{name:'К содержимому'});await expect(skip).toBeFocused();await expect(skip).toBeInViewport();await page.keyboard.press('Enter');await expect(page.getByRole('main')).toBeFocused();
await page.evaluate(()=>render({gap:false,padding:true}));expect(await page.getByRole('main').evaluate(n=>parseFloat(getComputedStyle(n.parentElement).padding))).toBeGreaterThan(0);expect(await page.getByRole('main').evaluate(n=>getComputedStyle(n.parentElement).gap)).toBe('0px');
await page.evaluate(()=>render({gap:true,padding:false}));expect(await page.getByRole('main').evaluate(n=>getComputedStyle(n.parentElement).padding)).toBe('0px');expect(await page.getByRole('main').evaluate(n=>parseFloat(getComputedStyle(n.parentElement).gap))).toBeGreaterThan(0);
});

test('catalog examples work across themes, densities and narrow widths',async({page},testInfo)=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [390,1280]){
await page.setViewportSize({width,height:900});await page.goto(`${served.url}/index.html?card=DsPageLayout&theme=${theme}&appearance=${appearance}&density=${density}`);
await expect(page.locator('main h2')).toHaveText(['Живые примеры','Правила применения','Пример кода','Параметры','Токены']);
const frame=page.frameLocator('#preview'),work=frame.locator('.work');
const selectedColor=await frame.getByRole('button',{name:'Слева',exact:true}).evaluate(n=>getComputedStyle(n).backgroundColor);
for(const name of ['Без отступов','Нижний регион']){
const toggle=frame.getByRole('button',{name,exact:true});const initialColor=await toggle.evaluate(n=>getComputedStyle(n).backgroundColor);
await toggle.focus();await page.keyboard.press('Space');await expect(toggle).toHaveAttribute('aria-pressed','true');await expect(toggle).toHaveCSS('background-color',selectedColor);
await page.keyboard.press('Space');await expect(toggle).toHaveAttribute('aria-pressed','false');await expect(toggle).toHaveCSS('background-color',initialColor);
}

if(width===390){await work.getByRole('button',{name:'Объекты',exact:true}).focus();await page.keyboard.press('Enter')}
await work.getByRole('button',{name:'MAN TGX',exact:true}).click();await expect(work.locator('main h4')).toHaveText('История · MAN TGX');
if(width===390){await work.getByRole('button',{name:'Объекты',exact:true}).click();await work.getByRole('button',{name:'Сведения',exact:true}).click()}
await work.getByRole('textbox',{name:'Примечание'}).fill('Проверить маршрут');await work.getByRole('button',{name:'Сохранить',exact:true}).click();await expect(work.getByRole('status')).toHaveText('Примечание сохранено.');
if(width===390){await work.getByRole('button',{name:'Сведения',exact:true}).click();await work.getByRole('button',{name:'Сведения',exact:true}).click();await expect(work.getByRole('textbox')).toHaveValue('Проверить маршрут')}
await expect.poll(()=>work.locator('main').evaluate(n=>n.scrollHeight>n.clientHeight)).toBe(true);
const expand=frame.getByRole('button',{name:'Развернуть описание',exact:true});await expand.click();await expect(frame.getByRole('button',{name:'Свернуть описание',exact:true})).toHaveAttribute('aria-expanded','true');
await expect.poll(()=>page.locator('#preview').evaluate(n=>Math.abs(n.getBoundingClientRect().height-n.contentDocument.body.getBoundingClientRect().height))).toBeLessThan(4);
expect(await page.locator('#preview').evaluate(n=>n.contentDocument.documentElement.scrollWidth<=n.clientWidth)).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
await page.screenshot({path:testInfo.outputPath(`layout-${theme}-${appearance}-${width}.png`),fullPage:true});
await page.getByRole('button',{name:'Сравнить 4 режима'}).click();await expect(page.locator('#viewports iframe')).toHaveCount(4);for(const iframe of await page.locator('#viewports iframe').all())await expect.poll(()=>iframe.evaluate(n=>n.contentDocument.documentElement.scrollWidth<=n.clientWidth)).toBe(true);
}expect(errors).toEqual([]);
});

test('responsive panels leave usable width for main before reaching the narrow breakpoint',async({page})=>{
await page.setViewportSize({width:900,height:800});await page.goto(served.url+'/layout-test.html');
await expect(page.getByRole('button',{name:'Объекты',exact:true})).toBeVisible();expect((await page.getByRole('main').boundingBox()).width).toBeGreaterThanOrEqual(320);
});
test('collapsing a panel returns focus even when activation does not focus the button',async({page})=>{
await page.setViewportSize({width:390,height:800});await page.goto(served.url+'/layout-test.html');
const toggle=page.getByRole('button',{name:'Объекты',exact:true});await toggle.click();await page.getByRole('textbox').focus();await toggle.evaluate(n=>n.click());await expect(toggle).toBeFocused();
});
