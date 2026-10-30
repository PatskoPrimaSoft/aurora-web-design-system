import assert from 'node:assert/strict';
import { createSiteFixture } from './fixture.mjs';
import { checkArticles } from './articles.mjs';
import { checkTokens } from './tokens.mjs';
import { checkShell } from './shell.mjs';
import { checkDocuments, checkGuides } from './guides.mjs';
import { checkComponents } from './components.mjs';

const checks = {
  articles: checkArticles,
  tokens: checkTokens,
  shell: checkShell,
  guides: checkGuides,
  documents: checkDocuments,
  components: checkComponents,
};
const args = process.argv.slice(2);
const pageFlag = args.find((arg) => arg.startsWith('--pages='));
const selectedPages = pageFlag?.slice('--pages='.length).split(',').filter(Boolean);
if (selectedPages && !selectedPages.length)
  throw new Error('--pages requires at least one article slug');
const requested = args.filter((arg) => arg !== pageFlag);
const names = requested.length ? [...new Set(requested)] : Object.keys(checks);
if (selectedPages && !names.includes('articles'))
  throw new Error('--pages applies to the articles group');
for (const name of names) {
  if (!Object.hasOwn(checks, name)) throw new Error('Unknown site test group: ' + name);
}
const fixture = await createSiteFixture();
try {
  for (const name of names) {
    // Each group starts from the same viewport regardless of the selected execution order.
    await fixture.page.setViewportSize({ width: 1472, height: 1000 });
    if (name === 'articles') await checkArticles(fixture, selectedPages);
    else await checks[name](fixture);
    assert.deepEqual(fixture.errors, []);
    console.log('documentation-site: ' + name + ' passed');
  }
} finally {
  await fixture.close();
}
