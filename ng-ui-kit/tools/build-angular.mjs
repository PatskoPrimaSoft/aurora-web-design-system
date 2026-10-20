import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {join,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
export async function buildAngular({root=fileURLToPath(new URL('../../',import.meta.url))}={}) {
  const output=resolve(root,'dist/angular');
  if(relative(resolve(root),output).startsWith('..'))throw Error('Unsafe Angular output');
  rmSync(output,{recursive:true,force:true});
  const compiler=fileURLToPath(new URL('../../node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js',import.meta.url));
  const result=spawnSync(process.execPath,[compiler,'-p',join(root,'ng-ui-kit/tsconfig.lib.json')],{cwd:root,encoding:'utf8'});
  if(result.error||result.status!==0)throw Error(`Angular compilation failed: ${result.error?.message??result.stderr+result.stdout}`);
  mkdirSync(output,{recursive:true});
  for(const name of ['core','echarts']) {
    // Angular 19 linker требует StringLiteral в partial metadata styles.
    // esbuild иначе превращает многострочный CSS в TemplateLiteral.
    await build({entryPoints:[join(output,'esm',name+'.js')],outfile:join(output,name+'.mjs'),bundle:true,format:'esm',platform:'neutral',packages:'external',target:'es2022',supported:{'template-literal':false},charset:'utf8'});
    writeFileSync(join(output,name+'.d.mts'),`export * from './esm/${name}.js';\n`);
  }
}
if(process.argv[1]===fileURLToPath(import.meta.url)){await buildAngular();console.log('Angular: core and echarts partial entrypoints built');}
