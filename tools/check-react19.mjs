import assert from 'node:assert/strict';
import {spawn, spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {chromium, expect} from '@playwright/test';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = join(root, 'design-system/tests/consumers/react19');
const manifest = JSON.parse(readFileSync(join(fixture, 'package.json')));
const lock = JSON.parse(readFileSync(join(fixture, 'package-lock.json')));
assert.equal(manifest.dependencies['@primasoftllc/design-system'], undefined, 'Consumer installs the built tarball after its locked toolchain');
assert.ok(Object.entries(lock.packages).every(([path, value]) => (path === '' || path.startsWith('node_modules/')) && !value.link), 'Consumer must not link workspace sources');
mkdirSync(join(root, '.tmp/react19'), {recursive:true});
// Keep failed runs for diagnostics; every run installs into a fresh consumer.
const work = mkdtempSync(join(root, '.tmp/react19/run-'));
const npmCli = [process.env.npm_execpath, join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
  join(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js')].filter(Boolean).find(existsSync);
assert.ok(npmCli, 'Run through Node/npm installed by mise');
let commandIndex = 0;
function run(command, args, cwd=work) {
  const result = spawnSync(command, args, {cwd, encoding:'utf8', maxBuffer:64*1024*1024,
    env:{...process.env, NEXT_TELEMETRY_DISABLED:'1'}});
  writeFileSync(join(work, `command-${++commandIndex}.log`), `${command} ${args.join(' ')}\n${result.stdout ?? ''}${result.stderr ?? ''}`);
  assert.equal(result.status, 0, `${command} ${args.join(' ')}:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
const npm = (args, cwd) => run(process.execPath, [npmCli, ...args], cwd);
console.log(`React19 consumer: ${work}`);
for (const name of ['package.json', 'package-lock.json', 'app.jsx']) copyFileSync(join(fixture, name), join(work, name));
npm(['ci', '--offline', '--ignore-scripts', '--no-audit', '--no-fund']);
const packed = JSON.parse(npm(['pack', '--json', '--ignore-scripts', '--pack-destination', work], join(root, '.tmp/package')))[0];
// Normal npm resolution is part of the contract: no force/legacy-peer-deps.
npm(['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', join(work, packed.filename)]);
const tree = JSON.parse(npm(['ls', 'react', 'react-dom', '--all', '--json']));
assert.equal(tree.dependencies.react.version, '19.3.1');
assert.equal(tree.dependencies['react-dom'].version, '19.3.1');
const installed = join(work, 'node_modules/@primasoftllc/design-system');
assert.equal(realpathSync(installed), join(realpathSync(work), 'node_modules/@primasoftllc/design-system'), 'Consumer must install the real tarball directory');
const packageManifest = JSON.parse(readFileSync(join(installed, 'package.json')));
for (const name of ['react', 'react-dom']) assert.equal(packageManifest.peerDependenciesMeta[name].optional, true);
writeFileSync(join(work, 'single-react.mjs'), `
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const app = createRequire(import.meta.url);
const ds = createRequire(app.resolve('@primasoftllc/design-system'));
assert.equal(app.resolve('react'), ds.resolve('react'));
assert.equal(app.resolve('react-dom'), ds.resolve('react-dom'));
`);
run(process.execPath, ['single-react.mjs']);
console.log('ok   React19: normal tarball installation and single React instance');
copyFileSync(join(root, 'design-system/tests/fixtures/react-consumer.tsx'), join(work, 'react-consumer.tsx'));
run(process.execPath, ['node_modules/typescript/bin/tsc', '--strict', '--noEmit', '--skipLibCheck', 'false',
  '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', '--jsx', 'react-jsx',
  '--types', 'react,react-dom', 'react-consumer.tsx']);
console.log('ok   React19: strict public declarations and invalid props rejected');

await build({entryPoints:[join(work, 'app.jsx')], outfile:join(work, 'app.mjs'), platform:'node', format:'esm', packages:'external', bundle:true});
writeFileSync(join(work, 'ssr.mjs'), `
import React from 'react';
import {renderToString} from 'react-dom/server';
import App from './app.mjs';
import {writeFileSync} from 'node:fs';
const scopes = [['DEFAULT','light','cozy'], ['DEFAULT','dark','compact'], ['RED2','light','cozy'], ['RED2','dark','compact']];
scopes.forEach(([brand,theme,density], index) => {
 const props = {brand,theme,density};
 writeFileSync('scope-'+index+'.html', '<!doctype html><html><head><link rel="stylesheet" href="/styles.css"></head><body><div id="root">' +
 renderToString(React.createElement(App,props)) + '</div><script>window.consumerProps='+JSON.stringify(props)+'</script><script src="/client.js"></script></body></html>');
});
`);
run(process.execPath, ['ssr.mjs']);
writeFileSync(join(work, 'client.jsx'), `
import React from 'react';
import {hydrateRoot} from 'react-dom/client';
import App from './app.jsx';
window.hydrationErrors=[];
window.consumerRoot=hydrateRoot(document.getElementById('root'), <App {...window.consumerProps}/>, {onRecoverableError:error=>window.hydrationErrors.push(error.message)});
`);
await build({entryPoints:[join(work, 'client.jsx')], outfile:join(work, 'client.js'), bundle:true, platform:'browser',
  define:{'process.env.NODE_ENV':'"production"'}});
const server = createServer((request, response) => {
  const name = request.url.slice(1);
  const path = name === 'styles.css' ? join(installed, 'dist/styles.css') : /^scope-\d\.html$|^client\.js$/.test(name) ? join(work, name)
    : /^(?:assets\/fonts\/[a-z-]+\/|fonts\/)[\w.-]+\.woff2$/.test(name) ? join(installed, name) : null;
  if (name === 'favicon.ico') {response.writeHead(204).end();return;}
  if (!path) {response.writeHead(404).end();return;}
  response.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : name.endsWith('.woff2') ? 'font/woff2' : 'text/html');
  response.end(readFileSync(path));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch();
  const scopeStyles = new Set();
  for (let index=0; index<4; index++) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
    page.on('response', response => {if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);});
    await page.goto(`http://127.0.0.1:${server.address().port}/scope-${index}.html`);
    await page.waitForFunction(() => window.consumerField?.current);
    scopeStyles.add(await page.locator('main').evaluate(node => {
      const css = getComputedStyle(node);
      return ['--ds-brand', '--ds-bg', '--ds-field-h'].map(name => css.getPropertyValue(name).trim()).join('|');
    }));
    assert.deepEqual(await page.evaluate(() => window.hydrationErrors), []);
    const field = page.getByRole('textbox', {name:'Name', exact:true});
    assert.equal(await field.evaluate(node => node === window.consumerField.current), true);
    await field.fill('Updated');
    const combo = page.getByRole('combobox', {name:'Choice'});
    await combo.focus();await combo.press('ArrowDown');await combo.press('End');await combo.press('Enter');
    await expect(combo).toContainText('two');
    await page.getByRole('button', {name:'Save', exact:true}).click();
    await expect(page.getByLabel('Submitted')).toHaveText('Updated:two');
    await expect(page.getByLabel('Clicks')).toHaveText('1');
    await page.getByRole('tab', {name:'First', exact:true}).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', {name:'Second', exact:true})).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toHaveText('Second panel');
    const opener = page.getByRole('button', {name:'Open dialog'});
    await opener.click();
    const dialog = page.getByRole('dialog', {name:'Consumer dialog'});
    await expect(dialog).toBeVisible();
    assert.equal(await dialog.evaluate(node => !document.getElementById('root').contains(node)), true, 'Dialog uses a portal');
    await expect.poll(() => dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);await expect(opener).toBeFocused();
    await opener.click();await expect(dialog).toBeVisible();
    await page.evaluate(() => window.consumerRoot.unmount());
    await expect(dialog).toHaveCount(0);
    assert.equal(await page.evaluate(() => window.consumerField.current), null);
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    assert.deepEqual(await page.evaluate(() => ['Escape', 'Tab'].map(key => {
      const event = new KeyboardEvent('keydown', {key, bubbles:true, cancelable:true});
      document.dispatchEvent(event);
      return event.defaultPrevented;
    })), [false, false], 'Unmount removes the dialog Escape layer and focus trap listeners');
    assert.deepEqual(errors, []);assert.deepEqual(await page.evaluate(() => window.hydrationErrors), []);
    await page.close();
    console.log(`ok   React19: SSR hydration, refs/events, form, select/tabs keyboard, dialog portal/focus/Escape/unmount (scope ${index+1}/4)`);
  }
  assert.equal(scopeStyles.size, 4, 'All four scope combinations must apply distinct theme/density tokens');
} finally {
  await browser?.close();await new Promise(resolve => server.close(resolve));
}

// Exercise a real Next 15 client boundary and production route from the installed tarball.
mkdirSync(join(work, 'app'));
writeFileSync(join(work, 'app/layout.jsx'), `import '@primasoftllc/design-system/styles.css';export default function Layout({children}){return <html><head><link rel="icon" href="data:,"/></head><body>{children}</body></html>}`);
writeFileSync(join(work, 'app/page.jsx'), `import App from '../app.jsx';export default function Page(){return <App/>}`);
writeFileSync(join(work, 'next.config.mjs'), 'export default {outputFileTracingRoot:process.cwd(),experimental:{cpus:1}};\n');
const nextLog = run(process.execPath, ['node_modules/next/dist/bin/next', 'build']);
writeFileSync(join(work, 'next-build.log'), nextLog);
assert.match(nextLog, /[○ƒ]\s+\//);
assert.match(readFileSync(join(work, '.next/server/app/index.html'), 'utf8'), /Consumer|Open dialog/);
const portServer = createServer();
await new Promise(resolve => portServer.listen(0, '127.0.0.1', resolve));
const port = portServer.address().port;
await new Promise(resolve => portServer.close(resolve));
const next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)],
  {cwd:work, env:{...process.env, NEXT_TELEMETRY_DISABLED:'1'}, stdio:['ignore', 'pipe', 'pipe']});
let serverLog = '';
next.stdout.on('data', chunk => {serverLog += chunk;});next.stderr.on('data', chunk => {serverLog += chunk;});
try {
  await expect.poll(async () => {
    assert.equal(next.exitCode, null, serverLog);
    try {return (await fetch(`http://127.0.0.1:${port}`)).status;} catch {return 0;}
  }, {timeout:30000}).toBe(200);
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
  page.on('response', response => {if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);});
  await page.goto(`http://127.0.0.1:${port}`);
  await page.waitForFunction(() => window.consumerField?.current);
  await page.getByRole('textbox', {name:'Name', exact:true}).fill('Next production');
  await page.getByRole('button', {name:'Save', exact:true}).click();
  await expect(page.getByLabel('Submitted')).toHaveText('Next production:one');
  await page.getByRole('button', {name:'Open dialog'}).click();
  await expect(page.getByRole('dialog', {name:'Consumer dialog'})).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  assert.deepEqual(errors, []);
} finally {
  await browser?.close();
  next.kill();await new Promise(resolve => {if (next.exitCode !== null) resolve();else next.once('exit', resolve);});
  writeFileSync(join(work, 'next-start.log'), serverLog);
}
console.log('ok   React19: Next15.5.28 production client boundary build, HTTP route and hydrated controls');
