import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// During migration the original calculator is the reference for the transferred algorithm.
// Replace this reference with fixtures when the old page is retired.
export function checkPaletteCalculator(root) {
  const original = readFileSync(
    join(root, 'design-system/components/DsBrandPick/preview.html'),
    'utf8',
  ).match(/<\/main><script>([\s\S]*?)<\/script>/)[1];
  const reference = original.slice(0, original.indexOf('function link('));
  const compiled = ts.transpileModule(
    readFileSync(
      join(root, 'documentation-site/src/app/pages/foundations/theme-colors/palette-calculator.ts'),
      'utf8',
    ),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    },
  ).outputText;
  const module = { exports: {} };
  runInNewContext(compiled, { exports: module.exports, module });
  for (const [brand, accent] of [
    ['#2b5f9e', '#efd63c'],
    ['#ffffff', '#c1291f'],
    ['#000000', '#ffffff'],
    ['#ff00ff', '#00ff00'],
    ['#157a45', '#157a45'],
  ]) {
    const nodes = new Map();
    const element = (id) => {
      if (!nodes.has(id))
        nodes.set(id, {
          value: id === 'bt' ? brand : id === 'at' ? accent : id === 'nm' ? 'CUSTOM' : '',
          innerHTML: '',
          textContent: '',
          style: { cssText: '', setProperty() {} },
          setAttribute() {},
          querySelector() {
            return { style: {} };
          },
        });
      return nodes.get(id);
    };
    runInNewContext(reference + '\nrun();', { document: { getElementById: element } });
    const actual = module.exports.calculatePalette(brand, accent, 'CUSTOM');
    for (const [key, row] of Object.entries(actual.rows)) {
      assert.ok(
        element('r-' + key).innerHTML.includes('background:' + row.color + '"'),
        key + ': colour',
      );
      for (const [message] of row.checks) {
        assert.ok(element('c-' + key).innerHTML.includes(message), key + ': contrast explanation');
      }
    }
    assert.equal(
      actual.css,
      element('out-code').textContent,
      'Palette CSS must match the source calculator',
    );
    assert.equal(
      actual.summary,
      element('check-summary').textContent,
      'Contrast summary must match',
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  checkPaletteCalculator(fileURLToPath(new URL('../../', import.meta.url)));
  console.log('Palette calculator: five colour pairs match the canonical implementation');
}
