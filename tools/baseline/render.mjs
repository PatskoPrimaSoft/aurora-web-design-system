import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, extname, resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { exportBaseline } from './export.mjs';
import { readCards } from '../catalog/index.mjs';
import { renderPreview } from '../catalog/preview.mjs';

export const SCOPES = ['DEFAULT', 'RED2'].flatMap(theme => ['light', 'dark'].flatMap(appearance => ['cozy', 'compact'].map(density => ({ theme, appearance, density }))));
export const ACCEPTANCE_SCOPES = [SCOPES[0], SCOPES[3], SCOPES[4], SCOPES[7]];

export async function prepareBaseline(root) {
  const baseline = await exportBaseline({ root, ref: '8bf5c4d', outDir: join(root, '.tmp/migration/original') });
  const { buildDist } = await import(pathToFileURL(join(baseline.root, 'tools/build.js')));
  const { styles, tokens } = buildDist({ root: baseline.root });
  mkdirSync(join(baseline.root, 'dist'), { recursive: true });
  writeFileSync(join(baseline.root, 'dist/styles.css'), styles);
  writeFileSync(join(baseline.root, 'dist/tokens.css'), tokens);
  return { ...baseline, cards: readCards(baseline.root), mode: 'legacy' };
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
export async function serveRoot(root, pages = new Map()) {
  const base = resolve(root);
  const server = createServer((req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pages.has(pathname)) { res.setHeader('Content-Type', MIME['.html']); res.end(pages.get(pathname)); return; }
      const file = resolve(base, `.${pathname}`);
      const rel = relative(base, file);
      if (rel === '..' || rel.startsWith(`..${sep}`) || rel.includes('.git') || rel.includes('node_modules')) { res.writeHead(403); res.end(); return; }
      res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
      res.end(readFileSync(file));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}

export async function captureCards({ browser, root, cards, mode = 'legacy', outDir, compareDir, referenceRoot,referenceMode='legacy',documentationChanges=[] }) {
  assert.ok(documentationChanges.every(change=>change==='overview-count'),'Only the approved overview count update may differ from original pixels');
  if (compareDir && mode === 'current' && !referenceRoot) throw new Error('Current comparison requires the pinned original referenceRoot');
  mkdirSync(outDir, { recursive: true });
  const pages = new Map();
  for (const card of cards) for (const scope of ACCEPTANCE_SCOPES) {
    const key = `${card.id}-${scope.theme}-${scope.appearance}-${scope.density}`;
    pages.set(`/frames/${key}.html`, await renderPreview({ root, card, mode, scope }));
  }
  const served = await serveRoot(root, pages);
  let reference = served;
  if (referenceRoot) {
    const originals = new Map();
    for (const card of cards) for (const scope of ACCEPTANCE_SCOPES) {
      const key = `${card.id}-${scope.theme}-${scope.appearance}-${scope.density}`;
      originals.set(`/frames/${key}.html`, await renderPreview({root: referenceRoot, card, mode: referenceMode, scope}));
    }
    reference = await serveRoot(referenceRoot, originals);
  }
  let context, page, coldBrowser;
  const freshPage=async(cold=false)=>{
   if(context)await context.close();
   if(coldBrowser){await coldBrowser.close();coldBrowser=null;}
   if(cold)coldBrowser=await browser.browserType().launch();
   context=await (coldBrowser??browser).newContext();
   await context.addInitScript(() => {
    const RealDate = Date;
    window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [1760000000000])); } static now() { return 1760000000000; } };
    let seed = 1; Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  });
   await context.route('**/*', route => {
    const url = route.request().url();
    if (url.startsWith(served.url + '/') || url.startsWith(reference.url + '/') || /^(?:data:|blob:)/.test(url)) return route.continue();
    return route.abort('blockedbyclient');
  });
   page=await context.newPage();
   page.on('pageerror', e => errors.push(e.message));
   page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  };
  const errors = [];
  try {
    for (const card of cards) for (const scope of ACCEPTANCE_SCOPES) {
      const key = `${card.id}-${scope.theme}-${scope.appearance}-${scope.density}`;
      errors.length = 0;
      // Isolate Chromium's variable-font glyph cache from preceding viewports.
      await freshPage();
      await page.setViewportSize(card.viewport);
      await page.goto(`${served.url}/frames/${key}.html`);
      // React's initial commit may start font loading after navigation completes.
      // Wait for that commit before taking the font-ready promise.
      if (await page.locator('#root').count()) await page.waitForFunction(() => document.getElementById('root').childNodes.length > 0 || document.querySelector('[role="dialog"]') !== null);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.deepEqual(errors, [], `${key}: browser errors`);
      const buffer = await page.screenshot({ animations: 'disabled', caret: 'hide' });
      writeFileSync(join(outDir, `${key}.png`), buffer);
      const countUpdated=mode==='current'&&card.id==='overview'&&documentationChanges.includes('overview-count');
      if(compareDir&&countUpdated)console.log(`${key}: approved discovery count update; screenshot recorded, content verified by catalogue tests`);
      if (compareDir && !countUpdated && !buffer.equals(readFileSync(join(compareDir, `${key}.png`)))) {
        // Variable-font rasterization can vary even between unchanged originals.
        // Accept only exact bytes produced by the original source, never a tolerance.
        let matched = false;
        for (let attempt = 0; attempt < 8 && !matched; attempt++) {
          errors.length = 0;
          // Both cold and warm glyph caches occur in unchanged Chromium renders.
          await freshPage(attempt>=4);
          await page.setViewportSize(card.viewport);
          await page.goto(`${reference.url}/frames/${key}.html`);
          if (await page.locator('#root').count()) await page.waitForFunction(() => document.getElementById('root').childNodes.length > 0 || document.querySelector('[role="dialog"]') !== null);
          await page.evaluate(() => document.fonts.ready);
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          assert.deepEqual(errors, [], `${key}: original browser errors`);
          const original = await page.screenshot({animations: 'disabled', caret: 'hide'});
          writeFileSync(join(outDir, `${key}-original-${attempt}.png`), original);
          matched = buffer.equals(original);
        }
        assert.ok(matched, `${key}: visual mismatch; inspect PNG files in ${outDir} and ${compareDir}`);
        console.log(`${key}: exact repeated-original raster variant matched`);
      }
    }
    const computed = {};
    for (const scope of SCOPES) {
      await page.goto(`${served.url}/frames/overview-DEFAULT-light-cozy.html`);
      computed[`${scope.theme}.${scope.appearance}.${scope.density}`] = await page.evaluate(scope => {
        for (const [key, value] of Object.entries(scope)) document.documentElement.setAttribute(`data-ds-${key}`, value);
        const s = getComputedStyle(document.documentElement);
        return Object.fromEntries([...s].filter(p => p.startsWith('--') && !p.startsWith('--ds-_')).sort().map(p => [p, s.getPropertyValue(p).trim()]));
      }, scope);
    }
    await page.goto(`${served.url}/tests/fixtures/cascade.html`);
    await page.waitForSelector('#out');
    computed.cascade = Object.fromEntries(Object.entries(JSON.parse(await page.locator('#out').textContent()))
      .sort(([a], [b]) => a.localeCompare(b)).map(([id, props]) => [id, Object.fromEntries(Object.entries(props).filter(([p]) => !p.startsWith('--ds-_')).sort(([a], [b]) => a.localeCompare(b)))]));
    const json = JSON.stringify(computed, null, 2) + '\n';
    writeFileSync(join(outDir, 'computed.json'), json);
    if (compareDir) assert.deepEqual(computed, JSON.parse(readFileSync(join(compareDir, 'computed.json'), 'utf8')), 'Computed token baseline mismatch');
    console.log(`${mode}: ${cards.length} cards × 4 scopes and 8 computed sets, SHA256 ${createHash('sha256').update(json).digest('hex')}`);
  } finally {
    if(context)await context.close();
    if(coldBrowser)await coldBrowser.close();
    if(reference !== served){reference.server.closeAllConnections();await new Promise(resolve => reference.server.close(resolve));}
    served.server.closeAllConnections();
    await new Promise(resolve => served.server.close(resolve));
  }
}
