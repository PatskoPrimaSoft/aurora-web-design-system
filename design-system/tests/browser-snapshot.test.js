import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {copyTree, createSnapshot, removeSnapshot, fingerprint} from './helpers/browser-snapshot.mjs';

const parent = mkdtempSync(join(tmpdir(), 'aurora snapshot пробел '));
try {
  const first = createSnapshot(parent), second = createSnapshot(parent);
  assert.notEqual(first, second);
  mkdirSync(join(first, 'nested'));
  writeFileSync(join(first, 'nested/file.txt'), 'original');
  copyTree(first, second);
  assert.deepEqual(fingerprint(first), fingerprint(second));
  const before = fingerprint(first);
  writeFileSync(join(second, 'nested/file.txt'), 'changed');
  assert.equal(readFileSync(join(first, 'nested/file.txt'), 'utf8'), 'original');
  assert.notDeepEqual(fingerprint(first), fingerprint(second));
  assert.deepEqual(fingerprint(first), before);
  writeFileSync(join(first, 'added.txt'), 'new');
  assert.notDeepEqual(fingerprint(first), before);
  rmSync(join(first, 'added.txt'));
  rmSync(join(first, 'nested/file.txt'));
  assert.notDeepEqual(fingerprint(first), before);
  for (const unsafe of [parent, join(parent, '..'), join(first, 'nested'), join(parent, 'another')]) {
    assert.throws(() => removeSnapshot(parent, unsafe), /Unsafe/);
  }
  removeSnapshot(parent, first);
  assert.ok(!existsSync(first));
  assert.ok(existsSync(second));
  removeSnapshot(parent, second);
} finally { rmSync(parent, {recursive: true, force: true}); }
console.log('browser-snapshot: independent files, mutation detection and bounded cleanup passed');
