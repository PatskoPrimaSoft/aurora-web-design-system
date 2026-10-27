import { cpSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeTokenOutputs } from '../design-system/tools/tokens/build.mjs';

export function buildDesignSystem() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  writeTokenOutputs({ root });
  // Preserve the published layout: dist/styles.css references ../fonts and ../assets/fonts.
  for (const directory of ['fonts', 'assets/fonts']) {
    cpSync(join(root, 'design-system', directory), join(root, directory), { recursive: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildDesignSystem();
  console.log('Design system: styles, tokens and fonts built');
}
