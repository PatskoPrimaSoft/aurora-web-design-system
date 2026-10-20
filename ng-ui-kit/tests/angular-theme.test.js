import{JSDOM}from'jsdom';import{build}from'esbuild';import{fileURLToPath,pathToFileURL}from'node:url';import{join}from'node:path';import{mkdirSync}from'node:fs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const environment=new JSDOM('<html><body></body></html>',{url:'https://aurora.test/'});
// Патчим таймеры Node до подключения отдельного window из jsdom.
await import('zone.js');await import('zone.js/testing');
const saved=new Map();for(const name of ['window','document','HTMLElement','Element','Node','MutationObserver']){saved.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{value:environment.window[name],configurable:true,writable:true});}
try{
 await import('@angular/compiler');
 const{TestBed}=await import('@angular/core/testing');const{BrowserDynamicTestingModule,platformBrowserDynamicTesting}=await import('@angular/platform-browser-dynamic/testing');
 TestBed.initTestEnvironment(BrowserDynamicTestingModule,platformBrowserDynamicTesting());
 mkdirSync(join(root,'.tmp'),{recursive:true});const output=join(root,'.tmp/angular-theme-host.mjs');
 await build({entryPoints:[join(root,'ng-ui-kit/tests/fixtures/angular-theme-host.ts')],outfile:output,bundle:true,packages:'external',platform:'node',format:'esm',target:'es2022'});
 const{checkTheme,checkMissingBody}=await import(pathToFileURL(output));
 for(const scenario of [
  {name:'config',config:{theme:'RED2'},expected:{theme:'RED2',appearance:'light',density:'cozy'}},
  {name:'persisted',stored:{'ds-appearance':'dark','ds-density':'compact'},config:{theme:'RED2',appearance:'light',density:'cozy'},expected:{theme:'RED2',appearance:'dark',density:'compact'}},
  {name:'invalid persisted',stored:{'ds-appearance':'unknown','ds-density':'unknown'},config:{appearance:'dark',density:'compact'},expected:{theme:'DEFAULT',appearance:'dark',density:'compact'}},
  {name:'storage unavailable',throws:true,config:{theme:'RED2',appearance:'dark'},expected:{theme:'RED2',appearance:'dark',density:'cozy'}},
 ]){
  const dom=new JSDOM('<html><body class="theme-app"></body></html>',{url:'https://aurora.test/'});
  try{for(const[key,value]of Object.entries(scenario.stored??{}))dom.window.localStorage.setItem(key,value);if(scenario.throws)Object.defineProperty(dom.window,'localStorage',{get(){throw Error('unavailable');}});await checkTheme(dom.window.document,scenario.config,scenario.expected);console.log('angular-theme: '+scenario.name+' passed');}finally{dom.window.close();}
 }
 await checkMissingBody(environment.window.document);console.log('angular-theme: missing body recovers, bootstrap and service identity passed');
 TestBed.resetTestEnvironment();
}finally{environment.window.close();for(const[name,descriptor]of saved){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}}
