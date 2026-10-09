import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';import {fileURLToPath} from 'node:url';
let served;const html=`<!doctype html><html data-ds-theme="DEFAULT" data-ds-appearance="light" data-ds-density="cozy"><head><meta charset="utf-8"><link rel="stylesheet" href="/styles.css"><script src="/runtime.js"></script><script src="/components.js"></script></head><body><p id="extra">External description</p><div id="root" style="max-width:400px"></div><script>
var h=React.createElement,S=window.AuroraWebDesignSystem_96e210,root=ReactDOM.createRoot(document.getElementById('root')),events=[],fieldRef=React.createRef();
window.render=function(props){ReactDOM.flushSync(function(){root.render(h(S.DsField,Object.assign({label:'Значение',hint:'Подсказка',suffix:'км/ч',ref:fieldRef,onFocus:function(){events.push('focus')},onBlur:function(){events.push('blur')}},props)))})};render({});</script></body></html>`;
test.beforeAll(async()=>{served=await serveRoot(fileURLToPath(new URL('../../site/',import.meta.url)),new Map([['/field-test.html',html]]))});test.afterAll(async()=>{served.server.closeAllConnections();await new Promise(r=>served.server.close(r))});
test('native ref and external descriptions preserve field hint and unit',async({page})=>{
await page.goto(served.url+'/field-test.html');await page.evaluate(()=>render({'aria-describedby':'extra'}));const input=page.getByRole('textbox');await expect(input).toHaveAccessibleDescription('External description Подсказка км/ч');
await page.evaluate(()=>fieldRef.current.focus());await expect(input).toBeFocused();const id=await input.getAttribute('id');await page.evaluate(()=>render({error:'Ошибка','aria-describedby':'extra'}));expect(await input.getAttribute('id')).toBe(id);await expect(input).toHaveAccessibleDescription('External description Ошибка км/ч');
});
test('consumer focus callbacks do not break floating label and required marker is present',async({page})=>{
await page.goto(served.url+'/field-test.html');await page.evaluate(()=>render({labelMode:'notch',required:true,hint:null,suffix:null}));const input=page.getByRole('textbox');const label=page.locator('label');const before=(await label.boundingBox()).height;await input.focus();await expect.poll(()=>label.evaluate(n=>parseFloat(getComputedStyle(n).top))).toBe(0);await page.locator('#extra').click();expect(await page.evaluate(()=>events)).toEqual(['focus','blur']);await expect(label).toContainText('*');expect(before).toBeGreaterThan(0);
});
test('disabled frame ignores hover and readonly input remains focusable and copyable',async({page})=>{
await page.goto(served.url+'/field-test.html');await page.evaluate(()=>render({disabled:true,value:'123'}));const input=page.getByRole('textbox'),shell=page.locator('[data-ds-field]');const border=await shell.evaluate(n=>getComputedStyle(n).borderColor);await shell.hover();expect(await shell.evaluate(n=>getComputedStyle(n).borderColor)).toBe(border);await expect(input).toBeDisabled();
await page.evaluate(()=>render({readOnly:true,value:'123'}));await input.focus();await expect(input).toBeFocused();await page.keyboard.press('Control+A');expect(await input.evaluate(n=>n.selectionEnd-n.selectionStart)).toBe(3);await page.keyboard.type('9');await expect(input).toHaveValue('123');
});
test('textarea grows and shrinks for user input and controlled updates, caps height and exposes a quiet counter',async({page})=>{
await page.goto(served.url+'/field-test.html');await page.evaluate(()=>render({as:'textarea',autoResize:true,maxHeight:160,rows:2,showCount:true,maxLength:500,suffix:null}));const input=page.getByRole('textbox');const start=(await input.boundingBox()).height;
await input.fill('Line\n'.repeat(40));await expect.poll(async()=>(await input.boundingBox()).height).toBeGreaterThan(start);expect((await input.boundingBox()).height).toBeLessThanOrEqual(160);await expect(input).toHaveAccessibleDescription(/200 из 500 символов/);expect(await page.locator('[aria-live]').count()).toBe(0);
await input.fill('Short');await expect.poll(async()=>(await input.boundingBox()).height).toBeLessThan(160);
await page.evaluate(()=>render({as:'textarea',autoResize:true,maxHeight:160,rows:2,value:'Line\n'.repeat(40),onChange:function(){},showCount:true,maxLength:500}));await expect.poll(async()=>(await input.boundingBox()).height).toBe(160);
await page.evaluate(()=>render({as:'textarea',autoResize:false,rows:2,value:'Short',onChange:function(){}}));await expect(input).toHaveCSS('resize','vertical');await expect.poll(async()=>(await input.boundingBox()).height).toBeLessThan(80);
});

test('catalog validates on blur and submit, focuses errors and demonstrates textarea and readonly in four modes',async({page},testInfo)=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){for(const width of [390,1280]){
await page.setViewportSize({width,height:900});await page.goto(`${served.url}/index.html?card=DsField&theme=${theme}&appearance=${appearance}&density=${density}`);
await expect(page.locator('main h2')).toHaveText(['Живые примеры','Правила применения','Пример кода','Параметры','Токены']);const frame=page.frameLocator('#preview'),imei=frame.locator('#field-imei');
await imei.fill('123');await imei.press('Tab');await expect(imei).toHaveAttribute('aria-invalid','true');await frame.getByRole('button',{name:'Сохранить IMEI',exact:true}).click();await expect(imei).toBeFocused();
await imei.fill('356938035643809');await expect(imei).not.toHaveAttribute('aria-invalid');await frame.getByRole('button',{name:'Сохранить IMEI',exact:true}).click();await expect(frame.getByRole('status')).toHaveText('IMEI сохранён: 356938035643809');
await frame.getByRole('button',{name:'Только чтение',exact:true}).click();const owner=frame.locator('#field-owner');await owner.focus();await expect(owner).toBeFocused();await expect(owner).toHaveAttribute('readonly');
await frame.getByRole('button',{name:'Редактирование',exact:true}).click();await owner.fill('Aurora');await frame.getByRole('button',{name:'Недоступно',exact:true}).click();await expect(owner).toBeDisabled();
const note=frame.locator('#field-note');await note.fill('Строка\n'.repeat(35));expect((await note.boundingBox()).height).toBeLessThanOrEqual(180);await expect(note).toHaveAccessibleDescription(/245 из 300 символов/);
await note.fill('Коротко');await expect.poll(async()=>(await note.boundingBox()).height).toBeLessThan(180);
await frame.getByRole('button',{name:'В рамке',exact:true}).click();await frame.locator('#field-label-mode').focus();await page.keyboard.type('Север');await frame.getByRole('button',{name:'Над полем',exact:true}).click();await expect(frame.locator('#field-label-mode')).toHaveValue('Север');
const iframe=page.locator('#preview');await expect.poll(()=>iframe.evaluate(n=>Math.abs(n.getBoundingClientRect().height-n.contentDocument.body.getBoundingClientRect().height))).toBeLessThanOrEqual(4);expect(await iframe.evaluate(n=>n.contentDocument.documentElement.scrollWidth<=n.clientWidth)).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
await page.screenshot({path:testInfo.outputPath(`field-${theme}-${appearance}-${width}.png`),fullPage:true});
}}
await page.getByRole('button',{name:'Сравнить 4 режима'}).click();await expect(page.locator('#viewports iframe')).toHaveCount(4);expect(errors).toEqual([]);
});
