import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export const verificationSteps=[
 ['build-package',['tools/build.js']],
 ['lint',['lint/test/run.js']],
 ['angular-package',['ng-ui-kit/tests/angular-package.test.js']],
 ['angular-theme',['ng-ui-kit/tests/angular-theme.test.js']],
 ['angular-consumer-inputs',['ng-ui-kit/tests/angular-consumer-inputs.test.js']],
 ['angular-doc-examples',['ng-ui-kit/tests/angular-doc-examples.test.js']],
 ['docs-api',['tests/docs-api.test.js']],
 ['api-forwarding',['tests/api-forwarding.test.js']],
 ['docs-review',['tests/docs-review.test.js']],
 ['docs-links',['tests/docs-links.test.js']],
 ['release-check',['tests/release-check.test.js']],
 ['catalog-search',['tests/catalog-search.test.js']],
 ['react-build',['tests/react-build.test.mjs']],
 ['pages',['tests/pages.test.js']],
 ['raster-match',['tests/raster-match.test.js']],
 ['radio-progress',['tests/radio-progress.test.js']],
 ['date-controls',['tests/date-controls.test.js']],
 ['browser-snapshot',['tests/browser-snapshot.test.js']],
 ...['verification-plan','DsFilterMenu','a11y-tokens','checkbox','switch','page-layout','field','select','rows-buttons','nav-dialog-i18n','guard-command','guard-hook','ci-toolchain','package','fonts','changelog-section','migration-baseline','token-model','component-build','build','catalog-build','dev-server','clean-build','deterministic-build'].map(name=>[name,[`tests/${name}.test.js`]]),
 ['browser',['node_modules/@playwright/test/cli.js','test']],
 ['pack',['tools/check-pack.js']],
 ['browser-compat',['node_modules/@playwright/test/cli.js','test','--config=playwright.compat.config.mjs']],
];
if(process.argv[1]===fileURLToPath(import.meta.url)){
for(const[name,args]of verificationSteps){
 console.log(`\nverify: ${name}`);
 const run=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});
 if(run.error||run.signal||run.status!==0){console.error(`verify: ${name} failed (${run.error?.message??run.signal??run.status})`);process.exit(run.status||1);}
}
console.log('\nverify: all checks passed');
}
