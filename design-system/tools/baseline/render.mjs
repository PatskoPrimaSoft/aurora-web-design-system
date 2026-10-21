import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, extname, resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { exportBaseline } from './export.mjs';
import { readCards } from '../catalog/index.mjs';
import { renderPreview } from '../catalog/preview.mjs';
import {sourceAsset} from '../catalog/assets.mjs';

export const SCOPES = ['DEFAULT', 'RED2'].flatMap(theme => ['light', 'dark'].flatMap(appearance => ['cozy', 'compact'].map(density => ({ theme, appearance, density }))));
export const ACCEPTANCE_SCOPES = [SCOPES[0], SCOPES[3], SCOPES[4], SCOPES[7]];

export async function prepareBaseline(root, {outDir = join(root, '.tmp/migration/original')} = {}) {
  const baseline = await exportBaseline({ root, ref: '8bf5c4d', outDir });
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
      res.end(readFileSync(sourceAsset(base, rel)));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}

export async function matchExactRaster({actual,expected,captureActual,captureReference,attempts=8}){
  const candidates=[actual],originals=[expected];
  if(actual.equals(expected))return actual;
  for(let attempt=0;attempt<attempts;attempt++){
    originals.push(await captureReference(attempt));
    const prior=candidates.find(candidate=>originals.some(original=>candidate.equals(original)));
    if(prior)return prior;
    const candidate=await captureActual(attempt);candidates.push(candidate);
    if(originals.some(original=>candidate.equals(original)))return candidate;
  }
  return null;
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
  let context, page, coldBrowser, currentKey='setup';
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
   page.setDefaultTimeout(30000);
   page.setDefaultNavigationTimeout(30000);
   page.on('pageerror', e => errors.push(e.stack ?? e.message));
   page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
   page.on('requestfailed', request => errors.push(`${request.failure()?.errorText}: ${request.url()}`));
  };
  const errors = [];
  const capture=async(base,key,viewport,cold=false)=>{
    errors.length=0;
    await freshPage(cold);
    await page.setViewportSize(viewport);
    await page.goto(`${base}/frames/${key}.html`);
    // React may start font loading after navigation completes.
    assert.deepEqual(errors,[],`${key}: navigation errors`);
    if(await page.locator('#root').count())await page.waitForFunction(()=>document.getElementById('root').childNodes.length>0||document.querySelector('[role="dialog"]')!==null,null,{polling:100})
      .catch(async error=>{throw new Error(`${key}: React did not commit; browser errors: ${JSON.stringify(errors)}; ${error.message}`,{cause:error});});
    await page.waitForFunction(()=>document.fonts.status==='loaded',null,{polling:100});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    assert.deepEqual(errors,[],`${key}: browser errors`);
    return page.screenshot({animations:'disabled',caret:'hide'});
  };
  try {
    for (const card of cards) for (const scope of ACCEPTANCE_SCOPES) {
      const key = `${card.id}-${scope.theme}-${scope.appearance}-${scope.density}`;
      currentKey=key;
      const buffer = await capture(served.url,key,card.viewport);
      writeFileSync(join(outDir, `${key}.png`), buffer);
      const countUpdated=mode==='current'&&card.id==='overview'&&documentationChanges.includes('overview-count');
      if(compareDir&&countUpdated)console.log(`${key}: approved discovery count update; screenshot recorded, content verified by catalogue tests`);
      if (compareDir && !countUpdated && !buffer.equals(readFileSync(join(compareDir, `${key}.png`)))) {
        // Chromium can vary rounded-edge antialiasing with identical geometry/styles.
        // Retry both sources: a rare actual variant must not stay fixed while only
        // originals are sampled. Every accepted image still needs an exact original.
        const variant=async(base,label,attempt)=>{
          const image=await capture(base,key,card.viewport,attempt>=4);
          writeFileSync(join(outDir,`${key}-${label}-${attempt}.png`),image);
          return image;
        };
        const matched=await matchExactRaster({actual:buffer,expected:readFileSync(join(compareDir,`${key}.png`)),
          captureActual:attempt=>variant(served.url,'candidate',attempt),
          captureReference:attempt=>variant(reference.url,'original',attempt)});
        assert.ok(matched, `${key}: visual mismatch; inspect PNG files in ${outDir} and ${compareDir}`);
        writeFileSync(join(outDir,`${key}-initial.png`),buffer);
        writeFileSync(join(outDir,`${key}.png`),matched);
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
  } catch(error) {
    throw new Error(`${mode} capture ${currentKey}: ${error.message}`,{cause:error});
  } finally {
    // A timed-out test may already have closed the browser; preserve the capture error.
    if(context)await context.close().catch(()=>{});
    if(coldBrowser)await coldBrowser.close().catch(()=>{});
    if(reference !== served){reference.server.closeAllConnections();await new Promise(resolve => reference.server.close(resolve));}
    served.server.closeAllConnections();
    await new Promise(resolve => served.server.close(resolve));
  }
}
