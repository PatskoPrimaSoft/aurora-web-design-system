import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { buildDesignSystem } from '../../tools/build-design-system.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const site = join(root, 'documentation-site');
const mode = process.argv[2];
if (!['dev', 'build'].includes(mode)) throw new Error('Expected dev or build');

const children = new Set();
function run(script, args = [], cwd = root) {
  const child = spawn(process.execPath, [script, ...args], { cwd, stdio: 'inherit' });
  children.add(child);
  return new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      children.delete(child);
      if (code === 0) resolve();
      else reject(new Error(`${script} exited with ${code ?? signal}`));
    });
  });
}

const buildAngular = (clean = true) =>
  run(join(root, 'ng-ui-kit/tools/build-angular.mjs'), clean ? [] : ['--no-clean']);
buildDesignSystem();
await buildAngular();

const watchers = [];
let timer;
let busy = false;
const pending = new Set();
async function rebuild() {
  if (busy) return;
  busy = true;
  try {
    while (pending.size) {
      const changes = new Set(pending);
      pending.clear();
      try {
        if (changes.has('styles')) buildDesignSystem();
        if (changes.has('angular')) await buildAngular(false);
        console.log('Site dependencies rebuilt');
      } catch (error) {
        console.error(error);
        // Keep watching so the developer can correct the source and retry.
      }
    }
  } finally {
    busy = false;
  }
}

function stop() {
  clearTimeout(timer);
  for (const watcher of watchers) watcher.close();
  for (const child of children) child.kill();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

if (mode === 'dev') {
  for (const [directory, kind] of [
    ['design-system/tokens', 'styles'],
    ['design-system/styles', 'styles'],
    ['design-system/fonts', 'styles'],
    ['design-system/assets/fonts', 'styles'],
    ['ng-ui-kit/src', 'angular'],
  ]) {
    watchers.push(
      watch(join(root, directory), { recursive: true }, (_event, filename) => {
        if (filename && !/\.(?:ts|html|css|scss|json|woff2)$/.test(filename)) return;
        // Generated token output is not an input to the build.
        if (directory === 'design-system/tokens' && filename === 'scoped.css') return;
        pending.add(kind);
        clearTimeout(timer);
        timer = setTimeout(rebuild, 200);
      }),
    );
  }
}

try {
  await run(
    join(root, 'node_modules/@angular/cli/bin/ng.js'),
    [mode === 'dev' ? 'serve' : 'build', ...process.argv.slice(3)],
    site,
  );
} finally {
  stop();
}
