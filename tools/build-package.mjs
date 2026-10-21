import {copyFileSync, readdirSync, statSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync, mkdtempSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {buildCompatibility} from './build-compatibility.mjs';

export const packageDirectory = root => join(root, '.tmp/package');
function copy(source, target) {
  if (statSync(source).isDirectory()) {
    mkdirSync(target, {recursive: true});
    for (const name of readdirSync(source)) copy(join(source, name), join(target, name));
  } else { mkdirSync(dirname(target), {recursive: true}); copyFileSync(source, target); }
}

// Build from a fresh directory so removed source files cannot survive in a release.
export function buildPackage({root}) {
  const parent = join(root, '.tmp');
  mkdirSync(parent, {recursive: true});
  const temporary = mkdtempSync(join(parent, 'package-build-'));
  const stage = join(temporary, 'package'), destination = packageDirectory(root);
  mkdirSync(stage);
  try {
    const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    for (const path of [...manifest.files.filter(path => !path.startsWith('!')), 'README.md']) {
      const source = join(root, path), target = join(stage, path);
      if (!existsSync(source)) continue;
      // Compatibility copies are made only from their canonical sources below.
      if (/^(?:fonts|assets\/fonts|components|lint|templates\/angular)(?:\/|$)/.test(path) || /^docs\/(?:usage|design|tokens|migration)\.md$/.test(path) || path === 'tokens.json') continue;
      mkdirSync(dirname(target), {recursive: true});
      copy(source, target);
    }
    buildCompatibility({root, outDir: stage});
    copyFileSync(join(root, 'dist/tokens.json'), join(stage, 'tokens.json'));
    // Published packages must not run repository build hooks during pack/install.
    delete manifest.scripts;
    delete manifest.devDependencies;
    writeFileSync(join(stage, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
    const previous = join(temporary, 'previous');
    if (existsSync(destination)) renameSync(destination, previous);
    try { renameSync(stage, destination); }
    catch (error) { if (existsSync(previous)) renameSync(previous, destination); throw error; }
    return destination;
  } finally { rmSync(temporary, {recursive: true, force: true}); }
}
