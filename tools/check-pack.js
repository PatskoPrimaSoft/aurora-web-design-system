/**
 * Проверка глазами потребителя: npm pack → установка tarball в пустой каталог без сети →
 * входы резолвятся, url() шрифтов и иконок ведут к файлам, слой Angular на месте,
 * stylelint-конфиг работает, лишнего (react, lint/test) нет.
 * Запуск: `npm run check:pack` (после `npm run build`), часть `npm run verify`.
 */
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync, symlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import stylelint from 'stylelint';

const root = fileURLToPath(new URL('..', import.meta.url));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const sh = (args, cwd) => {
  const r = spawnSync(npm, args, { cwd, encoding: 'utf8', shell: process.platform === 'win32' });
  assert.equal(r.status, 0, `npm ${args.join(' ')}:\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
};
const check = async (name, fn) => { await fn(); console.log(`ok   пакет-потребитель: ${name}`); };

const work = mkdtempSync(join(tmpdir(), 'ds-pack-'));
try {
  const packed = JSON.parse(sh(['pack', '--json', '--ignore-scripts', '--pack-destination', work], root))[0];
  assert.equal(packed.files.some(f=>/^(?:site|catalog|tests|tools|\.tmp)\//.test(f.path)),false,'catalogue and build/test tooling must not ship');
  for(const path of ['dist/styles.css','dist/tokens.css','tokens.json','dist/react/index.mjs','dist/react/index.d.ts','dist/angular/core.mjs','dist/angular/core.d.mts','dist/angular/echarts.mjs','dist/angular/echarts.d.mts'])assert.ok(packed.files.some(f=>f.path===path),path);
  const tgz = packed.filename;
  writeFileSync(join(work, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type: 'module' }));
  sh(['install', '--offline', '--no-audit', '--no-fund', join(work, tgz)], work);
  const pkgDir = join(work, 'node_modules/@primasoftllc/design-system');
  const req = createRequire(join(work, 'index.js'));

  // lint/rules/*.js импортируют голый 'stylelint' (стандартный паттерн плагина, как stylelint-scss) —
  // он резолвится у РЕАЛЬНОГО потребителя, потому что stylelint-config нельзя применить без своего
  // stylelint в devDependencies, и npm поднимает его в общий node_modules. В пустом песочнице этого
  // потребителя нет и сети тоже нет, поэтому кладём junction на уже установленный stylelint этого
  // репозитория — без него резолвится с ошибкой ERR_MODULE_NOT_FOUND: 'stylelint' из lint/rules/*.js.
  symlinkSync(join(root, 'node_modules/stylelint'), join(work, 'node_modules/stylelint'), 'junction');

  await check('входы резолвятся', () => {
    for (const entry of ['styles.css', 'tokens.css', 'stylelint-config', 'tokens.json', 'package.json','angular','angular/echarts']) {
      assert.ok(existsSync(req.resolve(`@primasoftllc/design-system/${entry}`)), entry);
    }
  });
  await check('url() из dist/styles.css ведут к файлам', () => {
    const css = readFileSync(join(pkgDir, 'dist/styles.css'), 'utf8');
    const urls = [...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => m[1]);
    assert.ok(urls.length >= 7);
    for (const url of urls) assert.ok(existsSync(join(pkgDir, 'dist', url)), `битый url(${url})`);
  });
  await check('Angular-слой по пути алиаса', () => {
    const index = join(pkgDir, 'components/src/templates/angular/index.ts');
    assert.ok(existsSync(index));
    for (const [, spec] of readFileSync(index, 'utf8').matchAll(/from '(\.[^']+)'/g)) {
      assert.ok(existsSync(join(dirname(index), spec)), spec);
    }
    assert.ok(existsSync(join(pkgDir, 'components/src/components/charts/echartsTheme.mjs')));
  });
  await check('stylelint-конфиг ловит литерал и пропускает токен', async () => {
    const configFile = req.resolve('@primasoftllc/design-system/stylelint-config');
    const lint = (code) => stylelint.lint({ code, config: { extends: [pathToFileURL(configFile).href] } })
      .then((r) => r.results[0].warnings.filter((w) => w.severity === 'error').length);
    assert.equal(await lint('.a { color: #ffffff; }'), 1);
    assert.equal(await lint('.a { color: var(--ds-fg); }'), 0);
  });
  await check('без react, echarts, @angular и фикстур линтера', () => {
    const installed = readdirSync(join(work, 'node_modules'));
    for (const dep of ['react', 'react-dom', 'echarts', '@angular']) assert.ok(!installed.includes(dep), dep);
    assert.ok(!existsSync(join(pkgDir, 'lint/test')));
  });
  await check('React: импорт и рендер установленного tarball без JSX-loader и ECharts', () => {
    for(const name of ['react','react-dom','@types','csstype'])
      symlinkSync(join(root,'node_modules',name),join(work,'node_modules',name),'junction');
    writeFileSync(join(work,'react-runtime.mjs'),`
      import assert from 'node:assert/strict';
      import React from 'react';
      import {renderToStaticMarkup} from 'react-dom/server';
      import {DsButton,DsSkeleton,DsStringsProvider,dsStringsEn,dsTabIds} from '@primasoftllc/design-system';
      const html=renderToStaticMarkup(React.createElement(DsStringsProvider,{strings:dsStringsEn},React.createElement(DsButton,null,'Save')));
      assert.match(html,/<button/);assert.match(html,/Save/);
      assert.equal(typeof DsSkeleton,'function');assert.equal(dsTabIds('tabs','one').panelId,'tabs-panel-one');
    `);
    const result=spawnSync(process.execPath,[join(work,'react-runtime.mjs')],{cwd:work,encoding:'utf8'});
    assert.equal(result.status,0,result.stdout+result.stderr);
    assert.ok(!existsSync(join(work,'node_modules/echarts')));
  });
  await check('React: строгие типы потребителя и отклонение неверных props', () => {
    writeFileSync(join(work,'react-consumer.tsx'),readFileSync(join(root,'tests/fixtures/react-consumer.tsx'),'utf8'));
    const result=spawnSync(process.execPath,[join(root,'node_modules/typescript/bin/tsc'),
      '--strict','--noEmit','--skipLibCheck','false','--module','NodeNext','--moduleResolution','NodeNext',
      '--target','ES2022','--jsx','react-jsx','--types','react,react-dom','react-consumer.tsx'],{cwd:work,encoding:'utf8'});
    assert.equal(result.status,0,result.stdout+result.stderr);
  });
} finally {
  rmSync(work, { recursive: true, force: true });
}
