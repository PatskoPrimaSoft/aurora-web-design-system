import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checkDelivery} from '../lint/scripts/check-delivery.js';

const fixture = new URL('./consumers/react19/', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', fixture)));
const lock = JSON.parse(readFileSync(new URL('package-lock.json', fixture)));
assert.equal(pkg.dependencies['@primasoftllc/design-system'], undefined);
assert.deepEqual(lock.packages[''].dependencies, pkg.dependencies);
assert.deepEqual(lock.packages[''].devDependencies, pkg.devDependencies);
assert.ok(Object.entries(lock.packages).every(([path,value]) => (path === '' || path.startsWith('node_modules/')) && !value.link));
const root = mkdtempSync(join(tmpdir(), 'aurora-react-consumer-inputs-'));
try {
  const path = join(root, 'design-system/tests/consumers/react19');
  mkdirSync(join(path, 'node_modules/third-party'), {recursive:true});
  const legacy = 'window.' + 'V2' + 'Button();';
  writeFileSync(join(path, 'node_modules/third-party/index.js'), legacy);
  writeFileSync(join(path, 'app.jsx'), legacy);
  assert.deepEqual(checkDelivery(root).map(problem => problem.file), ['design-system/tests/consumers/react19/app.jsx'], 'Delivery checks consumer sources but skips installed third-party dependencies');
} finally {
  rmSync(root, {recursive:true, force:true});
}
console.log('ok   React consumer: locked inputs without workspace links; delivery checks only authored sources');
