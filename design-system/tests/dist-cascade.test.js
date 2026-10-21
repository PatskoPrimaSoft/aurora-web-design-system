/** Совместимая команда: проверяет каскад в установленном Playwright Chromium. */
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
execFileSync(process.execPath,[fileURLToPath(new URL('../../node_modules/@playwright/test/cli.js',import.meta.url)),'test','design-system/tests/browser/token-cascade.spec.js'],{cwd:root,stdio:'inherit'});
