import {copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join, posix} from 'node:path';

// Published source and asset paths predate the repository directory layout.
// These copies are generated; the editable originals live in design-system/.
export function buildCompatibility({root}) {
  const entries = ['fonts', 'assets/fonts', 'components/src', 'components/DsButton/README.md',
    'templates/angular', 'docs/usage.md', 'docs/design.md', 'docs/tokens.md', 'docs/migration.md'];
  const publicPath = path => path.replace(/^design-system\//, '');
  const copy = (source, destination) => {
    const from = join(root, source), to = join(root, destination);
    mkdirSync(dirname(to), {recursive: true});
    const copyFiles = (sourcePath, targetPath) => {
      if (statSync(sourcePath).isDirectory()) {
        mkdirSync(targetPath, {recursive: true});
        for (const entry of readdirSync(sourcePath)) copyFiles(join(sourcePath, entry), join(targetPath, entry));
      } else copyFileSync(sourcePath, targetPath);
    };
    copyFiles(from, to);
    const rewrite = (src, dst) => {
      for (const entry of readdirSync(join(root, src), {withFileTypes: true})) {
        if (entry.isDirectory()) rewrite(posix.join(src, entry.name), posix.join(dst, entry.name));
        else fix(posix.join(src, entry.name), posix.join(dst, entry.name));
      }
    };
    const fix = (src, dst) => {
      if (!/\.(?:ts|js|jsx|mjs|md|json)$/.test(src)) return;
      let text = readFileSync(join(root, src), 'utf8');
      const relative = target => {
        const resolved = posix.normalize(posix.join(posix.dirname(src), target));
        let result = posix.relative(posix.dirname(dst), publicPath(resolved));
        if (!result.startsWith('.')) result = './' + result;
        return result;
      };
      text = text.replace(/((?:from\s*|import\s*\()\s*['"])(\.[^'"]+)(['"])/g,
        (_, before, target, after) => before + relative(target) + after);
      text = text.replace(/(\]\()(\.[^\s)#]+)([^)]*\))/g,
        (_, before, target, after) => before + relative(target) + after);
      writeFileSync(join(root, dst), text);
    };
    if (/\.[^/]+$/.test(source)) fix(source, destination);
    else rewrite(source, destination);
  };
  for (const entry of entries) {
    if (existsSync(join(root, 'design-system', entry))) copy('design-system/' + entry, entry);
  }
}
