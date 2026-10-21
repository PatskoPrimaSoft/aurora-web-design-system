import assert from'node:assert/strict';import{existsSync,readdirSync,readFileSync,rmSync,writeFileSync}from'node:fs';import{join}from'node:path';import{createHash}from'node:crypto';
import{buildAll}from'../tools/build.js';import{fixtureRoot}from'../design-system/tests/helpers/build-root.js';
const root=fixtureRoot();const digest=()=>{const files={};const walk=(dir)=>{for(const e of readdirSync(join(root,dir),{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())walk(p);else files[p]=createHash('sha256').update(readFileSync(join(root,p))).digest('hex');}};walk('dist');walk('site');walk('.tmp/package');return files;};
try{
 await buildAll({root});const first=digest();
 const stale=join(root,'.tmp/package/removed-source.js');writeFileSync(stale,'stale');
 await buildAll({root});assert.equal(existsSync(stale),false,'stale package files must be removed');assert.deepEqual(digest(),first);
 const file=join(root,'design-system/components/Example/preview.html');writeFileSync(file,readFileSync(file,'utf8').replace('hello','new source'));await buildAll({root});assert.notEqual(digest()['site/design-system/components/Example/preview.html'],first['site/design-system/components/Example/preview.html']);
 const source=join(root,'design-system/tokens/source.json');writeFileSync(source,'{');await assert.rejects(buildAll({root}));assert.ok(readFileSync(join(root,'site/design-system/components/Example/preview.html'),'utf8').includes('new source'),'last complete catalogue survives build failure');
}finally{rmSync(root,{recursive:true,force:true});}
console.log('deterministic-build: equal bytes, fresh source changes and atomic failure passed');
