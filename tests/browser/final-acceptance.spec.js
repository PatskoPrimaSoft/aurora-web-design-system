import {test,expect} from '@playwright/test';import {fileURLToPath} from 'node:url';import {join} from 'node:path';import {readFileSync,writeFileSync,readdirSync,mkdirSync,rmSync} from 'node:fs';
import {buildCatalogue} from '../../tools/catalog/build.mjs';import {serveRoot} from '../../tools/baseline/render.mjs';import {fixtureRoot} from '../helpers/build-root.js';import {startDev} from '../../tools/dev.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
test('complete generated site and four-way comparison work without external requests',async({page})=>{
 test.setTimeout(120000);const cards=await buildCatalogue({root,outDir:root+'/site'}),served=await serveRoot(root+'/site'),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.route('**/*',route=>{const url=route.request().url();if(url.startsWith(served.url+'/')||/^(?:data:|blob:)/.test(url))return route.continue();external.push(url);return route.abort();});
 const paths=[];const walk=(folder,prefix='')=>{for(const entry of readdirSync(folder,{withFileTypes:true})){const path=prefix+entry.name;if(entry.isDirectory())walk(join(folder,entry.name),path+'/');else if(path.endsWith('.html'))paths.push(path);}};walk(root+'/site');
 try{
  for(const path of paths){await page.goto(served.url+'/'+path);if(await page.locator('#root').count())await expect.poll(()=>page.locator('#root').evaluate(el=>el.childNodes.length)).toBeGreaterThan(0);await page.evaluate(()=>document.fonts.ready);expect(errors,path).toEqual([]);}
  await page.goto(served.url+'/index.html?card=DsButton&compare=1');await expect(page.locator('#viewports iframe')).toHaveCount(1);
  for(let i=0;i<1;i++)await expect(page.frameLocator('#preview').getByRole('button').first()).toBeVisible();
  expect(await page.evaluate(async()=>{const checks=[['Inter Tight',400],['Inter Tight',500],['Inter Tight',600],['Inter Tight',700],['JetBrains Mono',400],['JetBrains Mono',500],['Material Symbols Outlined',400]];return Promise.all(checks.map(async([family,weight])=>{const faces=await document.fonts.load(`${weight} 14px "${family}"`,'Объект123');return faces.length>0&&faces.every(f=>f.status==='loaded');}));})).toEqual(Array(7).fill(true));
  expect(new Set(cards.map(card=>card.id)).size).toBe(cards.length);expect(cards.some(card=>card.id==='overview')).toBe(true);expect(external).toEqual([]);expect(errors).toEqual([]);console.log(`offline: ${paths.length} HTML pages, ${cards.length} previews, comparison and seven fonts passed`);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
test('fixture token, card and broken contract edits rebuild and recover in dev',async({page})=>{
 const fixture=fixtureRoot();let dev;
 try{
  dev=await startDev({root:fixture,port:0});await page.goto(dev.url+'/api/tokens.html');
  const source=join(fixture,'tokens/source.json'),model=JSON.parse(readFileSync(source,'utf8'));model.color.tokens.find(t=>t.name==='ds-n-0').value='#fefdfc';writeFileSync(source,JSON.stringify(model));
  await expect(page.locator('#ds-n-0')).toContainText('#fefdfc');await expect.poll(async()=>await(await page.request.get(dev.url+'/dist/styles.css')).text()).toContain('#fefdfc');
  await page.goto(dev.url+'/index.html');mkdirSync(join(fixture,'components/NewCard'));writeFileSync(join(fixture,'components/NewCard/preview.html'),'<!-- @dsCard name="Fresh discovered card" group="New" --><html><head></head><body>new example</body></html>');
  await expect(page.locator('nav a[data-id="NewCard"]')).toBeVisible();await page.locator('#search').fill('Fresh');await expect(page.locator('nav a[data-id]')).toHaveCount(1);
  const contract=join(fixture,'components/DsButton/DsButton.d.ts'),original=readFileSync(contract,'utf8');writeFileSync(contract,original.replace('tone?:',"/** @default 'secondary' */ tone?:"));
  await expect(page.locator('#build-error')).toContainText('DsButton.tone: @default differs from implementation');await expect(page.locator('nav a[data-id="NewCard"]')).toBeVisible();
  writeFileSync(contract,original);await expect(page.locator('#build-error')).toBeHidden();await expect(page.locator('nav a[data-id="NewCard"]')).toBeVisible();
  writeFileSync(contract,original+'\nexport declare const invalidContract: MissingContractType;');await expect(page.locator('#build-error')).toContainText('MissingContractType');writeFileSync(contract,original);await expect(page.locator('#build-error')).toBeHidden();
  const readme=join(fixture,'components/Example/README.md');writeFileSync(readme,'# Example\n\n[Broken](#does-not-exist)');await expect(page.locator('#build-error')).toContainText('missing-anchor');await expect(page.locator('#build-error')).toContainText('#does-not-exist');await expect(page.locator('nav a[data-id="NewCard"]')).toBeVisible();
  writeFileSync(readme,'# Example\n\n[Valid](#example)');await expect(page.locator('#build-error')).toBeHidden();await expect(page.locator('nav a[data-id="NewCard"]')).toBeVisible();
 }finally{await page.goto('about:blank');if(dev)await dev.close();rmSync(fixture,{recursive:true,force:true});}
});
