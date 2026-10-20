import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const guide=read('design-system/docs/usage.md');
const blocks=[...guide.matchAll(/```ts\s*\n([\s\S]*?)```/g)].map(match=>match[1]);
const documented=blocks.find(block=>block.includes('export const appConfig'));
assert.ok(documented,'guide must show ApplicationConfig');
const normalize=text=>text.replace(/\/\/[^\n]*/g,'').replace(/\s/g,'');
assert.equal(normalize(documented),normalize(read('ng-ui-kit/tests/consumers/angular-base/src/docs-example.ts')),
  'documented bootstrap must match the independently compiled consumer example');
assert.match(read('ng-ui-kit/tests/consumers/angular-base/tsconfig.json'),/src\/\*\*\/\*\.ts/);
const angularBlocks=[...guide.matchAll(/```ts\s*\n([\s\S]*?)```/g)].map(match=>match[1]);
const chartExample=angularBlocks.find(block=>block.includes('export function chartOption'));
assert.ok(chartExample,'Angular guide must provide the compiled chart option example');
assert.equal(normalize(chartExample),normalize(read('ng-ui-kit/tests/consumers/angular-charts/src/docs-example.ts')),
  'chart guide must match the independently compiled option builder');
console.log('angular-doc-examples: documented bootstrap matches compiled consumer');
const buttonGuide=read('ng-ui-kit/src/components/button/README.md');
const buttonExample=[...buttonGuide.matchAll(/```ts\s*\n([\s\S]*?)```/g)][0][1];
assert.equal(normalize(buttonExample),normalize(read('ng-ui-kit/tests/consumers/shared/button-example.ts')),
  'button guide must match the independently compiled Angular example');
