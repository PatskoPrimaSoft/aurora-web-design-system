import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verificationSteps,verificationGroups,stepsForGroup} from '../tools/verify.mjs';
import browserConfig from '../playwright.config.mjs';
import {readdirSync} from 'node:fs';

const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const required=[...pkg.scripts['test:ui'].matchAll(/\bnode\s+((?:design-system\/)?tests\/[^\s]+\.test\.m?js)/g)].map(match=>match[1]);
assert.ok(required.length>0,'test:ui must contain recognizable test commands');
const included=new Set(verificationSteps.flatMap(([,args])=>args));
for(const path of required)assert.ok(included.has(path),`verify omits npm test:ui check: ${path}`);
assert.ok(stepsForGroup('components').some(([name,args])=>name==='react19-consumer'&&args.includes('tools/check-react19.mjs')), 'CI components must exercise installed React19 declarations, hydration and Next production route');
assert.equal(pkg.scripts['check:react19'], 'node tools/check-react19.mjs');
const workflow=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
assert.match(workflow,/name: Prepare React 19 consumer cache\s+if: matrix.group == 'components'\s+run: npm ci --prefix design-system\/tests\/consumers\/react19 --ignore-scripts/);
assert.match(workflow,/name: Install isolated browser\s+if: matrix.group == 'components' \|\| matrix.group == 'raster' \|\| matrix.group == 'angular'/);
assert.equal(new Set(verificationSteps.map(([name])=>name)).size,verificationSteps.length,'verification step names must be unique');
assert.deepEqual(stepsForGroup('catalogue').filter(([name])=>name.startsWith('documentation-site-')).map(([name])=>name),
 ['documentation-site-format','documentation-site-build','documentation-site-browser'],'catalogue CI must format-check, build and exercise the Angular documentation site');
const partition=verificationGroups.flatMap(group=>stepsForGroup(group));
for(const [name]of verificationSteps)assert.equal(partition.filter(([candidate])=>candidate===name).length,name==='browser'?3:1,`${name}: CI group coverage`);
for(const group of ['catalogue','raster','angular'])assert.ok(stepsForGroup(group).some(([name,args])=>name==='browser'&&args.includes(`--project=${group}`)));
assert.throws(()=>stepsForGroup('unknown'),/Unknown verify group/);
assert.equal(browserConfig.workers,2);
for(const name of ['raster','angular'])assert.equal(browserConfig.projects.find(project=>project.name===name).workers,1);
for(const file of readdirSync(new URL('../design-system/tests/browser/',import.meta.url)).filter(file=>file.endsWith('.spec.js'))){
 const matches=browserConfig.projects.filter(project=>project.name!=='angular'&&(!project.testMatch||project.testMatch.test(file))&&(!project.testIgnore||!project.testIgnore.test(file)));
 assert.equal(matches.length,1,`${file}: browser test must belong to exactly one project`);
}
console.log('verification-plan: verify includes every test:ui check');
