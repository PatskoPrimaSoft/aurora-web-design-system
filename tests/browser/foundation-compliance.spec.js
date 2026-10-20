import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const scopes=[['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']];
let served;
test.beforeAll(async()=>{await buildCatalogue({root,outDir:root+'/.tmp/foundations-fix/site'});served=await serveRoot(root+'/.tmp/foundations-fix/site');});
test.afterAll(async()=>{served?.server.closeAllConnections();if(served)await new Promise(r=>served.server.close(r));});
async function fixture(page,scope,kind){
  const [theme,appearance,density]=scope;
  await page.goto(`${served.url}/design-system/components/DsButton/preview.html?theme=${theme}&appearance=${appearance}&density=${density}`);
  await page.locator('#root button').first().waitFor();
  await page.evaluate(({kind,scope})=>{
    const h=React.createElement,S=window.AuroraWebDesignSystem_96e210;
    const host=document.createElement('main');host.id='audit-fixture';document.body.replaceChildren(host);
    ['theme','appearance','density'].forEach((key,i)=>host.setAttribute('data-ds-'+key,scope[i]));
    const long='Объекты северо-западного подразделения',word='СверхдлинныйИдентификаторБезПробеловДляПроверкиПереноса';
    const demo=(id,child)=>h('section',{id,style:{width:180,marginBottom:24}},child);
    let content;
    if(kind==='labels')content=h('div',null,
      demo('button',h(S.DsButton,{icon:'save',iconRight:'arrow_forward',onClick:()=>host.dataset.clicked='true'},long)),
      demo('word',h(S.DsButton,null,word)),
      demo('short',h(S.DsButton,null,'Сохранить')),
      demo('small',h(S.DsButton,{size:'sm'},'Сохранить')),
      demo('short-chip',h(S.DsChip,{removable:true,count:12},'Топливо')),
      demo('chip',h(S.DsChip,{removable:true,maxWidth:160,count:12,onRemove:()=>host.dataset.removed='true'},long)),
      demo('disabled-chip',h(S.DsChip,{removable:true,maxWidth:160,disabled:true},word)),
      demo('menu',h(S.DsMenu,{width:180,trigger:h(S.DsButton,null,'Действия'),items:[{id:'long',label:long,icon:'save',shortcut:'Ctrl+S'},{id:'word',label:word},{id:'disabled',label:long,disabled:true}]})));
    if(kind==='filter')content=demo('filter',h(S.DsFilterMenu,{label:'Состояние по категориям',type:'checkbox-list',options:['Движение'],value:['Движение'],onApply:()=>{}}));
    if(kind==='score')content=h('div',null,h(S.DsScoreBar,{value:null,label:'Нет поездок'}),h(S.DsScoreBar,{value:0,label:'Нулевая оценка'}));
    if(kind==='headings')content=h('div',null,h(S.DsPanel,{title:'Название панели',headingLevel:'h3'},'Содержимое'),h(S.DsDialog,{title:'Название диалога'},'Содержимое'));
    if(kind==='sparkline')content=h('div',null,...[
      ['positive',[12,14,22]],['shifted',[112,114,122]],['negative',[-22,-14,-12]],['mixed',[-10,0,10]],['gaps',[10,20,null,5,15]],['zero',[0,0,0]],['line',[12,14,22],false],['line-shifted',[112,114,122],false]
    ].map(([id,data,area=true])=>demo(id,h(S.DsSparkline,{data,width:100,height:24,label:id,area}))));
    ReactDOM.flushSync(()=>ReactDOM.createRoot(host).render(content));
  },{kind,scope});
}
async function readable(locator){
  return locator.evaluate(el=>{const r=el.getBoundingClientRect();const range=document.createRange();range.selectNodeContents(el);return [...range.getClientRects()].every(t=>t.left>=r.left-1&&t.right<=r.right+1&&t.top>=r.top-1&&t.bottom<=r.bottom+1)&&el.scrollWidth<=el.clientWidth+1&&el.scrollHeight<=el.clientHeight+1;});
}
for(const scope of scopes){
  const name=scope.join('/');
  test(`composed button keeps its arrow clear of the adjacent action: ${name}`,async({page})=>{
    await page.setViewportSize({width:390,height:844});await fixture(page,scope,'filter');
    const trigger=page.locator('[data-ds-filter-trigger]'),arrow=page.locator('[data-ds-filter-arrow]');
    const bounds=await page.locator('#filter').evaluate(el=>{
      const button=el.querySelector('[data-ds-filter-trigger]').getBoundingClientRect(),arrow=el.querySelector('[data-ds-filter-arrow]').getBoundingClientRect(),clear=el.querySelector('[data-ds-filter-clear]').getBoundingClientRect();
      return {arrow:arrow.right,button:button.right,clear:clear.left};
    });
    expect(bounds.arrow).toBeLessThanOrEqual(bounds.button);
    expect(bounds.arrow).toBeLessThanOrEqual(bounds.clear);
    await arrow.hover({timeout:3000});
    await trigger.press('Enter');await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
  });
  test(`full control labels are visible without hover or activation: ${name}`,async({page})=>{
    await page.setViewportSize({width:390,height:844});await fixture(page,scope,'labels');
    for(const id of ['button','word']){
      const label=page.locator(`#${id} [data-ds-button-label]`);
      expect(await readable(label),id).toBe(true);
    }
    for(const id of ['chip','disabled-chip']){
      const label=page.locator(`#${id} [role=group] > span`).filter({hasText:/подразделения|Идентификатор/}).first();
      expect(await readable(label),id).toBe(true);
    }
    await page.locator('#button button').focus();expect(await readable(page.locator('#button [data-ds-button-label]'))).toBe(true);
    await expect(page.locator('#audit-fixture')).not.toHaveAttribute('data-clicked');
    await expect(page.locator('#short button')).toHaveCSS('height',scope[2]==='cozy'?'36px':'30px');
    await expect(page.locator('#small button')).toHaveCSS('height',scope[2]==='cozy'?'28px':'24px');
    await expect(page.locator('#short-chip [role=group]')).toHaveCSS('height',scope[2]==='cozy'?'28px':'24px');
    await page.getByRole('button',{name:'Действия',exact:true}).press('Enter');
    for(const item of await page.getByRole('menuitem').all())expect(await readable(item.locator('span').filter({hasText:/подразделения|Идентификатор/}).first())).toBe(true);
    await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Действия',exact:true})).toBeFocused();
    await page.locator('#chip button').press('Enter');await expect(page.locator('#audit-fixture')).toHaveAttribute('data-removed','true');
  });
  test(`empty score has no invalid meter and zero stays a measurement: ${name}`,async({page})=>{
    await fixture(page,scope,'score');
    const result=await new AxeBuilder({page}).include('#audit-fixture').withRules(['aria-required-attr','aria-valid-attr-value']).analyze();
    expect(result.violations).toEqual([]);
    await expect(page.getByRole('meter')).toHaveCount(1);
    await expect(page.getByRole('meter',{name:'Нулевая оценка'})).toHaveAttribute('aria-valuenow','0');
    await expect(page.getByRole('img',{name:'Нет поездок: Нет данных'})).toBeVisible();
  });
  test(`panel and dialog use the title role without changing heading semantics: ${name}`,async({page})=>{
    await fixture(page,scope,'headings');
    await expect(page.getByRole('heading',{name:'Название панели',level:3})).toHaveCSS('font-size','20px');
    await expect(page.getByRole('heading',{name:'Название диалога',level:2})).toHaveCSS('font-size','20px');
  });
}
test('filled sparklines retain a zero baseline, signed values and gaps',async({page})=>{
  await fixture(page,scopes[0],'sparkline');
  const paths=await page.locator('#audit-fixture section').evaluateAll(es=>Object.fromEntries(es.map(e=>[e.id,[...e.querySelectorAll('path')].map(p=>({d:p.getAttribute('d'),fill:p.getAttribute('fill')}))])));
  expect(paths.positive[0].d).not.toBe(paths.shifted[0].d);
  // With 2px padding in a 24px chart, zero is y=22 (positive), 2 (negative), 12 (mixed).
  expect(paths.positive[0].d).toMatch(/L100 22L0 22Z$/);
  expect(paths.negative[0].d).toMatch(/L100 2L0 2Z$/);
  expect(paths.mixed[0].d).toMatch(/L100 12L0 12Z$/);
  expect(paths.gaps.filter(p=>p.fill!=='none')).toHaveLength(2);
  expect(paths.gaps.filter(p=>p.fill==='none')).toHaveLength(2);
  expect(paths.zero[0].d).toBe('M0 22L50 22L100 22L100 22L0 22Z');
  expect(paths.line).toEqual(paths['line-shifted']);
  expect(paths.line).toHaveLength(1);
});
