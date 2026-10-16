import {test,expect} from '@playwright/test';import AxeBuilder from '@axe-core/playwright';
import {buildCatalogue} from '../../tools/catalog/build.mjs';import {prepareBaseline,serveRoot} from '../../tools/baseline/render.mjs';import {renderPreview} from '../../tools/catalog/preview.mjs';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const signature=result=>result.violations.flatMap(v=>v.nodes.map(n=>({id:v.id,impact:v.impact,target:n.target}))).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
test('catalogue shell has no AXE violations and keyboard focus remains visible',async({page})=>{
 await buildCatalogue({root,outDir:root+'/site'});const served=await serveRoot(root+'/site');
 try{
  await page.goto(served.url+'/index.html?card=DsButton');await expect(page.locator('#title')).toHaveText('Button');
  const result=await new AxeBuilder({page}).exclude('iframe').analyze();expect(result.violations).toEqual([]);
  for(const [theme,appearance,density]of [['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
   await page.goto(`${served.url}/index.html?card=DsButton&theme=${theme}&appearance=${appearance}&density=${density}`);await expect(page.locator('#title')).toHaveText('Button');expect((await new AxeBuilder({page}).exclude('iframe').analyze()).violations).toEqual([]);
  }
  await page.locator('#search').focus();await page.keyboard.type('DsButton');await page.keyboard.press('Tab');await expect(page.locator('nav a').first()).toBeFocused();
  expect(await page.locator('nav a').first().evaluate(el=>{const s=getComputedStyle(el);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0;})).toBe(true);
  for(const id of ['theme','appearance','density']){await page.locator('#'+id).focus();await expect(page.locator('#'+id)).toBeFocused();expect(await page.locator('#'+id).evaluate(el=>getComputedStyle(el.closest('[data-ds-field]')||el).outlineStyle)).not.toBe('none');}
  await expect(page.locator('#compare')).toHaveCount(0);await expect(page.locator('#viewports iframe')).toHaveCount(1);
  for(let i=0;i<1;i++){const frame=page.frameLocator('#preview');await expect(frame.getByRole('button').first()).toBeVisible();await frame.locator('html').evaluate(()=>document.fonts.ready);}
  await page.screenshot({path:root+'/.tmp/catalogue-review.png',fullPage:true});
  // Negative control proves that the label rule remains active.
  await page.locator('label[for="search"]').evaluate(el=>el.remove());await page.locator('#search').evaluate(el=>el.removeAttribute('placeholder'));
  expect((await new AxeBuilder({page}).exclude('iframe').analyze()).violations.some(v=>v.id==='label')).toBe(true);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
test('six interactive examples introduce no AXE violations beyond the original',async({page},testInfo)=>{
 const baseline=await prepareBaseline(root),selected=baseline.cards.filter(c=>['DsButton','DsTabs','DsMenu','DsDialog','DsCheckbox','DsTable'].includes(c.id)),pages=new Map();
 for(const card of selected)pages.set('/'+card.id+'.html',await renderPreview({root:baseline.root,card,mode:'legacy',scope:{theme:'DEFAULT',appearance:'light',density:'cozy'}}));
 const original=await serveRoot(baseline.root,pages),current=await serveRoot(root+'/site'),classified=[];
 try{
  for(const card of selected){const results=[];for(const url of [original.url+'/'+card.id+'.html',current.url+'/'+card.previewPath]){
   await page.goto(url);if(await page.locator('#root').count())await expect.poll(()=>page.locator('#root').evaluate(el=>el.childNodes.length)).toBeGreaterThan(0);await page.evaluate(()=>document.fonts.ready);results.push(signature(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()));
  }
  expect(results[1],card.id+': current WCAG accessibility violations').toEqual([]);classified.push({card:card.id,existingViolations:results[0]});
  console.log(card.id+': '+results[0].length+' existing AXE node violations; no introduced violations');
  }
  await testInfo.attach('existing-example-accessibility',{body:JSON.stringify(classified,null,2),contentType:'application/json'});
 }finally{for(const served of [original,current]){served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}}
});
