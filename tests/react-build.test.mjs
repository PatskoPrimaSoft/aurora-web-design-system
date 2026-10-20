import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {join, basename} from 'node:path';
import ts from 'typescript';
import {buildReact} from '../tools/build-react.mjs';

const root=fileURLToPath(new URL('..',import.meta.url));
await buildReact({root});
const runtime=await import(pathToFileURL(join(root,'dist/react/index.mjs')));
const program=ts.createProgram([join(root,'dist/react/index.d.ts')],{
  strict:true,noEmit:true,skipLibCheck:false,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,target:ts.ScriptTarget.ES2022,
});
const diagnostics=ts.getPreEmitDiagnostics(program);
assert.equal(diagnostics.length,0,ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCurrentDirectory:()=>root,getCanonicalFileName:f=>f,getNewLine:()=> '\n'}));
const checker=program.getTypeChecker();
const symbol=checker.getSymbolAtLocation(program.getSourceFile(join(root,'dist/react/index.d.ts')));
const declared=checker.getExportsOfModule(symbol).map(s=>s.flags&ts.SymbolFlags.Alias?checker.getAliasedSymbol(s):s).filter(s=>s.flags&ts.SymbolFlags.Value).map(s=>s.name).sort();
assert.deepEqual(Object.keys(runtime).sort(),declared,'Every runtime export must have a declaration');
const entry=readFileSync(join(root,'design-system/components/src/index.js'),'utf8');
const sourceNames=[];
for(const [,path] of entry.matchAll(/export \* from '([^']+)'/g)){
  const source=readFileSync(join(root,'design-system/components/src',path),'utf8');
  sourceNames.push(...[...source.matchAll(/export (?:function|const) (\w+)/g)].map(m=>m[1]));
  assert.ok(readFileSync(join(root,'dist/react',basename(path,'.jsx')+'.d.ts'),'utf8'));
}
assert.deepEqual(Object.keys(runtime).sort(),sourceNames.sort(),'Build preserves all source exports');
console.log('ok   React: compiled runtime and complete strict declarations');
