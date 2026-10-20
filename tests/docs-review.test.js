import {test} from 'node:test';import assert from 'node:assert/strict';import ts from 'typescript';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,readdirSync,copyFileSync,rmSync} from 'node:fs';import {join} from 'node:path';import {tmpdir} from 'node:os';import {fileURLToPath} from 'node:url';
import {extractApi} from '../tools/docs/api.mjs';import {buildCatalogue} from '../tools/catalog/build.mjs';import {fixtureRoot} from './helpers/build-root.js';
const root=fileURLToPath(new URL('../',import.meta.url)),apiFixture=join(root,'tests/fixtures/api');
function copy(from,to){mkdirSync(to,{recursive:true});for(const entry of readdirSync(from,{withFileTypes:true})){const src=join(from,entry.name),dest=join(to,entry.name);if(entry.isDirectory())copy(src,dest);else copyFileSync(src,dest);}}
function apiRoot(){const path=mkdtempSync(join(tmpdir(),'aurora-api-review-'));copy(apiFixture,path);return path;}
test('selected and renamed entry exports stay selected through intermediate barrels',()=>{
 const fixture=apiRoot();try{
  writeFileSync(join(fixture,'design-system/components/src/index.js'),"export {DsDemo,DsSibling,DsAlias as DsRenamed} from './barrel.js';");writeFileSync(join(fixture,'design-system/components/src/barrel.js'),"export * from './middle.js';");writeFileSync(join(fixture,'design-system/components/src/middle.js'),"export {DsDemo,DsSibling,DsArrow as DsAlias,DsPrivate} from './Demo.jsx';");
  const source=join(fixture,'design-system/components/src/Demo.jsx');writeFileSync(source,readFileSync(source,'utf8')+'\nexport function DsPrivate({secret}) {return <span>{secret}</span>;}');
  const declaration=join(fixture,'design-system/components/Contracts/Contracts.d.ts');writeFileSync(declaration,readFileSync(declaration,'utf8').replace('DsArrow','DsRenamed'));
  assert.deepEqual(extractApi({root:fixture}).map(c=>c.name),['DsDemo','DsRenamed','DsSibling']);
 }finally{rmSync(fixture,{recursive:true,force:true});}
});
test('literal default incompatible with its declared type fails without a default annotation',()=>{
 const fixture=apiRoot();try{const path=join(fixture,'design-system/components/src/Demo.jsx');writeFileSync(path,readFileSync(path,'utf8').replace("tone='primary'",'tone=42'));assert.throws(()=>extractApi({root:fixture}),/DsDemo\.tone.*(?:type|тип|default)/);}finally{rmSync(fixture,{recursive:true,force:true});}
});
test('one implementation can expose two public names through a barrel',()=>{
 const fixture=apiRoot();try{
  writeFileSync(join(fixture,'design-system/components/src/index.js'),"export {DsDemo,DsSibling,DsArrow,DsArrow as DsRenamed} from './barrel.js';");writeFileSync(join(fixture,'design-system/components/src/barrel.js'),"export * from './Demo.jsx';");
  const path=join(fixture,'design-system/components/Contracts/Contracts.d.ts');writeFileSync(path,readFileSync(path,'utf8')+'\nexport declare const DsRenamed: React.FC<{value:number}>;');
  assert.deepEqual(extractApi({root:fixture}).map(c=>c.name),['DsArrow','DsDemo','DsRenamed','DsSibling']);
 }finally{rmSync(fixture,{recursive:true,force:true});}
});
test('strings contracts accept supported flat keys, formatter calls and partial nested overrides',()=>{
 const scratch=mkdtempSync(join(root,'.tmp/strings-contract-'));
 try{
  const path=join(scratch,'usage.ts');writeFileSync(path,`import {DsStringsProvider,useDsStrings,DsStrings} from '../../design-system/components/DsStrings/DsStrings';
import {dsStringsRu as actualRu,dsStringsEn as actualEn} from '../../design-system/components/src/components/primitives/DsStrings.jsx';
const ru:DsStrings=actualRu;
const en:DsStrings=actualEn;
type MissingKeys=Exclude<keyof typeof actualRu,keyof DsStrings>|Exclude<keyof DsStrings,keyof typeof actualRu>;
const allKeysDeclared:MissingKeys extends never?true:false=true;
DsStringsProvider({strings:{close:'Close',removeItem:(label:string)=>'Remove '+label,state:{alarm:'Alarm'},table:{selectAllResults:(n:number)=>String(n)}}});
const close:string=useDsStrings().close;
const remove:string=useDsStrings().removeItem('name');
const alarm:string=useDsStrings().state.alarm;
`);
  const program=ts.createProgram([path],{strict:true,noEmit:true,allowJs:true,checkJs:false,jsx:ts.JsxEmit.Preserve,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,types:['react'],typeRoots:[join(root,'node_modules/@types')]});
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')),[]);
 }finally{rmSync(scratch,{recursive:true,force:true});}
});
test('catalogue build rejects a broken Markdown anchor with source and target diagnostics',async()=>{
 const fixture=fixtureRoot();try{writeFileSync(join(fixture,'design-system/components/Example/README.md'),'# Example\n\n[Broken](#does-not-exist)');await assert.rejects(buildCatalogue({root:fixture,outDir:join(fixture,'site')}),/components\/Example\/README\.md.*#does-not-exist.*missing-anchor/s);}finally{rmSync(fixture,{recursive:true,force:true});}
});
