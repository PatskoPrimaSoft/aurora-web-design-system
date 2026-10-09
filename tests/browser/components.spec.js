import { test } from '@playwright/test';
import { captureCards } from '../../tools/baseline/render.mjs';
import { buildComponents } from '../../tools/build-components.mjs';
import { buildAll } from '../../tools/build.js';
import {readCards} from '../../tools/catalog/index.mjs';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync,readFileSync } from 'node:fs';
const root=fileURLToPath(new URL('../../',import.meta.url));
test('delivered previews match current source on overview, button, menu, table and list row',async({browser})=>{
 await buildAll({root});
 const cards=readCards(root).filter(c=>['overview','DsButton','DsMenu','DsTable','DsListRow'].includes(c.id));
 await buildComponents({root,outDir:root});
 mkdirSync(`${root}/site/tests/fixtures`,{recursive:true});writeFileSync(`${root}/site/tests/fixtures/cascade.html`,readFileSync(`${root}/tests/fixtures/cascade.html`));
 await captureCards({browser,root,cards,mode:'current',outDir:`${root}/.tmp/migration/components-source`});
 await captureCards({browser,root:`${root}/site`,cards,mode:'current',outDir:`${root}/.tmp/migration/components-delivered`,compareDir:`${root}/.tmp/migration/components-source`,referenceRoot:root,referenceMode:'current'});
});
