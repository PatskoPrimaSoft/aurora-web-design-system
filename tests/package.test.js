/**
 * Манифест пакета: имя, реестр, входы, состав и отсутствие старого имени в поставке.
 * Запуск: `node tests/package.test.js`, часть `npm run test:ui`.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));

const check = (name, fn) => { fn(); console.log(`ok   пакет: ${name}`); };

check('имя и реестр', () => {
  assert.equal(pkg.name, '@primasoftllc/design-system');
  assert.equal(lock.name, pkg.name);
  assert.equal(pkg.private, undefined, 'private: true не даёт npm publish');
  assert.equal(pkg.publishConfig?.registry, 'https://npm.pkg.github.com');
  assert.match(pkg.repository?.url ?? '', /github\.com\/PrimaSoftLLC\/aurora-web-design-system/);
});
check('версия semver и совпадает с lock', () => {
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
});
check('входы', () => {
  assert.equal(pkg.main, 'dist/react/index.mjs');
  assert.equal(pkg.types, 'dist/react/index.d.ts');
  assert.deepEqual(pkg.exports['.'], {types:'./dist/react/index.d.ts',import:'./dist/react/index.mjs',default:'./dist/react/index.mjs'});
  assert.equal(pkg.exports['./styles.css'], './dist/styles.css');
  assert.equal(pkg.exports['./tokens.css'], './dist/tokens.css');
  assert.equal(pkg.exports['./stylelint-config'], './lint/config.js');
  assert.deepEqual(pkg.exports['./angular'], {types:'./dist/angular/core.d.mts',default:'./dist/angular/core.mjs'});
});
check('peer-зависимости необязательны', () => {
  for (const dep of Object.keys(pkg.peerDependencies ?? {})) {
    assert.equal(pkg.peerDependenciesMeta?.[dep]?.optional, true, `${dep} должен быть optional`);
  }
  for (const dep of ['react', 'react-dom', 'echarts', '@angular/core', '@angular/common', 'stylelint']) {
    assert.ok(pkg.peerDependencies?.[dep], `peer ${dep} объявлен`);
  }
});
check('состав пакета', () => {
  for (const entry of ['dist/', 'fonts/', 'assets/fonts/', 'components/src/', 'lint/', 'tokens.json']) {
    assert.ok(pkg.files.includes(entry), `files: ${entry}`);
  }
  assert.ok(pkg.files.includes('!lint/test/'), 'фикстуры линтера не публикуются');
});
check('staging сохраняет контракт и не создаёт копии в корне', () => {
  const staged = JSON.parse(readFileSync(join(root, '.tmp/package/package.json'), 'utf8'));
  for (const key of ['name','version','exports','main','types','peerDependencies','peerDependenciesMeta','publishConfig','files']) assert.deepEqual(staged[key], pkg[key], key);
  assert.equal(staged.scripts, undefined, 'published package must not execute repository hooks');
  for (const path of ['fonts','assets/fonts','components','lint','templates/angular','tokens.json','tokens.css','docs/usage.md','docs/design.md','docs/tokens.md','docs/migration.md']) assert.equal(existsSync(join(root,path)),false,`generated root copy: ${path}`);
});
check('старого имени нет в коде и документах', () => {
  const skip = ['node_modules', '.git', '.tmp', '.worktrees', 'site', 'assets/notes', 'dist', 'docs/plans', '.superpowers'];
  const bad = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (['node_modules', 'dist', '.angular'].includes(name)) continue;
      const path = join(dir, name);
      const rel = relative(root, path).replaceAll('\\', '/');
      if (skip.some((s) => rel === s || rel.startsWith(`${s}/`))) continue;
      if (statSync(path).isDirectory()) { walk(path); continue; }
      if (!/\.(js|jsx|mjs|ts|json|md|html|css)$/.test(name) || rel === 'CHANGELOG.md') continue;
      if (rel === 'tests/package.test.js') continue;
      const text = readFileSync(path, 'utf8');
      if (/@aurora\/design-system|@aurora\/ds\b|@ORG\/|@nikolaynn\//.test(text)) bad.push(rel);
    }
  };
  walk(root);
  assert.deepEqual(bad, [], `старое имя пакета: ${bad.join(', ')}`);
});
