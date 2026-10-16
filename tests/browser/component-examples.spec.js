import {test,expect} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {readCards} from '../../tools/catalog/index.mjs';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {readFileSync} from 'node:fs';
import {transform} from 'esbuild';

const root=fileURLToPath(new URL('../../',import.meta.url));
const components=readCards(root).filter(card=>card.group.startsWith('5 ·'));
let served;
test.beforeAll(async()=>{
  await buildCatalogue({root,outDir:`${root}/site`});
  served=await serveRoot(`${root}/site`);
});

test('copied example code renders without missing state, helpers or layout styles',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${served.url}/components/DsCheckbox/preview.html`);
  for(const card of components){
    const sources=JSON.parse(readFileSync(`${root}/components/${card.id}/examples.json`,'utf8'));
    for(const [id,source] of Object.entries(sources)){
      const code=source
        .replace(/^import \* as React from 'react';/m,'const React = window.React;')
        .replace(/^import \* as S from '@primasoftllc\/design-system';/m,'const S = window.AuroraWebDesignSystem_96e210;')
        .replace(/^import \{([^}]+)\} from 'react';/m,'const {$1} = window.React;')
        .replace(/^import \{([^}]+)\} from '@primasoftllc\/design-system';/m,'const {$1} = window.AuroraWebDesignSystem_96e210;')
        .replace(/^import '@primasoftllc\/design-system\/styles.css';\s*/m,'')
        .replace(/export \{ App as Example \};/,'window.CopiedExample = App;')
        .replace(/export function (\w+)/,'window.CopiedExample = function $1');
      const compiled=await transform(code,{loader:'jsx',format:'iife',jsxFactory:'React.createElement'});
      const rendered=await page.evaluate(async code=>{
        const host=document.createElement('div');document.body.append(host);
        window.eval(code);
        const root=ReactDOM.createRoot(host);
        root.render(React.createElement(window.CopiedExample));
        await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        const visible=host.childElementCount>0;
        root.unmount();host.remove();delete window.CopiedExample;
        return visible;
      },compiled.code);
      expect(rendered,`${card.id}/${id}`).toBe(true);
      expect(errors,`${card.id}/${id}`).toEqual([]);
    }
  }
});
test.afterAll(async()=>{
  served?.server.closeAllConnections();
  if(served)await new Promise(resolve=>served.server.close(resolve));
});

test('header and user-menu examples announce the selected action',async({page})=>{
  for(const card of ['DsAppHeader','DsUserMenu']){
    await page.goto(`${served.url}/index.html?card=${card}&appearance=dark&density=compact`);
    const frame=page.frameLocator('#preview');
    await frame.getByRole('button',{name:card==='DsAppHeader'?'a.ivanov':'Анна Иванова',exact:true}).first().click();
    await frame.getByRole('menuitem',{name:'Профиль',exact:true}).click();
    await expect(frame.getByRole('status',{name:'Результат выбора'}).first()).toHaveText('Выбрано: Профиль');
  }
});

test('action variants show their result inside the same example',async({page})=>{
  for(const [card,id,result] of [
    ['DsButton','razmery-i-ikonki','Выполнено действие «Экспорт CSV».'],
    ['DsButton','dlinnaya-podpis','Выполнено действие «Скачать отчёт по выбранным объектам».'],
    ['DsIconButton','sizes','Действие «sm» выполнено.'],
    ['DsFab','tones','Действие «primary» выполнено.'],
    ['DsFab','extended','Действие «Круглая» выполнено.'],
    ['DsFab','long-label','Объект добавлен в выбранную группу.'],
  ]){
    await page.goto(`${served.url}/index.html?card=${card}`);
    const demo=page.frameLocator('#preview').locator(`section[aria-labelledby="${id}"] [data-ds-example-demo]`);
    await demo.getByRole('button').first().click();
    await expect(demo.getByRole('status',{name:'Результат действия',exact:true})).toHaveText(result);
  }
});

test('long removable chip restores locally and keeps focus within its example',async({page})=>{
  await page.goto(`${served.url}/index.html?card=DsChip`);
  const demo=page.frameLocator('#preview').locator('section[aria-labelledby="dlinnye-i-nedostupnye-znacheniya"] [data-ds-example-demo]');
  await demo.getByRole('button',{name:/Убрать.*северо-западного/}).click();
  const restore=demo.getByRole('button',{name:'Восстановить длинное значение'});
  await expect(restore).toBeFocused();
  await expect(demo.getByRole('status')).toHaveText('Длинное значение удалено.');
  await restore.click();
  await expect(demo.getByRole('button',{name:/Убрать.*северо-западного/})).toBeVisible();
});

for(const card of components)test(`${card.id}: examples, code and contents work in all four modes`,async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
    await page.setViewportSize({width:1500,height:900});
    await page.goto(`${served.url}/index.html?card=${card.id}&theme=${theme}&appearance=${appearance}&density=${density}`);
    const frame=page.frameLocator('#preview');
    await expect(frame.locator('[data-ds-example-demo]').first()).toBeVisible();
    const headings=await frame.locator('.example-title').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
    expect(new Set(await frame.locator('.example-title').evaluateAll(nodes=>nodes.map(node=>node.id))).size).toBe(headings.length);
    await expect(frame.locator('.example-code')).toHaveCount(headings.length);
    await expect(frame.locator('.example-link')).toHaveCount(headings.length);
    for(const heading of headings)await expect(page.locator('.page-contents').getByRole('link',{name:heading,exact:true})).toHaveCount(1);
    await expect(frame.locator('[data-ds-example-demo]').first()).toHaveAttribute('data-ds-appearance',appearance);
    await expect(frame.locator('.live-examples')).toHaveAttribute('data-ds-appearance','light');
    await frame.locator('.example-code summary').first().click();
    await expect(frame.locator('.example-code').first().locator('pre code')).toContainText('@primasoftllc/design-system');
    await expect(frame.locator('.example-code').first().getByRole('button',{name:'Копировать код',exact:true})).toBeVisible();
    await page.setViewportSize({width:390,height:900});
    await expect.poll(()=>page.locator('#preview').evaluate(iframe=>iframe.contentDocument.documentElement.scrollWidth<=iframe.clientWidth)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  }
  await expect(page.locator('#compare')).toHaveCount(0);
  await expect(page.locator('#viewports iframe')).toHaveCount(1);
  for(let i=0;i<1;i++)await expect.poll(()=>page.locator('#preview').evaluate(iframe=>!!iframe.contentDocument?.querySelector('[data-ds-example-demo]')&&iframe.contentDocument.documentElement.scrollWidth<=iframe.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
});
