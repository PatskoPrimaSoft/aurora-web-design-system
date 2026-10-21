import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs';
import {join,resolve,relative,sep} from 'node:path';
import {parse} from 'parse5';import MarkdownIt from 'markdown-it';
import {renderMarkdown} from './markdown.mjs';import {readCards} from '../catalog/index.mjs';
const md=new MarkdownIt({html:false});
function refs(tokens){const out=[];for(const token of tokens){if(token.type==='link_open')out.push(token.attrGet('href'));if(token.type==='image')out.push(token.attrGet('src'));if(token.children)out.push(...refs(token.children));}return out;}
function htmlInfo(text){const links=[],ids=new Set();const walk=node=>{for(const a of node.attrs??[]){if(a.name==='id'||a.name==='name')ids.add(a.value);if(['href','src','poster'].includes(a.name)&&node.tagName!=='base')links.push(a.value);}for(const c of node.childNodes??[])walk(c);};walk(parse(text));return{links,ids};}
function exactExists(base,path){let current=base;for(const part of path.split('/').filter(Boolean)){if(!existsSync(current)||!statSync(current).isDirectory()||!readdirSync(current).includes(part))return false;current=join(current,part);}return existsSync(current);}
export function validateLinks({root,siteRoot}){
 const problems=[],seen=new Set();
 function check(base,path,label,markdown=false){
  const key=base+'|'+path;if(seen.has(key))return;seen.add(key);
  const source=readFileSync(join(base,path),'utf8'),info=markdown?{links:refs(md.parse(source,{})),ids:htmlInfo(renderMarkdown({root:base,path}).html).ids}:htmlInfo(source);
  for(const target of info.links){
   if(/^(?:data:|blob:|mailto:|tel:)/i.test(target))continue;
   let url,dest,hash;try{url=new URL(target,'http://aurora.local/'+path);dest=decodeURIComponent(url.pathname).slice(1);hash=decodeURIComponent(url.hash.slice(1));}catch{problems.push({source:label,target,reason:'invalid-url'});continue;}
   if(url.origin!=='http://aurora.local'){if(!['http:','https:'].includes(url.protocol))problems.push({source:label,target,reason:'invalid-url'});continue;}
   if(!dest)dest='index.html';
   const full=resolve(base,dest),rel=relative(resolve(base),full);
   if(rel==='..'||rel.startsWith('..'+sep)){problems.push({source:label,target,reason:'outside-root'});continue;}
   if(!exactExists(base,dest)||!statSync(full).isFile()){problems.push({source:label,target,reason:'missing-file'});continue;}
   if(hash&&/\.(?:md|html)$/i.test(dest)){
    const ids=dest.endsWith('.md')?htmlInfo(renderMarkdown({root:base,path:dest}).html).ids:htmlInfo(readFileSync(full,'utf8')).ids;
    if(!ids.has(hash))problems.push({source:label,target,reason:'missing-anchor'});
   }
   if(markdown&&dest.endsWith('.md')&&!/^(?:docs\/(?:plans|superpowers)\/|assets\/notes\/)/.test(dest)&&dest!=='CHANGELOG.md')check(base,dest,dest,true);
  }
 }
 for(const path of readdirSync(root).filter(p=>p.endsWith('.md')&&!['CHANGELOG.md','SYNC.md'].includes(p)))check(root,path,path,true);
 if(existsSync(join(root,'design-system/overview.html')))for(const card of readCards(root))if(card.readmePath)check(root,card.readmePath,card.readmePath,true);
 if(siteRoot&&existsSync(siteRoot)){const walk=(folder,prefix='')=>{for(const entry of readdirSync(folder,{withFileTypes:true})){const path=prefix+entry.name;if(entry.isDirectory())walk(join(folder,entry.name),path+'/');else if(entry.name.endsWith('.html'))check(siteRoot,path,'site/'+path);}};walk(siteRoot);}
 return problems;
}
