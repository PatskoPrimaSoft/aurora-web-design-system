import {createHash} from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync,lstatSync,mkdirSync,mkdtempSync,rmSync,cpSync,appendFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const git=(root,...args)=>execFileSync('git',args,{cwd:root,stdio:['ignore','pipe','pipe']});
export function sourceFingerprint(root,ref='HEAD'){
 const entries=git(root,'ls-tree','-rz','--full-tree',ref).toString().split('\0').filter(Boolean);
 const records=entries.map(entry=>{
  const [,mode,type,oid,path]=/^(\d+) (\w+) (\w+)\t([\s\S]+)$/.exec(entry);
  if(path==='CHANGELOG.md')return null;
  if(type!=='blob')throw Error(`Unsupported Git entry: ${path}`);
  if(!['package.json','package-lock.json'].includes(path))return [mode,path,oid];
  const value=JSON.parse(git(root,'show',`${ref}:${path}`).toString());
  value.version='<release-version>';
  if(path==='package-lock.json'&&value.packages?.[''])value.packages[''].version='<release-version>';
  return [mode,path,digest(JSON.stringify(value))];
 }).filter(Boolean);
 return digest(JSON.stringify(records));
}

function files(directory,prefix=''){
 const result={};
 for(const name of readdirSync(join(directory,prefix)).sort()){
  assert.ok(!/[\r\n\\]/.test(name),'Unsupported artifact filename');
  const path=prefix?prefix+'/'+name:name,info=lstatSync(join(directory,path));
  if(info.isDirectory())Object.assign(result,files(directory,path));
  else {assert.ok(info.isFile(),`Unsupported artifact entry: ${path}`);result[path]=digest(readFileSync(join(directory,path)));}
 }
 return result;
}
function tar(root,...args){return execFileSync('tar',args,{cwd:root,encoding:'utf8',maxBuffer:10*1024*1024});}
function assertClean(root){assert.equal(git(root,'status','--porcelain','--untracked-files=normal').toString().trim(),'','Cannot use an artifact with a dirty source tree');}
export function sealPackage({root,bundle}){
 assertClean(root);
 mkdirSync(bundle,{recursive:true});
 const sourceSha=git(root,'rev-parse','HEAD').toString().trim(),pkg=JSON.parse(readFileSync(join(root,'.tmp/package/package.json')));
 const manifest={schema:1,sourceSha,fingerprint:sourceFingerprint(root),name:pkg.name,version:pkg.version,files:files(join(root,'.tmp/package'))};
 tar(root,'-cf',join(bundle,'package.tar'),'.tmp/package');
 manifest.archiveDigest=digest(readFileSync(join(bundle,'package.tar')));
 writeFileSync(join(bundle,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}
export function restorePackage({root,bundle,expectedSha}){
 assertClean(root);
 const manifest=JSON.parse(readFileSync(join(bundle,'manifest.json'))),archive=join(bundle,'package.tar');
 assert.equal(manifest.schema,1,'Unsupported artifact schema');
 assert.equal(manifest.sourceSha,expectedSha,'Artifact source SHA differs from successful workflow');
 assert.equal(manifest.fingerprint,sourceFingerprint(root),'Artifact source fingerprint differs');
 assert.equal(digest(readFileSync(archive)),manifest.archiveDigest,'Artifact archive digest differs');
 const entries=tar(root,'-tf',archive).split(/\r?\n/).filter(Boolean);
 assert.ok(entries.length>0&&entries.every(path=>/^\.tmp\/package(?:\/|$)/.test(path)&&!path.split('/').includes('..')&&!path.includes('\\')),'Unsafe artifact archive path');
 assert.ok(tar(root,'-tvf',archive).split(/\r?\n/).filter(Boolean).every(line=>/^[d-]/.test(line)),'Archive must contain only files and directories');
 const temporary=mkdtempSync(join(root,'.tmp/restore-package-'));
 try{
  tar(root,'-xf',archive,'-C',temporary);
  const stage=join(temporary,'.tmp/package');
  assert.deepEqual(files(stage),manifest.files,'Artifact package files differ');
  const pkg=JSON.parse(readFileSync(join(stage,'package.json'))),expected=JSON.parse(readFileSync(join(root,'package.json')));
  assert.equal(pkg.name,manifest.name);assert.equal(pkg.version,manifest.version);
  delete expected.scripts;delete expected.devDependencies;
  assert.deepEqual({...pkg,version:expected.version},expected,'Artifact public manifest differs beyond version');
  // Only release metadata changes. Compiled code, dependencies and exports stay exact.
  writeFileSync(join(stage,'package.json'),JSON.stringify(expected,null,2)+'\n');
  writeFileSync(join(stage,'CHANGELOG.md'),readFileSync(join(root,'CHANGELOG.md')));
  const destination=join(root,'.tmp/package');
  rmSync(destination,{recursive:true,force:true});cpSync(stage,destination,{recursive:true});
 }finally{rmSync(temporary,{recursive:true,force:true});}
 return manifest;
}

async function github(path){
 const response=await fetch(`${process.env.GITHUB_API_URL??'https://api.github.com'}/repos/${process.env.GITHUB_REPOSITORY}/${path}`,{
  headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${process.env.GH_TOKEN??process.env.GITHUB_TOKEN}`},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error(`GitHub artifact lookup failed: HTTP ${response.status}`);
 return response.json();
}
export async function findReusable({root,repository,sha,request=github}){
 const fingerprint=sourceFingerprint(root,sha);
 for(let page=1;page<=3;page++){
  const {workflow_runs:runs}=await request(`actions/workflows/ci.yml/runs?branch=develop&event=push&status=success&per_page=50&page=${page}`);
  for(const run of runs){
   if(run.event!=='push'||run.status!=='completed'||run.conclusion!=='success'||run.head_branch!=='develop'||run.head_repository?.full_name!==repository||run.path!=='.github/workflows/ci.yml'||!Number.isSafeInteger(run.id)||!/^[a-f0-9]{40}$/.test(run.head_sha))continue;
   const ancestor=spawnSync('git',['merge-base','--is-ancestor',run.head_sha,sha],{cwd:root,stdio:'ignore'});
   if(ancestor.status!==0||sourceFingerprint(root,run.head_sha)!==fingerprint)continue;
   const {artifacts}=await request(`actions/runs/${run.id}/artifacts?per_page=100`);
   const artifact=artifacts.find(item=>item.name==='verified-package'&&!item.expired&&Number.isSafeInteger(item.id));
   if(artifact)return {runId:run.id,artifactId:artifact.id,sourceSha:run.head_sha,fingerprint};
  }
  if(runs.length<50)break;
 }
 return null;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=process.cwd(),[command,bundle='.tmp/verified',sha=process.env.GITHUB_SHA]=process.argv.slice(2);
 if(command==='plan'){
  let reusable=null;
  if(process.env.GITHUB_REF==='refs/heads/master'&&process.env.GITHUB_EVENT_NAME!=='pull_request'){
   try{reusable=await findReusable({root,repository:process.env.GITHUB_REPOSITORY,sha:process.env.GITHUB_SHA});}
   catch(error){console.warn(`Artifact unavailable; full verification required: ${error.message}`);}
  }
  const outputs={reused:!!reusable,run_id:reusable?.runId??'',artifact_id:reusable?.artifactId??'',source_sha:reusable?.sourceSha??'',fingerprint:sourceFingerprint(root)};
  for(const [key,value]of Object.entries(outputs)){
   console.log(`${key}=${value}`);if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,`${key}=${value}\n`);
  }
 }else if(command==='seal')sealPackage({root,bundle:resolve(bundle)});
 else if(command==='restore')restorePackage({root,bundle:resolve(bundle),expectedSha:sha});
 else throw Error('Usage: node tools/ci-artifact.mjs plan | seal [bundle] | restore [bundle] <source-sha>');
}
