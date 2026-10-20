import{spawnSync}from'node:child_process';import{mkdtempSync,mkdirSync,readFileSync,writeFileSync,copyFileSync,readdirSync,rmSync,existsSync,realpathSync}from'node:fs';import{tmpdir}from'node:os';import{join,dirname,resolve,relative,isAbsolute}from'node:path';import{fileURLToPath}from'node:url';import{createRequire}from'node:module';import assert from'node:assert/strict';
import{serveRoot}from'../../tools/baseline/render.mjs';import{chromium}from'@playwright/test';
import{assertAngularButton}from'./check-angular-button.mjs';
const toolRoot=fileURLToPath(new URL('../../',import.meta.url));
export function validateConsumerInputs(root=toolRoot){
 for(const name of ['19','base','charts','legacy']){
  const folder=join(root,'ng-ui-kit/tests/consumers/angular-'+name),pkg=JSON.parse(readFileSync(join(folder,'package.json'))),lock=JSON.parse(readFileSync(join(folder,'package-lock.json')));
  assert.equal(pkg.dependencies['@primasoftllc/design-system'],undefined,`${name}: design system must be installed from tarball after fixture lock`);
  assert.ok(!lock.packages['node_modules/@primasoftllc/design-system'],`${name}: fixture lock contains design system`);
  assert.ok(Object.entries(lock.packages).every(([path,value])=>(path===''||path.startsWith('node_modules/'))&&!value.link),`${name}: fixture lock must not link to workspace sources`);
  if(name==='base'||name==='19')assert.ok(!lock.packages['node_modules/echarts'],'base lock must not contain ECharts');
 }
}
function npmCli(){const base=dirname(process.execPath);const candidates=[process.env.npm_execpath,join(base,'node_modules/npm/bin/npm-cli.js'),join(base,'../lib/node_modules/npm/bin/npm-cli.js')].filter(Boolean);const path=candidates.find(existsSync);if(!path)throw Error('Cannot locate npm CLI; run through npm run check:angular');return path;}
function npm(args,cwd,log){const result=spawnSync(process.execPath,[npmCli(),...args],{cwd,encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,NG_CLI_ANALYTICS:'false'}});if(log)writeFileSync(log,(result.stdout??'')+(result.stderr??''));if(result.error||result.status!==0)throw Error(`${cwd}: npm ${args.join(' ')} failed (${result.status}): ${result.error?.message??result.stdout+result.stderr}`);return result.stdout;}
function copy(from,to){mkdirSync(to,{recursive:true});for(const entry of readdirSync(from,{withFileTypes:true})){if(['node_modules','dist','.angular'].includes(entry.name))continue;const source=join(from,entry.name),target=join(to,entry.name);if(entry.isDirectory())copy(source,target);else copyFileSync(source,target);}}
export async function checkAngular({root=toolRoot,tarball,workRoot}={}){
 validateConsumerInputs(root);
 const parent=resolve(workRoot??tmpdir());mkdirSync(parent,{recursive:true});const work=mkdtempSync(join(parent,'aurora-angular-'));const servers=[];
 const close=async()=>{for(const served of servers){served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}const rel=relative(parent,resolve(work));if(rel==='..'||rel.startsWith('..')||isAbsolute(rel)||!rel.startsWith('aurora-angular-'))throw Error('Unsafe Angular consumer cleanup');rmSync(work,{recursive:true,force:true});};
 try{
  const logRoot=join(root,'.tmp/migration/angular');mkdirSync(logRoot,{recursive:true});
  if(!tarball){const packed=JSON.parse(npm(['pack','--json','--ignore-scripts','--pack-destination',work],root))[0];tarball=join(work,packed.filename);}
  const result={close,work};
  for(const name of ['19','base','charts','legacy']){
   const consumer=join(work,name);copy(join(root,'ng-ui-kit/tests/consumers/angular-'+name),consumer);
   if(name==='19'||name==='base')for(const file of ['button-demo.ts','button-example.ts'])copyFileSync(join(root,'ng-ui-kit/tests/consumers/shared',file),join(consumer,'src',file));
   npm(['ci','--offline','--no-audit','--no-fund'],consumer,join(logRoot,name+'-install.log'));
   npm(['install','--offline','--ignore-scripts','--no-audit','--no-fund',resolve(tarball)],consumer,join(logRoot,name+'-package.log'));
   assert.equal(realpathSync(join(consumer,'node_modules/@primasoftllc/design-system')),join(realpathSync(consumer),'node_modules/@primasoftllc/design-system'),'installed package must be a real tarball directory, not a source link');
   if(name==='base'||name==='19'){const req=createRequire(join(consumer,'package.json'));assert.throws(()=>req.resolve('echarts'),{code:'MODULE_NOT_FOUND'});assert.equal(JSON.parse(readFileSync(join(consumer,'tsconfig.json'))).compilerOptions.paths,undefined);}
   npm(['run','build'],consumer,join(logRoot,name+'-build.log'));
   const served=await serveRoot(join(consumer,'dist/browser'));servers.push(served);result[name+'Url']=served.url;result[name+'Root']=consumer;
   console.log(`angular-consumer: ${name} offline tarball install and optimized AOT build passed`);
  }
  return result;
 }catch(error){await close();throw error;}
}
export async function assertConsumers(page,consumers){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.route('**/*',route=>{const url=route.request().url();if([consumers['19Url'],consumers.baseUrl,consumers.chartsUrl,consumers.legacyUrl].some(origin=>url.startsWith(origin+'/'))||/^(data:|blob:)/.test(url))return route.continue();errors.push('external request: '+url);return route.abort();});
 for(const url of [consumers['19Url'],consumers.baseUrl]){
 await page.goto(url+'/index.html');await page.waitForSelector('app-root[data-ready]');assert.equal(await page.locator('body').getAttribute('data-ds-theme'),'RED2');assert.equal(await page.locator('[auroraScope]').getAttribute('data-ds-density'),'compact');
 await page.locator('#theme-toggle').click();await page.waitForFunction(()=>document.body.getAttribute('data-ds-appearance')==='dark');
 await page.evaluate(()=>{localStorage.setItem('ds-appearance','dark');localStorage.setItem('ds-density','compact');});await page.reload();await page.waitForSelector('app-root[data-ready]');assert.equal(await page.locator('body').getAttribute('data-ds-appearance'),'dark');assert.equal(await page.locator('body').getAttribute('data-ds-density'),'compact');
 await assertAngularButton(page,url);
 }
 await page.goto(consumers.legacyUrl+'/index.html');await page.waitForFunction(()=>window.legacyCheck);assert.deepEqual(await page.evaluate(()=>[window.legacyCheck.sameService,window.legacyCheck.sameConfig,window.legacyCheck.sameInstance,window.legacyCheck.chart,window.legacyCheck.watch]),[true,true,true,true,true]);
 await page.goto(consumers.chartsUrl+'/index.html');await page.waitForFunction(()=>window.auroraCheck);assert.equal(await page.evaluate(()=>window.auroraCheck.sameTheme),true);const before=await page.evaluate(()=>window.auroraCheck.read.fg);
 await page.locator('#panel').evaluate(el=>{el.setAttribute('data-ds-theme','RED2');el.setAttribute('data-ds-appearance','light');});await page.waitForFunction(before=>window.auroraCheck.read.fg!==before,before);assert.equal(await page.locator('canvas').count(),1);
 const stopped=await page.evaluate(()=>{window.auroraCheck.stop();const n=window.auroraCheck.callbacks;document.getElementById('panel').setAttribute('data-ds-appearance','dark');return n;});await page.evaluate(()=>new Promise(r=>setTimeout(r,30)));assert.equal(await page.evaluate(()=>window.auroraCheck.callbacks),stopped);
 await page.goto(consumers.chartsUrl+'/global.html');await page.waitForFunction(()=>window.globalCheck);assert.equal(await page.evaluate(()=>window.globalCheck.registered),true);assert.ok(await page.evaluate(()=>window.globalCheck.option.color.length>0&&window.globalCheck.read.fg));assert.deepEqual(errors,[]);
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const consumers=await checkAngular({tarball:process.argv[2]});let browser;
 try{browser=await chromium.launch();const context=await browser.newContext();const page=await context.newPage();await assertConsumers(page,consumers);console.log('angular-consumer: bootstrap, scopes, persisted settings, identities, chart updates, unsubscribe and global bridge passed');}finally{if(browser)await browser.close();await consumers.close();}
}
