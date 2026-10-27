import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const sharedChecks=new Set(['verification-plan','guard-command','guard-hook','ci-toolchain','package','changelog-section','clean-build','deterministic-build','ci-artifact']);
export const verificationSteps=[
 ['build-package',['tools/build.js']],
 ['lint',['design-system/lint/test/run.js']],
 ['angular-package',['ng-ui-kit/tests/angular-package.test.js']],
 ['angular-theme',['ng-ui-kit/tests/angular-theme.test.js']],
 ['angular-consumer-inputs',['ng-ui-kit/tests/angular-consumer-inputs.test.js']],
 ['angular-doc-examples',['ng-ui-kit/tests/angular-doc-examples.test.js']],
 ['docs-api',['design-system/tests/docs-api.test.js']],
 ['api-forwarding',['design-system/tests/api-forwarding.test.js']],
 ['docs-review',['design-system/tests/docs-review.test.js']],
 ['docs-links',['design-system/tests/docs-links.test.js']],
 ['release-check',['tests/release-check.test.js']],
 ['catalog-search',['design-system/tests/catalog-search.test.js']],
 ['react-build',['design-system/tests/react-build.test.mjs']],
 ['react19-consumer',['tools/check-react19.mjs']],
 ['react-consumer-inputs',['design-system/tests/react-consumer-inputs.test.mjs']],
 ['pages',['tests/pages.test.js']],
 ['raster-match',['design-system/tests/raster-match.test.js']],
 ['radio-progress',['design-system/tests/radio-progress.test.js']],
 ['date-controls',['design-system/tests/date-controls.test.js']],
 ['browser-snapshot',['design-system/tests/browser-snapshot.test.js']],
 ...['verification-plan','DsFilterMenu','a11y-tokens','checkbox','switch','page-layout','field','select','rows-buttons','nav-dialog-i18n','guard-command','guard-hook','ci-toolchain','ci-artifact','package','fonts','changelog-section','migration-baseline','token-model','component-build','build','catalog-build','dev-server','clean-build','deterministic-build'].map(name=>[name,[`${sharedChecks.has(name)?'tests':'design-system/tests'}/${name}.test.js`]]),
 ['browser',['node_modules/@playwright/test/cli.js','test']],
 ['pack',['tools/check-pack.js']],
 ['browser-compat',['node_modules/@playwright/test/cli.js','test','--config=playwright.compat.config.mjs']],
 ['documentation-site-format',['documentation-site/tools/format.mjs','--check']],
 ['documentation-site-build',['documentation-site/tools/run.mjs','build','--base-href','/site-check/','--output-path','../.tmp/documentation-site-check']],
 ['documentation-site-browser',['documentation-site/tests/smoke.mjs']],
];
export const verificationGroups=['build','components','catalogue','raster','angular'];
export function stepsForGroup(group){
 if(!group)return verificationSteps;
 if(!verificationGroups.includes(group))throw Error(`Unknown verify group: ${group}`);
 const browser=verificationSteps.find(([name])=>name==='browser');
 if(group==='build')return verificationSteps.filter(([name])=>name==='build-package');
 if(group==='catalogue')return [[browser[0],[...browser[1],'--project=catalogue']],verificationSteps.find(([name])=>name==='browser-compat'),...verificationSteps.filter(([name])=>name.startsWith('documentation-site-'))];
 if(group==='raster')return [[browser[0],[...browser[1],'--project=raster']]];
 if(group==='angular')return [...verificationSteps.filter(([name])=>name.startsWith('angular-')),[browser[0],[...browser[1],'--project=angular']]];
 return verificationSteps.filter(([name])=>name!=='build-package'&&!name.startsWith('angular-')&&!name.startsWith('documentation-site-')&&!['browser','browser-compat'].includes(name));
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
const group=process.argv[2];
for(const[name,args]of stepsForGroup(group)){
 console.log(`\nverify: ${name}`);
 const env={...process.env,AURORA_PREBUILT:'1',AURORA_VERIFY_GROUP:group??''};
 const run=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit',env});
 if(run.error||run.signal||run.status!==0){console.error(`verify: ${name} failed (${run.error?.message??run.signal??run.status})`);process.exit(run.status||1);}
}
console.log('\nverify: all checks passed');
}
