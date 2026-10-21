import {test, expect} from '@playwright/test';
import {captureCards} from '../../tools/baseline/render.mjs';
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {siteRoot, catalogueCards, preparedBaseline, copyTree} from '../helpers/browser-snapshot.mjs';

test('baseline is pinned and repeated pixels match original renders offline', async ({browser}, testInfo) => {
  test.setTimeout(600000);
  const baseline = preparedBaseline();
  expect(baseline.cards).toHaveLength(69);
  const reference = testInfo.outputPath('capture-a');
  await captureCards({browser, ...baseline, outDir: reference});
  await captureCards({browser, ...baseline, outDir: testInfo.outputPath('capture-b'), compareDir: reference});
});
test('current catalogue renders all discovered pages in four scopes after approved component changes', async ({browser}, testInfo) => {
  test.setTimeout(600000);
  const cards = catalogueCards();
  expect(cards.some(card => card.id === 'DsCheckbox')).toBe(true);
  expect(cards.some(card => ['DsBadge', 'DsFilterBar', 'DsObjectRow', 'DsSelectionBar'].includes(card.id))).toBe(false);
  await captureCards({browser, root: siteRoot(), cards, mode: 'current', outDir: testInfo.outputPath('full-new')});
  for (const id of ['AngularSetup', 'AngularComponents']) {
    expect(cards.find(card => card.id === id)?.layout).toBe('guide');
    expect(existsSync(testInfo.outputPath('full-new', `${id}-DEFAULT-light-cozy.png`))).toBe(true);
  }
});

test('repeated original renders never accept an intentionally changed preview', async ({browser}, testInfo) => {
  const referenceRoot = siteRoot(), candidateRoot = testInfo.outputPath('changed-site');
  const cards = catalogueCards().filter(card => ['overview', 'Admin'].includes(card.id));
  copyTree(referenceRoot, candidateRoot);
  const outDir = testInfo.outputPath('negative-old');
  await captureCards({browser, root: referenceRoot, cards, mode: 'current', outDir});
  const path = join(candidateRoot, 'design-system/components/Admin/preview.html');
  writeFileSync(path, readFileSync(path, 'utf8').replace('</head>', '<style>#root{opacity:.5!important}</style></head>'));
  await expect(captureCards({
    browser, root: candidateRoot, cards: cards.filter(card => card.id === 'Admin'), mode: 'current',
    outDir: testInfo.outputPath('negative-new'), compareDir: outDir, referenceRoot, referenceMode: 'current',
  })).rejects.toThrow(/visual mismatch/);
});
