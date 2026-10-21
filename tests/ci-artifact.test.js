import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,appendFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {sourceFingerprint,sealPackage,restorePackage,findReusable} from '../tools/ci-artifact.mjs';

const git=(root,...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
function fixture(){
 const root=mkdtempSync(join(tmpdir(),'aurora-artifact-'));
 git(root,'init','-q');
 git(root,'config','core.autocrlf','false');
 const pkg={name:'@primasoftllc/design-system',version:'5.2.1',scripts:{build:'node build.js'},devDependencies:{test:'1'},exports:{'.':'./dist/index.mjs'}};
 writeFileSync(join(root,'package.json'),JSON.stringify(pkg));
 writeFileSync(join(root,'package-lock.json'),JSON.stringify({version:pkg.version,packages:{'':{version:pkg.version},test:{version:'1'}}}));
 writeFileSync(join(root,'CHANGELOG.md'),'## [Unreleased]\n\nNew component\n');
 writeFileSync(join(root,'.gitignore'),'.tmp/\n');
 writeFileSync(join(root,'source.js'),'export const value=1;');
 commit(root);
 mkdirSync(join(root,'.tmp/package/dist'),{recursive:true});
 const published={...pkg};delete published.scripts;delete published.devDependencies;
 writeFileSync(join(root,'.tmp/package/package.json'),JSON.stringify(published));
 writeFileSync(join(root,'.tmp/package/dist/index.mjs'),'export const value=1;');
 writeFileSync(join(root,'.tmp/package/CHANGELOG.md'),'## [Unreleased]\n\nNew component\n');
 return root;
}
function commit(root,message='fixture'){git(root,'add','.');git(root,'-c','user.name=Test','-c','user.email=test@example.invalid','commit','-qm',message);return git(root,'rev-parse','HEAD');}
test('source fingerprint ignores only release notes and version fields',()=>{
 const root=fixture();try{
  const original=sourceFingerprint(root);
  for(const path of ['package.json','package-lock.json']){
   const value=JSON.parse(readFileSync(join(root,path)));value.version='5.3.0';if(value.packages)value.packages[''].version='5.3.0';
   writeFileSync(join(root,path),JSON.stringify(value));
  }
  writeFileSync(join(root,'CHANGELOG.md'),'## [5.3.0]\n\nFinal notes\n');commit(root);
  assert.equal(sourceFingerprint(root),original);
  writeFileSync(join(root,'source.js'),'export const value=2;');commit(root);
  assert.notEqual(sourceFingerprint(root),original);
  const before=sourceFingerprint(root),pkg=JSON.parse(readFileSync(join(root,'package.json')));pkg.scripts.build='different';
  writeFileSync(join(root,'package.json'),JSON.stringify(pkg));commit(root);assert.notEqual(sourceFingerprint(root),before);
  const lockBefore=sourceFingerprint(root),lock=JSON.parse(readFileSync(join(root,'package-lock.json')));lock.packages.test.version='2';
  writeFileSync(join(root,'package-lock.json'),JSON.stringify(lock));commit(root);assert.notEqual(sourceFingerprint(root),lockBefore);
  const workflowBefore=sourceFingerprint(root);mkdirSync(join(root,'.github/workflows'),{recursive:true});
  writeFileSync(join(root,'.github/workflows/ci.yml'),'changed workflow');commit(root);assert.notEqual(sourceFingerprint(root),workflowBefore);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('verified package retains compiled bytes while adopting release metadata; tampering is rejected',()=>{
 const root=fixture();try{
  const bundle=join(root,'.tmp/verified'),sha=git(root,'rev-parse','HEAD');sealPackage({root,bundle});
  writeFileSync(join(root,'source.js'),'uncommitted change');
  assert.throws(()=>restorePackage({root,bundle,expectedSha:sha}),/dirty source tree/);
  git(root,'checkout','--','source.js');
  for(const path of ['package.json','package-lock.json']){
   const value=JSON.parse(readFileSync(join(root,path)));value.version='5.3.0';if(value.packages)value.packages[''].version='5.3.0';
   writeFileSync(join(root,path),JSON.stringify(value));
  }
  writeFileSync(join(root,'CHANGELOG.md'),'## [5.3.0]\n\nFinal notes\n');commit(root);
  restorePackage({root,bundle,expectedSha:sha});
  assert.equal(readFileSync(join(root,'.tmp/package/dist/index.mjs'),'utf8'),'export const value=1;');
  assert.equal(readFileSync(join(root,'.tmp/package/CHANGELOG.md'),'utf8'),'## [5.3.0]\n\nFinal notes\n');
  assert.equal(JSON.parse(readFileSync(join(root,'.tmp/package/package.json'))).version,'5.3.0');
  assert.throws(()=>restorePackage({root,bundle,expectedSha:'0'.repeat(40)}),/source SHA/);
  appendFileSync(join(bundle,'package.tar'),'corruption');
  assert.throws(()=>restorePackage({root,bundle,expectedSha:sha}),/archive digest/);
  assert.equal(readFileSync(join(root,'.tmp/package/dist/index.mjs'),'utf8'),'export const value=1;','invalid archive must not replace the existing package');
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('promotion requires a successful same-repository develop push, ancestor, matching sources and live artifact',async()=>{
 const root=fixture();try{
  const sha=git(root,'rev-parse','HEAD'),repo='owner/repo';
  const run={id:7,event:'push',status:'completed',conclusion:'success',head_branch:'develop',head_sha:sha,path:'.github/workflows/ci.yml',head_repository:{full_name:repo}};
  const artifact={id:8,name:'verified-package',expired:false};
  const request=async path=>path.includes('/artifacts')?{artifacts:[artifact]}:{workflow_runs:[run]};
  assert.equal((await findReusable({root,repository:repo,sha,request})).runId,7);
  for(const patch of [{conclusion:'failure'},{event:'pull_request'},{head_branch:'master'},{head_repository:{full_name:'fork/repo'}},{path:'different.yml'},{head_sha:'0'.repeat(40)}]){
   const bad=async path=>path.includes('/artifacts')?{artifacts:[artifact]}:{workflow_runs:[{...run,...patch}]};
   assert.equal(await findReusable({root,repository:repo,sha,request:bad}),null);
  }
  artifact.expired=true;assert.equal(await findReusable({root,repository:repo,sha,request}),null);
  artifact.expired=false;
  git(root,'checkout','--orphan','unrelated');commit(root,'unrelated fixture');const unrelated=git(root,'rev-parse','HEAD');
  git(root,'checkout',sha);
  const foreign=async path=>path.includes('/artifacts')?{artifacts:[artifact]}:{workflow_runs:[{...run,head_sha:unrelated}]};
  assert.equal(await findReusable({root,repository:repo,sha,request:foreign}),null,'identical content on an unrelated branch must not be promoted');
  writeFileSync(join(root,'source.js'),'changed');
  assert.throws(()=>sealPackage({root,bundle:join(root,'.tmp/dirty')}),/dirty source tree/);
  commit(root);
  assert.equal(await findReusable({root,repository:repo,sha:git(root,'rev-parse','HEAD'),request}),null);
 }finally{rmSync(root,{recursive:true,force:true});}
});
