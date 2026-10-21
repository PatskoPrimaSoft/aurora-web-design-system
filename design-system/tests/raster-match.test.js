import {test} from 'node:test';
import assert from 'node:assert/strict';
import {matchExactRaster,serveRoot} from '../tools/baseline/render.mjs';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('in-memory raster responses preserve HTTP bodies, MIME types and containment',async()=>{
 const root=mkdtempSync(join(tmpdir(),'aurora-raster-http-'));
 writeFileSync(join(root,'asset.css'),'body { color: red; }');
 writeFileSync(join(root,'font.woff2'),Buffer.from([0,1,2,127,128,254,255]));
 const served=await serveRoot(root,new Map([['/frame.html','<h1>Fixture</h1>']]));
 try{
  for(const path of ['/frame.html','/asset.css?v=1','/font.woff2','/missing.css','/%2e%2e%2foutside.css']){
   const response=await fetch(served.url+path),fixture=served.responseFor(served.url+path);
   assert.equal(fixture.status,response.status);
   assert.deepEqual(Buffer.from(fixture.body??''),Buffer.from(await response.arrayBuffer()));
   if(fixture.contentType)assert.equal(fixture.contentType,response.headers.get('content-type'));
  }
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));rmSync(root,{recursive:true,force:true});}
});

const image=value=>Buffer.from(value);
test('rare actual raster variant can settle to an exact original without a pixel tolerance',async()=>{
 let actualCaptures=0,referenceCaptures=0;
 const result=await matchExactRaster({actual:image('rare'),expected:image('usual'),
  captureActual:async()=>{actualCaptures++;return image('usual');},
  captureReference:async()=>{referenceCaptures++;return image('usual');}});
 assert.deepEqual(result,image('usual'));
 assert.equal(actualCaptures,1);assert.equal(referenceCaptures,1);
});
test('an exact reference variant can match the first actual render',async()=>{
 const result=await matchExactRaster({actual:image('variant'),expected:image('usual'),
  captureActual:async()=>{throw Error('No actual retry needed');},captureReference:async()=>image('variant')});
 assert.deepEqual(result,image('variant'));
});
test('a real visual difference is rejected after bounded retries of both sources',async()=>{
 let actualCaptures=0,referenceCaptures=0;
 const result=await matchExactRaster({actual:image('changed'),expected:image('original'),attempts:3,
  captureActual:async()=>{actualCaptures++;return image('changed');},
  captureReference:async()=>{referenceCaptures++;return image('original');}});
 assert.equal(result,null);assert.equal(actualCaptures,3);assert.equal(referenceCaptures,3);
});
test('an exact first render needs no retries',async()=>{
 const never=async()=>{throw Error('Unexpected capture');};
 assert.deepEqual(await matchExactRaster({actual:image('same'),expected:image('same'),captureActual:never,captureReference:never}),image('same'));
});
