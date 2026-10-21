import assert from'node:assert/strict';import{existsSync,readFileSync,rmSync}from'node:fs';import{join}from'node:path';
import{buildAll}from'../tools/build.js';import{fixtureRoot}from'../design-system/tests/helpers/build-root.js';
const root=fixtureRoot();try{
 assert.equal(existsSync(join(root,'design-system/components/bundle.js')),false);
 assert.equal(existsSync(join(root,'tokens.json')),false);
 await buildAll({root});
 for(const file of ['dist/styles.css','dist/tokens.css','tokens.json','site/index.html','site/cards.json','site/runtime.js','.tmp/runtime/components.js','design-system/components/bundle.js'])assert.ok(existsSync(join(root,file)),file);
 assert.equal(JSON.parse(readFileSync(join(root,'site/cards.json'))).length,2);
}finally{rmSync(root,{recursive:true,force:true});}
console.log('clean-build: sources in a spaced/Cyrillic path produce package and catalogue without saved bundles');
