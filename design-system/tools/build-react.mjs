import {build} from 'esbuild';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join, basename} from 'node:path';
import {fileURLToPath} from 'node:url';

/** Публичный React-вход: JavaScript без JSX и канонические контракты компонентов. */
export async function buildReact({root=fileURLToPath(new URL('../..',import.meta.url))}={}) {
  const output=join(root,'dist/react');
  mkdirSync(output,{recursive:true});
  await build({entryPoints:[join(root,'design-system/components/src/index.js')],outfile:join(output,'index.mjs'),bundle:true,
    format:'esm',platform:'neutral',packages:'external',target:'es2022',charset:'utf8'});
  const entry=readFileSync(join(root,'design-system/components/src/index.js'),'utf8');
  const declarations=[];
  for(const [,source] of entry.matchAll(/export \* from '([^']+)'/g)) {
    const name=basename(source,'.jsx');
    let contract=readFileSync(join(root,'design-system/components',name,name+'.d.ts'),'utf8');
    // Старые контракты карточек использовали глобальный React namespace.
    if(!/import .*React.* from 'react'/.test(contract))contract="import type * as React from 'react';\n"+contract;
    writeFileSync(join(output,name+'.d.ts'),contract);
    declarations.push(`export * from './${name}.js';`);
  }
  writeFileSync(join(output,'index.d.ts'),declarations.join('\n')+'\n');
}
if(process.argv[1]===fileURLToPath(import.meta.url)){await buildReact();console.log('React: compiled ESM and declarations built');}
