import { test } from '@playwright/test';
import { prepareBaseline, captureCards } from '../../tools/baseline/render.mjs';
import { buildComponents } from '../../tools/build-components.mjs';
import { buildDist } from '../../tools/build.js';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
const root=fileURLToPath(new URL('../../',import.meta.url));
test('fresh components match baseline on button, menu, table and object row',async({browser})=>{
 const baseline=await prepareBaseline(root);
 const cards=baseline.cards.filter(c=>['overview','DsButton','DsMenu','DsTable','DsListRow'].includes(c.id));
 await captureCards({browser,...baseline,cards,outDir:`${root}/.tmp/migration/components-old`});
 await buildComponents({root,outDir:root});
 const css=buildDist({root});mkdirSync(`${root}/dist`,{recursive:true});writeFileSync(`${root}/dist/styles.css`,css.styles);
 await captureCards({browser,root,cards,mode:'current',outDir:`${root}/.tmp/migration/components-new`,compareDir:`${root}/.tmp/migration/components-old`,referenceRoot:baseline.root,documentationChanges:['overview-count']});
});
