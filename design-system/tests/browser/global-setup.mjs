import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {mkdirSync, copyFileSync, writeFileSync, readdirSync, readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {buildComponents} from '../../tools/build-components.mjs';
import {writeTokenOutputs} from '../../tools/tokens/build.mjs';
import {prepareBaseline} from '../../tools/baseline/render.mjs';
import {vendorAssets} from '../../tools/catalog/assets.mjs';
import {copyTree, createSnapshot, removeSnapshot, fingerprint} from '../helpers/browser-snapshot.mjs';

export default async function setup(config) {
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  const parent = join(root, '.tmp/migration');
  const run = createSnapshot(parent), source = join(run, 'source'), site = join(run, 'site');
  const previous = process.env.AURORA_BROWSER_SNAPSHOT;
  const restoreEnvironment = () => {
    if (previous === undefined) delete process.env.AURORA_BROWSER_SNAPSHOT;
    else process.env.AURORA_BROWSER_SNAPSHOT = previous;
  };
  try {
    const excluded = new Set(['node_modules', 'dist', '.angular', '.tmp']);
    for (const folder of ['design-system', 'ng-ui-kit', 'docs']) {
      copyTree(join(root, folder), join(source, folder), excluded);
    }
    for (const name of readdirSync(root).filter(name => name.endsWith('.md') || name === 'package.json')) {
      copyFileSync(join(root, name), join(source, name));
    }
    for (const path of Object.values(vendorAssets)) {
      const target = join(source, path);
      mkdirSync(join(target, '..'), {recursive: true});
      copyFileSync(join(root, path), target);
    }
    let cards;
    if(process.env.AURORA_PREBUILT === '1'){
      copyTree(join(root,'site'),site);
      cards=JSON.parse(readFileSync(join(site,'cards.json'),'utf8'));
    }else cards = await buildCatalogue({root: source, outDir: site});
    const needsBaseline = config.projects.some(project => project.name === 'raster');
    let baseline;
    if (needsBaseline) {
      // Source/delivery parity still uses an independently bundled source runtime.
      writeTokenOutputs({root: source});
      await buildComponents({root: source, outDir: source});
      baseline = await prepareBaseline(root, {outDir: join(run, 'original')});
      for (const target of [source, site]) {
        // The pinned renderer serves its original virtual URL in both roots.
        mkdirSync(join(target, 'tests/fixtures'), {recursive: true});
        copyFileSync(join(baseline.root, 'tests/fixtures/cascade.html'), join(target, 'tests/fixtures/cascade.html'));
      }
    }
    writeFileSync(join(run, 'context.json'), JSON.stringify({source, site, baseline}));
    const shared = [source, site, ...(baseline ? [baseline.root] : [])];
    const before = shared.map(fingerprint);
    process.env.AURORA_BROWSER_SNAPSHOT = run;
    console.log(`browser-setup: one catalogue build, ${cards.length} cards, isolated source${baseline ? ' and baseline' : ''}`);
    return async () => {
      try {
        for (const [index, path] of shared.entries()) {
          assert.deepEqual(fingerprint(path), before[index], `Shared browser snapshot was modified: ${path}`);
        }
        console.log('browser-teardown: shared source, catalogue and baseline remained unchanged');
      } finally {
        removeSnapshot(parent, run);
        restoreEnvironment();
      }
    };
  } catch (error) {
    removeSnapshot(parent, run);
    restoreEnvironment();
    throw error;
  }
}
