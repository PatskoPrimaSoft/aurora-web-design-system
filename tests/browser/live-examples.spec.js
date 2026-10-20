import {test,expect} from '@playwright/test';
import {writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {fixtureRoot} from '../helpers/build-root.js';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {chooseCatalogueScope} from './helpers/catalogue-scope.js';

test('shared examples render on another card with optional description and code, independent scope and working links',async({page,context})=>{
 const root=fixtureRoot();let served;
 const source="import { DsCheckbox } from '@primasoftllc/design-system';\n\nexport function Example() {\n  return <DsCheckbox label=\"Объект\" />;\n}\n";
 try{
  writeFileSync(join(root,'design-system/components/Example/examples.json'),JSON.stringify({'choose-object':source}));
  writeFileSync(join(root,'design-system/components/Example/preview.html'),`<!-- @dsCard layout="component" scopeMode="inherit" group="Examples" height=300 subtitle="Общий шаблон" -->
   <html><head></head><body data-ds-examples><div id="root"></div>
   <script type="application/json" id="example-code-sources" data-ds-example-sources="examples.json"></script>
   <script type="text/babel">
   const {LiveExamples,LiveExample}=window.DsLiveExamples;
   const {DsCheckbox}=window.AuroraWebDesignSystem_96e210;
   function App(){const [value,setValue]=React.useState('unchecked');return <LiveExamples>
    <LiveExample id="choose-object" title="Выбор объекта" description="Выберите объект."><DsCheckbox label="Объект" state={value} onChange={setValue}/></LiveExample>
    <LiveExample id="plain-example" title="Без кода"><p style={{minHeight:400}}>Простая демонстрация</p></LiveExample>
   </LiveExamples>;}
   ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
   </script></body></html>`);
  await buildCatalogue({root,outDir:join(root,'site')});served=await serveRoot(join(root,'site'));
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:served.url});
  await page.setViewportSize({width:1500,height:500});
  await page.goto(served.url+'/index.html?card=Example');
  const preview=page.frameLocator('#preview'),example=preview.getByRole('region',{name:'Выбор объекта',exact:true});
  await expect(example.locator('.example-description')).toHaveText('Выберите объект.');
  const plain=preview.getByRole('region',{name:'Без кода',exact:true});
  await expect(plain.locator('.example-description')).toHaveCount(0);
  await expect(plain.locator('.example-code')).toHaveCount(0);
  await expect(page.getByRole('navigation',{name:'На этой странице'}).locator('ul ul a')).toHaveText(['Выбор объекта','Без кода']);
  const checkbox=example.getByRole('checkbox');await checkbox.focus();await page.keyboard.press('Space');
  await example.locator('summary').click();
  const textColor=await example.locator('h3').evaluate(node=>getComputedStyle(node).color);
  for(const [field,value]of [['theme','RED2'],['appearance','dark'],['density','compact']])await chooseCatalogueScope(page,field,value);
  await expect(example.locator('[data-ds-example-demo]')).toHaveAttribute('data-ds-theme','RED2');
  await expect(example.locator('[data-ds-example-demo]')).toHaveAttribute('data-ds-appearance','dark');
  await expect(example.locator('[data-ds-example-demo]')).toHaveAttribute('data-ds-density','compact');
  expect(await example.locator('h3').evaluate(node=>getComputedStyle(node).color)).toBe(textColor);
  await expect(checkbox).toBeChecked();await expect(example.locator('details')).toHaveAttribute('open','');
  await example.getByRole('button',{name:'Копировать код',exact:true}).click();
  await expect(example.locator('.code-copy-status')).toHaveText('Скопировано');
  expect((await page.evaluate(()=>navigator.clipboard.readText())).replaceAll('\r\n','\n')).toBe(source);
  await example.getByRole('button',{name:/Копировать ссылку на пример/}).click();
  await expect(example.locator('.example-link-status')).toHaveText('Ссылка скопирована');
  const link=new URL(await page.evaluate(()=>navigator.clipboard.readText()));
  expect(link.searchParams.get('card')).toBe('Example');expect(link.hash).toBe('#example-choose-object');
  await page.goto(link.href);
  await expect(page.getByRole('navigation',{name:'На этой странице'}).getByRole('link',{name:'Выбор объекта',exact:true})).toHaveAttribute('aria-current','location');
  await page.goto(served.url+'/design-system/components/Example/preview.html');
  await expect(page.getByRole('region',{name:'Без кода',exact:true})).toBeVisible();
 }finally{await page.close();if(served){served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}rmSync(root,{recursive:true,force:true});}
});
