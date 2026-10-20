import assert from 'node:assert/strict';
import{readFileSync,existsSync,readdirSync}from'node:fs';import{join,dirname,resolve}from'node:path';import{fileURLToPath}from'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url)),read=path=>readFileSync(join(root,path),'utf8'),pkg=JSON.parse(read('package.json'));
for(const [entry,name]of[['./angular','core'],['./angular/echarts','echarts']])assert.deepEqual(pkg.exports[entry],{types:`./dist/angular/${name}.d.mts`,default:`./dist/angular/${name}.mjs`});
const core=read('dist/angular/core.mjs');assert.doesNotMatch(core,/from\s*['"]echarts/);assert.match(core,/ɵɵngDeclareInjectable/);assert.match(core,/ɵɵngDeclareDirective/);
await import('@angular/compiler');
const publicApi=await import('../../dist/angular/core.mjs');
assert.equal(typeof publicApi.DsButtonComponent,'function','Angular entry must export the button component');
for(const [name,exports]of Object.entries({'aurora-tokens':['DsTheme','DsAppearance','DsDensity','AuroraScopes','AURORA_ATTR','AURORA_DEFAULTS','AURORA_STORAGE'],'aurora-theme.service':['AURORA_CONFIG','provideAurora','AuroraThemeService'],'aurora-scope.directive':['AuroraScopeDirective'],'aurora-echarts':['AuroraChartChrome','auroraChartChrome','auroraWatchScopes']})){
 const text=read(`components/src/templates/angular/${name}.ts`);for(const symbol of exports)assert.ok(text.includes(symbol),`${name}: ${symbol}`);assert.doesNotMatch(text,/@primasoftllc\/design-system\/angular/);
}
const declarations=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?declarations(join(dir,e.name)):/\.d\.(?:ts|mts)$/.test(e.name)?[join(dir,e.name)]:[]);
for(const path of declarations(join(root,'dist/angular')))for(const[,spec]of readFileSync(path,'utf8').matchAll(/from\s*['"](\.[^'"]+)['"]/g)){
 const base=resolve(dirname(path),spec);assert.ok([base,base.replace(/\.js$/,'.d.ts'),base.replace(/\.mjs$/,'.d.mts'),base+'.d.ts'].some(existsSync),`${path}: ${spec}`);
}
assert.ok(existsSync(join(root,'templates/angular/_aurora.scss')));assert.equal(pkg.sideEffects,undefined);
console.log('angular-package: partial compilation, split exports, declarations and compatible source adapters passed');
