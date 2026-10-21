import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {packageDirectory} from './build-package.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
if (process.argv.includes('--reject-root')) {
  console.error('Pack the prepared package, not the repository: npm run pack (or npm pack ./.tmp/package --ignore-scripts after npm run build).');
  process.exit(1);
}
const npm = [process.env.npm_execpath, join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js')].find(path => path && existsSync(path));
if (!npm) throw Error('Cannot locate npm CLI; run npm run pack');
const result = spawnSync(process.execPath, [npm, 'pack', packageDirectory(root), '--ignore-scripts', ...process.argv.slice(2)], {cwd: root, stdio: 'inherit'});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
