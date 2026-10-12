import assert from'node:assert/strict';import{readFileSync,writeFileSync,rmSync}from'node:fs';import{join}from'node:path';
import{startDev}from'../tools/dev.mjs';import{fixtureRoot}from'./helpers/build-root.js';
const root=fixtureRoot();let dev;
const waitFor=async predicate=>{const end=Date.now()+15000;while(Date.now()<end){if(await predicate())return;await new Promise(r=>setTimeout(r,50));}throw Error('dev event timed out');};
try{
 dev=await startDev({root,port:0});assert.equal((await fetch(dev.url)).status,200);
 const previewResponse=await fetch(dev.url+'/components/Example/preview.html');const preview=await previewResponse.text();assert.ok(preview.includes("fetch('/__status'"),'standalone preview checks for rebuilds without an open stream');assert.equal(previewResponse.headers.get('cache-control'),'no-store');
 assert.equal((await fetch(dev.url+'/%2e%2e%2fpackage.json')).status,403);
 const status=async()=>await(await fetch(dev.url+'/__status')).json();const initial=await status();assert.equal(initial.error,null);
 const tokens=join(root,'tokens/source.json');const original=readFileSync(tokens,'utf8');const invalid=JSON.parse(original);invalid.color.tokens[0].value='{ds-broken-reference}';writeFileSync(tokens,JSON.stringify(invalid));
 await waitFor(async()=> (await status()).error?.includes('ds-broken-reference'));
 assert.equal((await status()).version,initial.version,'failed build keeps the previous successful version');
 assert.equal((await fetch(dev.url)).status,200,'previous successful output remains readable with explicit build error');
 const path=join(root,'components/Example/preview.html');writeFileSync(path,readFileSync(path,'utf8').replace('hello','recovered'));
 writeFileSync(tokens,original);await waitFor(async()=> (await status()).version!==initial.version);
 await waitFor(async()=> (await(await fetch(dev.url+'/components/Example/preview.html')).text()).includes('recovered'));
 assert.equal((await status()).error,null);
}finally{if(dev)await dev.close();rmSync(root,{recursive:true,force:true});}
console.log('dev-server: loopback, traversal rejection, explicit build error and recovery passed');
