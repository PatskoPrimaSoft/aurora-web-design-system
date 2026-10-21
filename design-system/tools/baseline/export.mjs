import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, lstatSync } from 'node:fs';
import { resolve, relative, dirname, sep, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';

export async function exportBaseline({ root, ref = '8bf5c4d', outDir }) {
  const allowed = resolve(root, '.tmp/migration');
  const output = resolve(outDir);
  const rel = relative(allowed, output);
  if (!rel || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel))
    throw new Error('Baseline output must be inside .tmp/migration (not its root)');
  for (let path = output; path !== resolve(root); path = dirname(path)) {
    if (existsSync(path) && lstatSync(path).isSymbolicLink()) throw new Error(`Baseline migration path is a symlink: ${path}`);
  }
  const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
  const sha = git(['rev-parse', '--verify', `${ref}^{commit}`]).toString().trim();
  const paths = git(['ls-tree', '-rz', '--name-only', sha]).toString().split('\0').filter(Boolean);
  const files = [];
  for (const path of paths) {
    const target = resolve(output, path);
    const part = relative(output, target);
    if (part.startsWith('..') || isAbsolute(part) || path.split('/').includes('.git'))
      throw new Error(`Unsafe baseline path: ${path}`);
    const bytes = git(['show', `${sha}:${path}`]);
    if (existsSync(target) && !readFileSync(target).equals(bytes)) throw new Error(`Baseline file was changed: ${target}`);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, bytes);
    files.push({ path, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  return { root: output, sha, files };
}
