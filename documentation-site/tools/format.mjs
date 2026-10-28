import { readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

const site = fileURLToPath(new URL('../', import.meta.url));
const ignorePath = fileURLToPath(new URL('../../.gitignore', import.meta.url));
const check = process.argv.includes('--check');
const extensions = new Set(['.ts', '.html', '.scss', '.mjs', '.json']);
const generated = new Set(['dist', '.angular', '.tmp', 'node_modules', 'out-tsc']);
let changed = 0;

async function formatDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!generated.has(entry.name)) await formatDirectory(file);
      continue;
    }
    if (!entry.isFile() || !extensions.has(extname(file))) continue;
    if ((await prettier.getFileInfo(file, { ignorePath })).ignored) continue;
    const source = await readFile(file, 'utf8');
    const options = await prettier.resolveConfig(file);
    let formatted = await prettier.format(source, { ...options, filepath: file });
    if (extname(file) === '.html') {
      // Prettier has no option to keep the first attribute beside the opening tag.
      formatted = formatted.replace(/(<[A-Za-z][\w:-]*)\n[\t ]+(?=[^\s<>/])/g, '$1 ');
      // Keep punctuation attached to inline text when Prettier breaks the closing tag onto a new line.
      formatted = formatted.replace(
        /(<\/(?:code|a|span|strong|em|b|i|kbd)>)[\t \r\n]+([,.;:!?])/g,
        '$1$2',
      );
    }
    if (formatted === source) continue;
    changed++;
    if (check) console.error(`Formatting differs: ${file}`);
    else await writeFile(file, formatted);
  }
}

await formatDirectory(site);
if (check && changed) process.exitCode = 1;
console.log(
  check
    ? `Site formatting: ${changed ? 'failed' : 'passed'}`
    : `Site formatting: ${changed} files updated`,
);
