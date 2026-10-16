import {test,expect} from '@playwright/test';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
import {chooseCatalogueScope} from './helpers/catalogue-scope.js';

const root=fileURLToPath(new URL('../../',import.meta.url));
test('preview settings preserve the light documentation shell and interactive state',async({page})=>{
  await buildCatalogue({root,outDir:`${root}/site`});
  const served=await serveRoot(`${root}/site`);
  try{
    await page.goto(`${served.url}/index.html?card=DsCheckbox`);
    const frame=page.frameLocator('#preview');
    const demo=frame.locator('[data-ds-example-demo]').first();
    await expect(demo).toBeVisible();
    const initialDemoBackground=await demo.evaluate(node=>getComputedStyle(node).backgroundColor);
    const initialDescriptionColor=await frame.locator('.example-description').first().evaluate(node=>getComputedStyle(node).color);
    const checkbox=frame.getByRole('checkbox',{name:'Отправка команд',exact:true});
    await checkbox.focus();
    await page.keyboard.press('Space');
    await expect(checkbox).not.toBeChecked();
    const shellStyle=()=>page.locator('main').evaluate(node=>{
      const style=getComputedStyle(node);
      return {background:style.backgroundColor,color:style.color,font:style.font};
    });
    const initial=await shellStyle();
    await chooseCatalogueScope(page,'theme','RED2');
    await chooseCatalogueScope(page,'appearance','dark');
    await chooseCatalogueScope(page,'density','compact');
    await expect(frame.locator('html')).toHaveAttribute('data-ds-appearance','dark');
    await expect(frame.locator('html')).toHaveAttribute('data-ds-theme','RED2');
    await expect(frame.locator('html')).toHaveAttribute('data-ds-density','compact');
    await expect(demo).toHaveAttribute('data-ds-appearance','dark');
    await expect(demo).toHaveAttribute('data-ds-theme','RED2');
    await expect(demo).toHaveAttribute('data-ds-density','compact');
    expect(await demo.evaluate(node=>getComputedStyle(node).backgroundColor)).not.toBe(initialDemoBackground);
    expect(await frame.locator('.example-description').first().evaluate(node=>getComputedStyle(node).color)).toBe(initialDescriptionColor);
    expect(await shellStyle()).toEqual(initial);
    await expect(checkbox).not.toBeChecked();
    await page.reload();
    await expect(page.locator('#appearance')).toContainText('Тёмное');
    expect(await shellStyle()).toEqual(initial);
    await expect(frame.locator('html')).toHaveAttribute('data-ds-appearance','dark');
  }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});

test('component page keeps one reading order, inline reference and responsive preview',async({page},testInfo)=>{
  const cards=await buildCatalogue({root,outDir:`${root}/site`});
  expect(cards.find(card=>card.id==='DsCheckbox').layout).toBe('component');
  const served=await serveRoot(`${root}/site`),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
      await page.setViewportSize({width:1280,height:900});
      await page.goto(`${served.url}/index.html?card=DsCheckbox&theme=${theme}&appearance=${appearance}&density=${density}`);
      await expect(page.locator('main h2')).toHaveText(['Живые примеры','Правила применения','Пример кода','Параметры','Токены']);
      await expect(page.locator('#reference-links')).toBeHidden();
      await expect(page.getByRole('table',{name:'Параметры DsCheckbox'}).getByRole('columnheader')).toHaveText(['Имя','Тип','По умолчанию','Описание']);
      await expect(page.getByRole('rowheader',{name:'onChange',exact:true})).toHaveCSS('white-space','nowrap');
      await expect(page.locator('#card-description')).not.toContainText('Исходник:');
      await expect(page.locator('#card-description pre code')).toContainText('onChange={setState}');
      await expect(page.locator('#card-description').getByText('ds-surface',{exact:true})).toHaveCount(1);
      const frame=page.frameLocator('#preview');
      await expect(frame.getByRole('checkbox',{name:'Все объекты группы',exact:true})).toHaveJSProperty('indeterminate',true);
      await frame.getByRole('checkbox',{name:'Все объекты группы',exact:true}).focus();
      await page.keyboard.press('Space');
      await expect(frame.getByRole('checkbox',{name:'Все объекты группы',exact:true})).toBeChecked();
      const fit=async()=>page.locator('#preview').evaluate(iframe=>({
        outer:iframe.getBoundingClientRect().height,
        content:iframe.contentDocument.body.getBoundingClientRect().height,
        overflow:iframe.contentDocument.documentElement.scrollWidth>iframe.clientWidth,
      }));
      await expect.poll(async()=>{const size=await fit();return Math.abs(size.outer-size.content)}).toBeLessThanOrEqual(3);
      await page.locator('main').evaluate(node=>node.scrollTop=0);
      await page.screenshot({path:testInfo.outputPath(`component-${theme}-${appearance}.png`),fullPage:true});
      await page.setViewportSize({width:390,height:900});
      await expect.poll(async()=>{const size=await fit();return Math.abs(size.outer-size.content)}).toBeLessThanOrEqual(3);
      expect((await fit()).overflow).toBe(false);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
      await expect(page.locator('#viewports .preview-scroll')).not.toHaveAttribute('tabindex');
      await page.locator('main').evaluate(node=>node.scrollTop=0);
      await page.screenshot({path:testInfo.outputPath(`component-mobile-${theme}-${appearance}.png`),fullPage:true});
      await expect(page.locator('#compare')).toHaveCount(0);
      await expect(page.locator('#viewports iframe')).toHaveCount(1);
      for(let index=0;index<1;index++)await expect.poll(()=>page.locator('#preview').evaluate(iframe=>iframe.contentDocument.documentElement.scrollWidth<=iframe.clientWidth)).toBe(true);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    }
    expect(errors).toEqual([]);
  }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});

test('tabs page groups both contracts before a single token reference',async()=>{
  const cards=await buildCatalogue({root,outDir:`${root}/site`});
  const card=cards.find(card=>card.id==='DsTabs');
  expect(card.layout).toBe('component');
  expect(card.apiHtml.match(/<h2\b/g)).toHaveLength(2);
  expect(card.apiHtml).toContain('Параметры DsTabs');
  expect(card.apiHtml).toContain('Параметры DsTabPanel');
  expect(card.apiHtml).toContain('>DsTabPanel</h3>');
  expect(card.apiHtml.match(/>Токены<\/h2>/g)).toHaveLength(1);
  expect(card.apiHtml.indexOf('Параметры DsTabPanel')).toBeLessThan(card.apiHtml.indexOf('>Токены</h2>'));
});


test('components with separate pages do not duplicate contracts from shared declarations',async()=>{
  const cards=await buildCatalogue({root,outDir:`${root}/site`});
  const spinner=cards.find(card=>card.id==='DsSpinner');
  const skeleton=cards.find(card=>card.id==='DsSkeleton');
  expect(spinner.apiPaths.map(entry=>entry.name)).toEqual(['DsSpinner']);
  expect(skeleton.apiPaths.map(entry=>entry.name)).toEqual(['DsSkeleton']);
});
