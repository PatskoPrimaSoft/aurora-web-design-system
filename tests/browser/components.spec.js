import {test} from '@playwright/test';
import {captureCards} from '../../tools/baseline/render.mjs';
import {readCards} from '../../tools/catalog/index.mjs';
import {siteRoot, sourceRoot} from '../helpers/browser-snapshot.mjs';

test('delivered previews match current source on overview, button, menu, table and list row', async ({browser}, testInfo) => {
  const root = sourceRoot();
  const cards = readCards(root).filter(card => ['overview', 'DsButton', 'DsMenu', 'DsTable', 'DsListRow'].includes(card.id));
  const sourceImages = testInfo.outputPath('components-source');
  await captureCards({browser, root, cards, mode: 'current', outDir: sourceImages});
  await captureCards({
    browser, root: siteRoot(), cards, mode: 'current',
    outDir: testInfo.outputPath('components-delivered'),
    compareDir: sourceImages, referenceRoot: root, referenceMode: 'current',
  });
});
