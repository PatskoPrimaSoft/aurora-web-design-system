import {copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync} from 'node:fs';
import {join, resolve, relative, isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';

// Copy bytes, never hardlink files: mutation tests must own their files.
export function copyTree(from, to, excluded = new Set()) {
  mkdirSync(to, {recursive: true});
  for (const entry of readdirSync(from, {withFileTypes: true})) {
    if (excluded.has(entry.name)) continue;
    if (entry.isSymbolicLink()) throw new Error(`Snapshot cannot include a symlink: ${join(from, entry.name)}`);
    const source = join(from, entry.name), target = join(to, entry.name);
    if (entry.isDirectory()) copyTree(source, target, excluded);
    else copyFileSync(source, target);
  }
}

export function createSnapshot(parent) {
  mkdirSync(parent, {recursive: true});
  return mkdtempSync(join(parent, 'browser-run-'));
}

export function removeSnapshot(parent, path) {
  const part = relative(resolve(parent), resolve(path));
  if (isAbsolute(part) || !/^browser-run-[^\\/]+$/.test(part)) {
    throw new Error(`Unsafe browser snapshot cleanup: ${path}`);
  }
  rmSync(path, {recursive: true, force: true});
}

export function fingerprint(root) {
  const files = {};
  const walk = (directory, prefix = '') => {
    for (const entry of readdirSync(directory, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(directory, entry.name), key = prefix + entry.name;
      if (entry.isDirectory()) walk(path, key + '/');
      else files[key] = createHash('sha256').update(readFileSync(path)).digest('hex');
    }
  };
  walk(root);
  return files;
}

export function snapshotContext() {
  const path = process.env.AURORA_BROWSER_SNAPSHOT;
  if (!path || !existsSync(join(path, 'context.json'))) {
    throw new Error('Browser snapshot is missing. Run tests through a repository Playwright config.');
  }
  return JSON.parse(readFileSync(join(path, 'context.json'), 'utf8'));
}

export const siteRoot = () => snapshotContext().site;
export const sourceRoot = () => snapshotContext().source;
export const preparedBaseline = () => snapshotContext().baseline;
export const catalogueCards = () => JSON.parse(readFileSync(join(siteRoot(), 'cards.json'), 'utf8'));
