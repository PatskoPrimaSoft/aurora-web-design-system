import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {changelogSection} from './changelog-section.js';

export function releaseVersion(pkg,lock,changelog){
 const version=pkg.version;
 if(!/^\d+\.\d+\.\d+$/.test(version))throw new Error('package.json: release version must be X.Y.Z');
 if(lock.version!==version||lock.packages?.['']?.version!==version)throw new Error('package-lock.json: version differs from package.json');
 if(!changelogSection(changelog,version))throw new Error(`CHANGELOG.md: non-empty section ## [${version}] required`);
 return version;
}

/** Only an explicit registry E404 means publication may start. */
export function registryState(result,version){
 let data;
 try{data=JSON.parse(result.stdout);}catch{throw new Error('registry: invalid response; publication stopped');}
 if(result.status===0&&data===version)return 'present';
 if(result.status!==0&&!result.error&&!result.signal&&data?.error?.code==='E404')return 'missing';
 throw new Error(`registry: ${data?.error?.code||result.error?.message||'unexpected response'}; publication stopped`);
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
  const pkg=JSON.parse(read('package.json'));
  if(process.argv[2]==='registry'){
   const version=process.argv[3];
   if(!/^\d+\.\d+\.\d+$/.test(version))throw new Error('Expected version X.Y.Z');
   const result=spawnSync('npm',['view',`${pkg.name}@${version}`,'version','--json'],{encoding:'utf8',timeout:60000});
   console.log(registryState(result,version));
  }else console.log(releaseVersion(pkg,JSON.parse(read('package-lock.json')),read('CHANGELOG.md')));
 }catch(error){console.error(error.message);process.exitCode=1;}
}
