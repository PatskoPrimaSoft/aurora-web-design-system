import { test, expect } from '@playwright/test';
import { prepareBaseline, captureCards } from '../../tools/baseline/render.mjs';
import { fileURLToPath } from 'node:url';
import {buildAll} from '../../tools/build.js';
import{readFileSync,writeFileSync,mkdirSync,cpSync,rmSync,mkdtempSync}from'node:fs';
import {readCards} from '../../tools/catalog/index.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
test('baseline is pinned and repeated pixels match original renders offline', async ({ browser }) => {
  test.setTimeout(600000);
  const baseline = await prepareBaseline(root);
  expect(baseline.cards).toHaveLength(69);
  await captureCards({ browser, ...baseline, outDir: `${root}/.tmp/migration/capture-a` });
  await captureCards({ browser, ...baseline, outDir: `${root}/.tmp/migration/capture-b`, compareDir: `${root}/.tmp/migration/capture-a` });
});
test('current catalogue renders all discovered pages in four scopes after approved component changes',async({browser})=>{
 test.setTimeout(600000);
 const baseline=await prepareBaseline(root);
 await buildAll({root});
 mkdirSync(`${root}/site/tests/fixtures`,{recursive:true});writeFileSync(`${root}/site/tests/fixtures/cascade.html`,readFileSync(`${baseline.root}/tests/fixtures/cascade.html`));
 const cards=readCards(root);
 expect(cards.some(card=>card.id==='DsCheckbox')).toBe(true);
 expect(cards.some(card=>['DsBadge','DsFilterBar','DsObjectRow','DsSelectionBar'].includes(card.id))).toBe(false);
 await captureCards({browser,root:`${root}/site`,cards,mode:'current',outDir:`${root}/.tmp/migration/full-new`});
});

test('repeated original renders never accept an intentionally changed preview',async({browser})=>{
 await buildAll({root});
 const baseline=await prepareBaseline(root),cards=readCards(root).filter(c=>['overview','Admin'].includes(c.id));
 mkdirSync(`${root}/site/tests/fixtures`,{recursive:true});writeFileSync(`${root}/site/tests/fixtures/cascade.html`,readFileSync(`${baseline.root}/tests/fixtures/cascade.html`));
 const referenceRoot=mkdtempSync(`${root}/.tmp/migration/current-reference-`);
 cpSync(`${root}/site`,referenceRoot,{recursive:true});
 const outDir=`${root}/.tmp/migration/negative-old`;
 const path=`${root}/site/design-system/components/Admin/preview.html`,original=readFileSync(path,'utf8');
 try{
  await captureCards({browser,root:referenceRoot,cards,mode:'current',outDir});
  writeFileSync(path,original.replace('</head>','<style>#root{opacity:.5!important}</style></head>'));
  await expect(captureCards({browser,root:`${root}/site`,cards:cards.filter(c=>c.id==='Admin'),mode:'current',outDir:`${root}/.tmp/migration/negative-new`,compareDir:outDir,referenceRoot,referenceMode:'current'})).rejects.toThrow(/visual mismatch/);
 }finally{writeFileSync(path,original);rmSync(referenceRoot,{recursive:true,force:true});}
});
