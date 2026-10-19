import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { serveRoot } from '../../tools/baseline/render.mjs';
import { fileURLToPath } from 'node:url';

let served;
const html = `<!doctype html><html lang="ru" data-ds-theme="DEFAULT" data-ds-appearance="light" data-ds-density="cozy"><head><meta charset="utf-8"><link rel="stylesheet" href="/styles.css"><script src="/runtime.js"></script><script src="/components.js"></script></head><body><div id="root"></div><script>
const h=React.createElement,S=window.AuroraWebDesignSystem_96e210,root=ReactDOM.createRoot(document.getElementById('root'));
window.inputRef=React.createRef();window.submissions=[];window.changes=[];
window.render=function(component,props,controlled=false,english=false){
 function App(){const [value,setValue]=React.useState(props.defaultValue);return h('form',{id:'form',onSubmit:e=>{e.preventDefault();submissions.push(Object.fromEntries(new FormData(e.currentTarget)))},onReset:controlled?()=>setValue(props.defaultValue):undefined},
 h(S[component],{...props,...(controlled?{value,defaultValue:undefined}:{}),ref:inputRef,onChange:(next)=>{changes.push(next);if(controlled)setValue(next)}}),h('button',{type:'submit'},'Save'),h('button',{type:'reset'},'Reset'))}
 ReactDOM.flushSync(()=>root.render(h(S.DsStringsProvider,{strings:english?S.dsStringsEn:S.dsStringsRu},h(App,{key:Math.random()}))));
};</script></body></html>`;
test.beforeAll(async () => { served = await serveRoot(fileURLToPath(new URL('../../site/', import.meta.url)), new Map([['/date-test.html', html]])); });
test.afterAll(async () => { served.server.closeAllConnections(); await new Promise(resolve => served.server.close(resolve)); });

for (const [component, initial, next, type] of [
  ['DsDatePicker', '2026-10-19', '2026-10-20', 'date'],
  ['DsTimePicker', '09:00', '10:30', 'time'],
  ['DsDateTimePicker', '2026-10-19T09:00', '2026-10-20T10:30', 'datetime-local'],
]) {
  test(`${component} supports native value, ref, form data, reset and validation`, async ({ page }) => {
    await page.goto(served.url + '/date-test.html');
    for (const controlled of [false, true]) {
      await page.evaluate(({component, initial, controlled}) => render(component, {label:'Departure', name:'departure', required:true, defaultValue:initial}, controlled), {component, initial, controlled});
      const input = page.getByLabel('Departure');
      await expect(input).toHaveAttribute('type', type);
      await page.evaluate(() => inputRef.current.focus());
      await expect(input).toBeFocused();
      await input.fill(next);
      await page.getByRole('button', {name:'Save', exact:true}).click();
      expect(await page.evaluate(() => submissions.at(-1))).toEqual({departure:next});
      await page.getByRole('button', {name:'Reset', exact:true}).click();
      await expect(input).toHaveValue(initial);
      await input.fill('');
      const before = await page.evaluate(() => submissions.length);
      await page.getByRole('button', {name:'Save', exact:true}).click();
      expect(await page.evaluate(() => submissions.length)).toBe(before);
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(input).toHaveAccessibleDescription(/.+/);
      await input.fill(next);
      await expect(input).not.toHaveAttribute('aria-invalid', 'true');
    }
    await page.evaluate(component => render(component, {label:'Departure', value:'', disabled:true}), component);
    await expect(page.getByLabel('Departure')).toBeDisabled();
    await page.evaluate(({component, initial}) => render(component, {label:'Departure', value:initial, readOnly:true}), {component,initial});
    await expect(page.getByLabel('Departure')).toHaveAttribute('readonly');
    await page.getByLabel('Departure').focus();
    await expect(page.getByLabel('Departure')).toBeFocused();
    expect((await new AxeBuilder({page}).include('#root').analyze()).violations).toEqual([]);
  });
}

test('range prevents reverse order and bound violations; presets and reset update both fields', async ({page}) => {
  await page.goto(served.url + '/date-test.html');
  await page.evaluate(() => render('DsDateRangePicker', {label:'Period',name:'period',timeZone:'Europe/Minsk',required:true,min:'2026-10-01',max:'2026-10-31',defaultValue:{from:'2026-10-19',to:'2026-10-20'},presets:[{id:'week',label:'Week',value:{from:'2026-10-12',to:'2026-10-18'}}]}));
  // getByLabel includes the aria-hidden required marker in the label's DOM text.
  const from=page.getByLabel('От'),to=page.getByLabel('До');
  await expect(from).toHaveAccessibleName('От');await expect(to).toHaveAccessibleName('До');
  await expect(from).toHaveAttribute('required');await expect(to).toHaveAttribute('required');
  await expect(from).toHaveAccessibleDescription(/Europe\/Minsk/);
  await from.fill('2026-10-21');
  await expect(to).toHaveAttribute('aria-invalid','true');
  await page.getByRole('button',{name:'Save',exact:true}).click();
  expect(await page.evaluate(()=>submissions)).toEqual([]);
  await to.fill('2026-10-22');
  await expect(to).not.toHaveAttribute('aria-invalid','true');
  await from.fill('2026-09-30');
  await from.press('Tab');
  await expect(from).toHaveAttribute('aria-invalid','true');
  await page.getByRole('button',{name:'Save',exact:true}).click();
  expect(await page.evaluate(()=>submissions)).toEqual([]);
  await page.getByRole('button',{name:'Week',exact:true}).click();
  await expect(from).toHaveValue('2026-10-12');await expect(to).toHaveValue('2026-10-18');
  await page.getByRole('button',{name:'Save',exact:true}).click();
  expect(await page.evaluate(()=>submissions.at(-1))).toEqual({'period.from':'2026-10-12','period.to':'2026-10-18'});
  await page.getByRole('button',{name:'Reset',exact:true}).click();
  await expect(from).toHaveValue('2026-10-19');await expect(to).toHaveValue('2026-10-20');
  expect((await new AxeBuilder({page}).include('#root').analyze()).violations).toEqual([]);
});

test('range supports local date-time, controlled state, English errors and readonly presets',async({page})=>{
  await page.goto(served.url+'/date-test.html');
  const props={label:'Shift',granularity:'datetime',timeZone:'Europe/Minsk',defaultValue:{from:'2026-10-19T23:00',to:'2026-10-20T01:00'},presets:[{id:'shift',label:'Shift preset',value:{from:'2026-10-19T09:00',to:'2026-10-19T18:00'}}]};
  await page.evaluate(props=>render('DsDateRangePicker',props,true,true),props);
  const from=page.getByLabel('From',{exact:true}),to=page.getByLabel('To',{exact:true});
  await expect(from).toHaveAttribute('type','datetime-local');
  await to.fill('2026-10-19T22:00');await expect(to).toHaveAttribute('aria-invalid','true');
  await expect(to).toHaveAccessibleDescription(/end|End/);
  await page.getByRole('button',{name:'Shift preset'}).click();await expect(from).toHaveValue('2026-10-19T09:00');
  await page.getByRole('button',{name:'Reset',exact:true}).click();await expect(from).toHaveValue(props.defaultValue.from);
  await page.evaluate(props=>render('DsDateRangePicker',{...props,readOnly:true},false,true),props);
  await expect(page.getByLabel('From',{exact:true})).toHaveAttribute('readonly');
  await expect(page.getByRole('button',{name:'Shift preset'})).toBeDisabled();
  await page.evaluate(props=>render('DsDateRangePicker',{...props,disabled:true},false,true),props);
  await expect(page.getByLabel('From',{exact:true})).toBeDisabled();
  await expect(page.getByLabel('To',{exact:true})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Shift preset'})).toBeDisabled();
});

test('date pages fit narrow and wide layouts and keep labels, live examples and code in all modes',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const card of ['DsDatePicker','DsTimePicker','DsDateTimePicker','DsDateRangePicker']){
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){for(const width of [390,1280]){
      await page.setViewportSize({width,height:900});
      await page.goto(`${served.url}/index.html?card=${card}&theme=${theme}&appearance=${appearance}&density=${density}`);
      const frame=page.frameLocator('#preview');await expect(frame.locator('[data-ds-example-demo] input').first()).toBeVisible();
      await expect(frame.locator('[data-ds-example-demo] input').first()).toHaveAccessibleName(/.+/);
      await frame.locator('[data-ds-example-demo] input').first().focus();await expect(frame.locator('[data-ds-example-demo] input').first()).toBeFocused();
      await expect(page.locator('main h2')).toHaveText(['Живые примеры','Правила применения','Пример кода','Параметры','Токены']);
      expect(await page.locator('#preview').evaluate(node=>node.contentDocument.documentElement.scrollWidth<=node.clientWidth)).toBe(true);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }}
  }
  expect(errors).toEqual([]);
});
