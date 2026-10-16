import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {preparePages,validateVersionTag} from '../tools/pages.mjs';

test('Pages accepts only the exact stable package version tag',()=>{
 assert.equal(validateVersionTag('v4.0.1','4.0.1'),'v4.0.1');
 for(const tag of ['master','v4.0.2','v4.0.1-beta.1','v04.0.1','v4.0.1;echo bad'])assert.throws(()=>validateVersionTag(tag,'4.0.1'));
});

test('Pages prefix covers nested documents and embedded card HTML without changing external URLs',()=>{
 const root=mkdtempSync(join(tmpdir(),'aurora-pages-'));
 try{
  mkdirSync(join(root,'docs'));
  writeFileSync(join(root,'index.html'),'<a href="/docs/guide.html#example">Guide</a><a href="https://example.com/docs/guide.html">External</a><script src="./app.js"></script>');
  writeFileSync(join(root,'app.js'),'const link="/index.html?card=DsType"; const api="/__status";');
  writeFileSync(join(root,'docs/guide.html'),'<script type="module">import "/app.js";</script><a href="/index.html?card=DsType">Back</a>');
  writeFileSync(join(root,'cards.json'),JSON.stringify([{documentationHtml:'<a href="/docs/guide.html#example">Guide</a>'}]));
  preparePages(root,'/aurora-web-design-system');
  assert.match(readFileSync(join(root,'index.html'),'utf8'),/href="\/aurora-web-design-system\/docs\/guide.html#example"/);
  assert.match(readFileSync(join(root,'index.html'),'utf8'),/href="https:\/\/example.com\/docs\/guide.html"/);
  assert.match(readFileSync(join(root,'docs/guide.html'),'utf8'),/import "\/aurora-web-design-system\/app.js"/);
  assert.match(JSON.parse(readFileSync(join(root,'cards.json'),'utf8'))[0].documentationHtml,/href="\/aurora-web-design-system\/docs\/guide.html#example"/);
  assert.match(readFileSync(join(root,'app.js'),'utf8'),/api="\/__status"/);
  assert.equal(readFileSync(join(root,'.nojekyll'),'utf8'),'');
  const once=readFileSync(join(root,'index.html'),'utf8');preparePages(root,'/aurora-web-design-system');assert.equal(readFileSync(join(root,'index.html'),'utf8'),once);
  assert.throws(()=>preparePages(root,'/../escape'));
 }finally{rmSync(root,{recursive:true,force:true});}
});
