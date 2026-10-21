import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {join} from 'node:path';import {tmpdir} from 'node:os';import {fileURLToPath} from 'node:url';
import {validateLinks} from '../tools/docs/links.mjs';
const fixture=mkdtempSync(join(tmpdir(),'aurora-links-'));
try{
 mkdirSync(join(fixture,'design-system/components/Demo'),{recursive:true});
 writeFileSync(join(fixture,'README.md'),'# Start\n\n[Encoded](guide%20name.md#hello-world)\n[Card](design-system/components/Demo/README.md#props)');
 writeFileSync(join(fixture,'guide name.md'),'# Hello world');writeFileSync(join(fixture,'design-system/components/Demo/README.md'),'# Props');
 assert.deepEqual(validateLinks({root:fixture}),[]);
 writeFileSync(join(fixture,'README.md'),'[Missing](missing.md)\n[Anchor](guide%20name.md#absent)\n[Case](Guide%20name.md)');
 const problems=validateLinks({root:fixture});assert.equal(problems.length,3);assert.ok(problems.some(p=>p.reason==='missing-anchor'));assert.ok(problems.every(p=>p.source==='README.md'&&p.target));
 mkdirSync(join(fixture,'site'));writeFileSync(join(fixture,'site/index.html'),'<html><body><a href="x.html#target">x</a></body></html>');writeFileSync(join(fixture,'site/x.html'),'<html><body id="target"><img src="missing.png"></body></html>');
 assert.ok(validateLinks({root:fixture,siteRoot:join(fixture,'site')}).some(p=>p.source==='site/x.html'&&p.target==='missing.png'));
}finally{rmSync(fixture,{recursive:true,force:true});}
const root=fileURLToPath(new URL('../../',import.meta.url));
assert.deepEqual(validateLinks({root,siteRoot:join(root,'site')}),[]);
for(const name of ['design-system/docs/usage.md','CONTRIBUTING.md','docs/release.md','README.md'])assert.doesNotMatch(readFileSync(join(root,name),'utf8'),/SYNC\.md|tokens\/focus\.css|tokens\/field\.css|manifest\.json/);
console.log('docs-links: source/site targets, encoded names, case and anchors passed');
