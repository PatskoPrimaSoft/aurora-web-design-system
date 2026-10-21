/** Собирает пакет из канонических исходников, сохраняя прежний buildDist API. */
import { fileURLToPath } from 'node:url';
import { buildTokens } from '../design-system/tools/tokens/build.mjs';
import { join } from 'node:path';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, renameSync, rmSync, existsSync } from 'node:fs';
import { buildCatalogue } from '../design-system/tools/catalog/build.mjs';
import { buildAngular } from '../ng-ui-kit/tools/build-angular.mjs';
import { buildReact } from '../design-system/tools/build-react.mjs';
import { buildCompatibility } from './build-compatibility.mjs';
export function buildDist({root = fileURLToPath(new URL('..', import.meta.url))} = {}) {
  const {styles, tokens} = buildTokens({root});
  return {styles, tokens};
}
export async function buildAll({root = fileURLToPath(new URL('..', import.meta.url))} = {}) {
  buildCompatibility({root});
  await buildReact({root});
  if(existsSync(join(root,'ng-ui-kit/tsconfig.lib.json')))await buildAngular({root});
  const temporary = join(root,'.tmp');mkdirSync(temporary,{recursive:true});
  const stage = mkdtempSync(join(temporary,'catalogue-build-'));
  const previous = join(stage,'previous-site');
  let cards;
  try {
    cards = await buildCatalogue({root,outDir:join(stage,'site')});
    if(existsSync(join(root,'site')))renameSync(join(root,'site'),previous);
    try{renameSync(join(stage,'site'),join(root,'site'));}catch(error){if(existsSync(previous))renameSync(previous,join(root,'site'));throw error;}
    const runtime=join(root,'.tmp/runtime');mkdirSync(runtime,{recursive:true});
    for(const name of ['runtime.js','components.js'])writeFileSync(join(runtime,name),readFileSync(join(root,'site',name)));
    writeFileSync(join(root,'design-system/components/bundle.js'),readFileSync(join(runtime,'components.js')));
  } finally { rmSync(stage,{recursive:true,force:true}); }
  return {cards};
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const {cards} = await buildAll({root});
  console.log(`Catalogue: ${cards.length} cards`);
}
