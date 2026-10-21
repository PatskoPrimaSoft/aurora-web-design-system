import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { exportBaseline } from '../tools/baseline/export.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const current = join(root, 'dist/tokens.json');
const bytes = readFileSync(current);
let baseline;
try {
  writeFileSync(current, bytes.toString().replace('#ffffff', '#123456'));
  baseline = await exportBaseline({ root, ref: '8bf5c4d', outDir: join(root, '.tmp/migration/original') });
} finally { writeFileSync(current, bytes); }
assert.match(baseline.sha, /^[a-f0-9]{40}$/);
const manifest = JSON.parse(readFileSync(join(root, 'design-system/tests/fixtures/migration-baseline.json')));
assert.equal(manifest.sha, '8bf5c4db823bd6351e29657b755fe6ed5c3c3682');
assert.deepEqual(baseline.files, manifest.files);
assert.equal(manifest.cards.length, 69);
assert.deepEqual(readFileSync(join(baseline.root, 'tokens.json')), execFileSync('git', ['show', '8bf5c4d:tokens.json'], { cwd: root }));
const font = 'assets/fonts/inter-tight/InterTight-Regular.woff2';
const hash = b => createHash('sha256').update(b).digest('hex');
assert.equal(hash(readFileSync(join(baseline.root, font))), hash(execFileSync('git', ['show', `8bf5c4d:${font}`], { cwd: root })));
await assert.rejects(exportBaseline({ root, ref: '8bf5c4d', outDir: join(root, '.tmp/outside') }), /migration/);
await assert.rejects(exportBaseline({ root, ref: '8bf5c4d', outDir: join(root, '.tmp/migration/../../../outside') }), /migration/);
console.log('migration-baseline: pinned Git files, binary hash, working edits and containment passed');
