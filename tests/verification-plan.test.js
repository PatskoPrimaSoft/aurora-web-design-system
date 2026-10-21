import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verificationSteps} from '../tools/verify.mjs';

const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const required=[...pkg.scripts['test:ui'].matchAll(/\bnode\s+((?:design-system\/)?tests\/[^\s]+\.test\.m?js)/g)].map(match=>match[1]);
assert.ok(required.length>0,'test:ui must contain recognizable test commands');
const included=new Set(verificationSteps.flatMap(([,args])=>args));
for(const path of required)assert.ok(included.has(path),`verify omits npm test:ui check: ${path}`);
assert.equal(new Set(verificationSteps.map(([name])=>name)).size,verificationSteps.length,'verification step names must be unique');
console.log('verification-plan: verify includes every test:ui check');
