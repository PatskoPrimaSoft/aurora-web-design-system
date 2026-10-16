import {existsSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve,relative,isAbsolute,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';

export function validateVersionTag(tag,version){
 if(!/^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(tag)||tag!==`v${version}`)throw Error(`Expected stable version tag v${version}, received ${tag}`);
 return tag;
}

// Adapt only generated assets; development URLs and package sources remain unchanged.
export function preparePages(directory,basePath){
 const root=resolve(directory),prefix=basePath.replace(/\/$/,'');
 if(prefix&&!/^\/[\w-]+(?:\/[\w-]+)*$/.test(prefix))throw Error(`Invalid Pages base path: ${basePath}`);
 const visit=folder=>{for(const entry of readdirSync(folder,{withFileTypes:true})){
  const path=join(folder,entry.name);
  if(entry.isDirectory()){visit(path);continue;}
  if(!['.html','.js','.json','.css'].includes(extname(path)))continue;
  const source=readFileSync(path,'utf8');
  const output=source.replace(/(["'`])(\/(?!\/)[^"'`<>\s\\]*)/g,(match,quote,url)=>{
   let pathname;try{pathname=decodeURIComponent(url.split(/[?#]/)[0]);}catch{return match;}
   const target=resolve(root,'.'+pathname),local=relative(root,target);
   if(local==='..'||local.startsWith('..'+sep)||isAbsolute(local)||!existsSync(target))return match;
   return quote+prefix+url;
  });
  if(output!==source)writeFileSync(path,output);
 }};
 if(prefix)visit(root);
 writeFileSync(join(root,'.nojekyll'),'');
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const [command,arg]=process.argv.slice(2);
 if(command==='validate-tag')validateVersionTag(arg,JSON.parse(readFileSync('package.json','utf8')).version);
 else if(command==='prepare')preparePages('site',arg??'');
 else throw Error('Usage: node tools/pages.mjs validate-tag <vX.Y.Z> | prepare <base-path>');
}
