import { test, expect } from '@playwright/test';
import { buildCatalogue } from '../../tools/catalog/build.mjs';
import { serveRoot } from '../../tools/baseline/render.mjs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
test('disabled selection stays legible and mixed selection selects all with the keyboard', async ({ page }, testInfo) => {
  await buildCatalogue({ root, outDir: `${root}/site` });
  const served = await serveRoot(`${root}/site`);
  try {
    for (const [theme, appearance, density] of [['DEFAULT', 'light', 'cozy'], ['DEFAULT', 'dark', 'compact'], ['RED2', 'light', 'cozy'], ['RED2', 'dark', 'compact']]) {
      const query = `theme=${theme}&appearance=${appearance}&density=${density}`;
      await page.goto(`${served.url}/components/DsCheck/preview.html?${query}`);
      await page.locator('#root > *').waitFor();
      const checks = await page.locator('#root').evaluate(root => {
        const luminance = color => {
          const values = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => {
            v /= 255;
            return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
          });
          return .2126 * values[0] + .7152 * values[1] + .0722 * values[2];
        };
        const contrast = (a, b) => {
          const x = luminance(a), y = luminance(b);
          return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
        };
        const surface = getComputedStyle(document.body).backgroundColor;
        // The disabled column must preserve all three glyphs: tick, dash and radio dot.
        const rows = [...root.querySelectorAll('tbody tr')];
        const disabled = rows.map(row => row.querySelector('td:last-child > span'));
        return disabled.filter(Boolean).map(box => {
          const css = getComputedStyle(box), mark = box.firstElementChild;
          const ink = mark && getComputedStyle(mark);
          const markColor = ink?.backgroundColor === 'rgba(0, 0, 0, 0)' ? ink.color : ink?.backgroundColor;
          return { width: css.borderTopWidth, border: contrast(css.borderTopColor, surface), mark: mark ? contrast(markColor, css.backgroundColor) : null };
        });
      });
      expect(checks).toHaveLength(5);
      expect(checks.filter(check => check.mark !== null)).toHaveLength(3);
      for (const check of checks) {
        expect(check.width).toBe('2px');
        expect(check.border).toBeGreaterThanOrEqual(2);
        if (check.mark !== null) expect(check.mark).toBeGreaterThanOrEqual(3);
      }
      await page.screenshot({ path: testInfo.outputPath(`selection-${theme}-${appearance}.png`) });
      await page.goto(`${served.url}/components/DsCheckButton/preview.html?${query}`);
      const control = page.getByRole('checkbox').first();
      await expect(control).toHaveAttribute('aria-checked', 'mixed');
      await control.focus();
      await page.keyboard.press('Space');
      await expect(control).toHaveAttribute('aria-checked', 'true');
      await page.keyboard.press('Enter');
      await expect(control).toHaveAttribute('aria-checked', 'false');
      await expect(control).toBeFocused();
      await page.goto(`${served.url}/components/DsCheckbox/preview.html?${query}`);
      const mixed = page.getByRole('checkbox', { name: 'Все объекты группы' });
      await expect(mixed).toHaveJSProperty('indeterminate', true);
      await mixed.focus();
      await page.keyboard.press('Space');
      await expect(mixed).toBeChecked();
      await expect(mixed).toHaveJSProperty('indeterminate', false);
    }
  } finally {
    served.server.closeAllConnections();
    await new Promise(resolve => served.server.close(resolve));
  }
});
