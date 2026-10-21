import { createServer } from 'node:http';
import { watch, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve, relative, extname, sep, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { buildCatalogue } from './catalog/build.mjs';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
export async function startDev({root,port=5173}){
 const scratch=resolve(root,'.tmp/dev');mkdirSync(scratch,{recursive:true});
 let generation=0,current,lastError=null,running=false,pending=false,timer,closed=false;
 const session=randomUUID();let version;
 const rebuild=async()=>{
  if(running){pending=true;return;}running=true;
  const output=join(scratch,`generation-${++generation}`);
  try{await buildCatalogue({root,outDir:output});const previous=current;current=output;version=session+':'+generation;lastError=null;if(previous)rmSync(previous,{recursive:true,force:true});}
  catch(error){lastError=error.message;if(current)rmSync(output,{recursive:true,force:true});else throw error;}
  finally{running=false;if(pending&&!closed){pending=false;await rebuild();}}
 };
 await rebuild();
 const server=createServer((req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(closed){res.writeHead(503);res.end();return;}
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
   if(pathname==='/__status'){res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify({version,error:lastError}));return;}
   const path=resolve(current,pathname==='/'?'index.html':'.'+pathname);const rel=relative(current,path);
   if(rel==='..'||rel.startsWith(`..${sep}`)||isAbsolute(rel)||rel.includes('.git')){res.writeHead(403);res.end();return;}
   let bytes=readFileSync(path);res.setHeader('Content-Type',mime[extname(path)]??'application/octet-stream');
   if(extname(path)==='.html')bytes=bytes.toString().replace('</head>',`<script>
(()=>{
 // Embedded previews reload with their catalogue; standalone pages watch independently.
 if(window.top!==window)return;
 const version=${JSON.stringify(version)};let timer,request,active=true;
 const schedule=()=>{if(active)timer=setTimeout(check,1000);};
 async function check(){
  request=new AbortController();const timeout=setTimeout(()=>request.abort(),3000);
  try{
   const response=await fetch('/__status',{cache:'no-store',signal:request.signal});
   if(!response.ok)return;
   const status=await response.json();
   if(!active)return;
   if(status.version!==version){location.reload();return;}
   if(status.error){let box=document.getElementById('build-error');if(!box){box=document.createElement('pre');box.id='build-error';box.setAttribute('role','alert');box.style.cssText='position:fixed;inset:0 0 auto;z-index:2147483647;padding:16px;background:#fff;color:#a00;white-space:pre-wrap';document.body.append(box);}box.textContent=status.error;box.hidden=false;}
  }catch{}finally{clearTimeout(timeout);request=null;schedule();}
 }
 window.addEventListener('pagehide',()=>{active=false;clearTimeout(timer);request?.abort();});
 window.addEventListener('pageshow',event=>{if(event.persisted){active=true;schedule();}});
 if(document.readyState==='complete')schedule();else window.addEventListener('load',schedule,{once:true});
})();
</script></head>`);res.end(bytes);
  }catch{res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(port,'127.0.0.1',r));
 const excluded=/^(?:\.git|node_modules|dist|site|\.tmp|\.worktrees|\.superpowers|components|fonts|assets|templates|lint)(?:\/|$)|(?:^|\/)(?:node_modules|\.angular)(?:\/|$)|^(?:tokens\.json|tokens\.css|design-system\/tokens\/scoped\.css|design-system\/lint\/tokens\.allowed\.json|design-system\/components\/bundle\.(?:js|css)|docs\/(?:usage|design|tokens|migration)\.md|lint\/tokens.allowed.json|runtime\.js|components\.js)$/;
 const watcher=watch(root,{recursive:true},(_,filename)=>{if(!filename||closed)return;const name=String(filename).replaceAll('\\','/');if(excluded.test(name))return;clearTimeout(timer);timer=setTimeout(()=>{rebuild().catch(error=>{lastError=error.message;});},80);});
 return{url:`http://127.0.0.1:${server.address().port}`,close:async()=>{closed=true;clearTimeout(timer);watcher.close();while(running)await new Promise(r=>setTimeout(r,20));await new Promise(r=>{server.close(r);server.closeAllConnections();});}};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const root=fileURLToPath(new URL('../../',import.meta.url));const dev=await startDev({root});console.log(`Aurora catalogue: ${dev.url}`);
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await dev.close();process.exit(0);});
}
