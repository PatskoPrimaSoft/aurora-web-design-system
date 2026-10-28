import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { parseFragment } from 'parse5';

async function articleViolations(page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const remaining = [];
  for (const violation of violations) {
    const nodes = [];
    for (const node of violation.nodes) {
      // Temporary yellow review markers are removed with their placeholders.
      // Ignore only their colour contrast; keep all other accessibility checks.
      const temporaryContrast =
        violation.id === 'color-contrast' &&
        node.target.length === 1 &&
        typeof node.target[0] === 'string' &&
        (await page
          .locator(node.target[0])
          .evaluate((element) =>
            Boolean(element.closest('.migration-placeholder[data-migration-placeholder]')),
          ));
      if (!temporaryContrast) nodes.push(node);
    }
    if (nodes.length)
      remaining.push({ id: violation.id, targets: nodes.map((node) => node.target) });
  }
  return remaining;
}

export async function checkArticles({ root, page, url, modes }, selectedPages) {
  const migratedFoundations = [
    ['colors', 'DsNeutrals', 'Нейтральные цвета'],
    ['shape', 'DsShape', 'Форма и глубина'],
    ['spacing', 'DsSpacing', 'Отступы и группировка'],
    ['breakpoints', 'DsBreakpoints', 'Адаптивность и брейкпоинты'],
    ['appearance', 'DsAppearance', 'Светлый и тёмный режим'],
    ['density', 'DsDensity', 'Плотность интерфейса'],
    ['hover', 'DsHover', 'Наведение и нажатие'],
    ['focus', 'DsFocus', 'Фокус'],
    ['iconography', 'DsIconography', 'Иконографика'],
    ['status', 'DsStatus', 'Цвета статусов'],
    ['motion', 'DsMotion', 'Анимация и переходы'],
    ['accessibility', 'DsAccessibility', 'Доступность'],
    ['content', 'DsContent', 'Тексты интерфейса'],
    ['layout', 'DsLayout', 'Сетка и компоновка'],
    ['sorting', 'DsSortingMenu', 'Сортировка вне таблицы'],
    ['themes', 'DsBrandThemes', 'Цветовые темы'],
    ['theme-colors', 'DsBrandPick', 'Подбор цветов темы'],
    ['charts', 'DsCharts', 'Цвета и оформление графиков'],
    ['logo', 'BrandLogoLockup', 'Логотип бренда'],
  ];
  if (selectedPages) {
    for (const slug of selectedPages) {
      assert.ok(
        migratedFoundations.some(([name]) => name === slug),
        'Unknown article: ' + slug,
      );
    }
  }
  const pages = selectedPages
    ? migratedFoundations.filter(([slug]) => selectedPages.includes(slug))
    : migratedFoundations;
  let lightContrast;
  for (const [slug, sourceId, title] of pages) {
    const original = readFileSync(
      join(root, 'design-system/components', sourceId, 'preview.html'),
      'utf8',
    );
    const main = original.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
    const headings = [...main.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((match) => match[1]);
    const supplementalHeadings = [
      ...readFileSync(
        join(root, 'design-system/components', sourceId, 'README.md'),
        'utf8',
      ).matchAll(/^## (.+)$/gm),
    ].map((match) => match[1].trim());
    const originalParagraphs = [];
    const textOf = (node) =>
      node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(textOf).join('');
    const collectParagraphs = (node) => {
      if (node.tagName === 'p') originalParagraphs.push(textOf(node).replace(/\s/g, ''));
      for (const child of node.childNodes ?? []) collectParagraphs(child);
    };
    collectParagraphs(parseFragment(main));
    for (const [theme, appearance, density] of modes) {
      await page.goto(
        url + `foundations/${slug}?theme=${theme}&appearance=${appearance}&density=${density}`,
      );
      await expect(page.locator('h1')).toHaveText(title);
      const related = page.locator('section[aria-labelledby="дальше"] > ul');
      if (await related.count()) {
        assert.equal(await related.evaluate((el) => getComputedStyle(el).paddingLeft), '40px');
        for (const item of await related.locator(':scope > li').all()) {
          assert.equal(await item.evaluate((el) => getComputedStyle(el).marginTop), '0px');
        }
      }
      await expect(page.locator('article h2')).toHaveText([...headings, ...supplementalHeadings]);
      const codeSection = page.locator(
        'section[aria-labelledby="' +
          supplementalHeadings[0].toLowerCase().replaceAll(' ', '-') +
          '"]',
      );
      assert.equal(await codeSection.evaluate((el) => getComputedStyle(el).marginTop), '40px');
      assert.equal(await codeSection.evaluate((el) => getComputedStyle(el).paddingTop), '32px');
      if (slug === 'colors') {
        assert.ok(
          (await page.locator('section[aria-labelledby="usage"]').textContent()).includes(
            '--ds-fg-disabled;',
          ),
          'No whitespace may separate the token and its semicolon',
        );
      }
      const migratedText = (await page.locator('article').textContent()).replace(/\s/g, '');
      for (const paragraph of originalParagraphs) {
        assert.ok(
          migratedText.includes(
            slug === 'iconography'
              ? paragraph.replace('APIипримерыReact', 'APIипримеры')
              : paragraph,
          ),
          `${slug}: original paragraph must be preserved`,
        );
      }
      await expect(page.locator('[data-migration-placeholder]').first()).toBeVisible();
      assert.equal(await page.locator('iframe').count(), 0);
      await page.evaluate(() => document.fonts.ready);
      if (slug === 'colors') {
        await expect(page.locator('#contrast-values td')).toHaveCount(12);
        const ratio = await page.locator('[data-contrast="fg/surface"]').textContent();
        if (appearance === 'light') lightContrast = ratio;
        else {
          assert.notEqual(ratio, lightContrast, 'Contrast must reflect the selected appearance');
          await expect(page.locator('[data-contrast="fg-subtle/surface-raised"]')).toHaveAttribute(
            'data-passes',
            'false',
          );
        }
        await page.locator('.reference-details').first().locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('.palette li')).toHaveCount(13);
        await expect(page.locator('.palette li').first()).toBeVisible();
        await page.locator('.reference-details').nth(1).locator('summary').click();
        await expect(page.locator('#alpha-values .alpha-row')).toHaveCount(7);
      } else if (slug === 'shape') {
        await page.locator('#radius-reference summary').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#radius-values li')).toHaveCount(7);
        const circle = await page
          .locator('#radius-values li')
          .last()
          .locator('.swatch')
          .boundingBox();
        assert.equal(circle.width, 64, 'Circle radius sample must keep its original width');
        assert.equal(circle.height, 64, 'Circle radius sample must have equal sides');
        await page.locator('#shadow-reference summary').click();
        await expect(page.locator('#shadow-values li')).toHaveCount(5);
        await expect(page.locator('aurora-code-block code')).toContainText(
          'border-radius: var(--ds-radius-lg)',
        );
      }
      if (slug === 'spacing' || slug === 'breakpoints') {
        if (slug === 'breakpoints') {
          assert.equal(
            await page
              .locator('h2[id="пример-кода"]')
              .evaluate((el) => getComputedStyle(el).marginTop),
            '32px',
          );
        }
        const reference = page.locator(
          slug === 'spacing' ? 'article details' : '#breakpoints-reference',
        );
        await expect(reference).not.toHaveAttribute('open');
        await reference.locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(reference).toHaveAttribute('open');
        await expect(reference.locator('tbody tr')).toHaveCount(slug === 'spacing' ? 4 : 6);
        if (slug === 'spacing') {
          await expect(reference.locator('aurora-code-block code')).toContainText(
            'gap: var(--ds-gap-xl)',
          );
        } else {
          await expect(page.locator('aurora-code-block code').first()).toContainText(
            '@media (min-width: 960px)',
          );
        }
        await expect(page.locator('aurora-example-block').first()).toHaveAttribute(
          'data-ds-theme',
          theme,
        );
        await expect(page.locator('aurora-example-block').first()).toHaveAttribute(
          'data-ds-appearance',
          appearance,
        );
        await expect(page.locator('aurora-example-block').first()).toHaveAttribute(
          'data-ds-density',
          density,
        );
      }
      if (slug === 'appearance' || slug === 'density') {
        const reference = page.locator('#' + slug + '-reference');
        await expect(reference).not.toHaveAttribute('open');
        await reference.locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(reference).toHaveAttribute('open');
        const ready = page.locator('#ready-interface');
        await expect(ready).toHaveAttribute('data-ds-theme', theme);
        await expect(ready).toHaveAttribute('data-ds-appearance', appearance);
        await expect(ready).toHaveAttribute('data-ds-density', density);
        const samples = page.locator(
          '#' + (slug === 'appearance' ? 'mode' : 'density') + '-comparison > *',
        );
        await expect(samples).toHaveCount(2);
        for (let i = 0; i < 2; i++) {
          await expect(samples.nth(i)).toHaveAttribute('data-ds-theme', theme);
          await expect(samples.nth(i)).toHaveAttribute(
            'data-ds-appearance',
            slug === 'appearance' ? ['light', 'dark'][i] : appearance,
          );
          await expect(samples.nth(i)).toHaveAttribute(
            'data-ds-density',
            slug === 'density' ? ['cozy', 'compact'][i] : density,
          );
        }
        if (slug === 'density') {
          await expect(reference.locator('tbody tr')).toHaveCount(5);
          await expect(reference.locator('tbody tr').first()).toContainText('36');
          await expect(reference.locator('tbody tr').first()).toContainText('30');
        } else {
          assert.notEqual(
            await samples.nth(0).evaluate((el) => getComputedStyle(el).backgroundColor),
            await samples.nth(1).evaluate((el) => getComputedStyle(el).backgroundColor),
            'Comparison must keep distinct light and dark surfaces',
          );
        }
      }
      if (slug === 'hover' || slug === 'focus') {
        const reference = page.locator('#' + slug + '-reference');
        await expect(reference).not.toHaveAttribute('open');
        await reference.locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(reference).toHaveAttribute('open');
        await expect(reference.locator('tbody tr')).toHaveCount(slug === 'hover' ? 2 : 3);
        for (const scene of await page.locator('.scene').all()) {
          await expect(scene).toHaveAttribute('data-ds-theme', theme);
          await expect(scene).toHaveAttribute('data-ds-appearance', appearance);
          await expect(scene).toHaveAttribute('data-ds-density', density);
        }
        if (slug === 'hover') {
          await expect(page.locator('#state-comparison .state-label')).toHaveText([
            'Обычно',
            'Наведение',
            'Нажатие',
          ]);
          const states = page.locator('#state-comparison .state-sample');
          await expect(states).toHaveCount(3);
          const images = await states.evaluateAll((elements) =>
            elements.map((el) => getComputedStyle(el).backgroundImage),
          );
          assert.equal(images[0], 'none');
          assert.notEqual(images[1], images[0]);
          assert.notEqual(images[1], images[2]);
          await expect(page.locator('#state-comparison button')).toHaveCount(0);
        } else {
          await expect(
            page.locator('#keyboard-navigation[data-migration-placeholder]'),
          ).toBeVisible();
          await expect(page.locator('.try-it kbd').first()).toHaveText('Tab');
        }
      }
      if (slug === 'iconography') {
        const dictionary = page.locator('#icon-dictionary');
        const groupSource = original.match(/const groups=(\[[\s\S]*?\]);/)[1];
        const names = [...groupSource.matchAll(/'([a-z_ ]+)'/g)].flatMap((match) =>
          match[1].split(' '),
        );
        await expect(dictionary.locator('.glyph code')).toHaveText(names);
        await expect(dictionary.locator('ds-icon')).toHaveCount(names.length);
        await expect(page.locator('#size-example ds-icon')).toHaveCount(4);
        const sizes = await page
          .locator('#size-example ds-icon')
          .evaluateAll((icons) => icons.map((el) => parseFloat(getComputedStyle(el).width)));
        assert.ok(sizes.every((size, index) => size > 0 && (!index || size > sizes[index - 1])));
        await expect(
          page.getByRole('img', { name: 'Доступ ограничен', exact: true }),
        ).toBeVisible();
        await expect(page.locator('#accessible-example ds-icon').first()).toHaveAttribute(
          'aria-hidden',
          'true',
        );
        await page.locator('article details summary').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('article details')).toHaveAttribute('open');
        await page.evaluate(() => document.fonts.ready);
        assert.ok(
          await page.evaluate(() => document.fonts.check('20px "Material Symbols Outlined"')),
        );
      }
      if (slug === 'status') {
        for (const id of ['status-roles', 'status-palette', 'status-custom']) {
          await page.locator('#' + id + ' summary').focus();
          await page.keyboard.press('Enter');
          await expect(page.locator('#' + id)).toHaveAttribute('open');
        }
        await expect(page.locator('.palette-row')).toHaveCount(5);
        await expect(page.locator('.status-dot')).toHaveCount(2);
        await expect(page.locator('aurora-code-block code')).toContainText(
          'color: var(--ds-success-fg)',
        );
        for (const sample of await page.locator('aurora-example-block[data-ds-theme]').all()) {
          await expect(sample).toHaveAttribute('data-ds-theme', theme);
          await expect(sample).toHaveAttribute('data-ds-appearance', appearance);
          await expect(sample).toHaveAttribute('data-ds-density', density);
        }
      }
      if (slug === 'motion') {
        await page.locator('section[aria-labelledby="reduced"] summary').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#loading-demo')).toBeVisible();
        await page.locator('section[aria-labelledby="для-разработчика"] summary').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('.reference-table tbody tr')).toHaveCount(4);
        await expect(page.locator('aurora-code-block code')).toContainText(
          '@media (prefers-reduced-motion: reduce)',
        );
        assert.equal(
          await page
            .locator('[data-motion-reduced]')
            .evaluate((el) => getComputedStyle(el).getPropertyValue('--ds-dur-fast').trim()),
          '0ms',
        );
      }
      if (slug === 'accessibility' || slug === 'content') {
        await expect(page.locator('#demo')).toHaveAttribute('data-ds-theme', theme);
        await expect(page.locator('#demo')).toHaveAttribute('data-ds-appearance', appearance);
        await expect(page.locator('#demo')).toHaveAttribute('data-ds-density', density);
        for (const details of await page.locator('article details').all()) {
          await expect(details).not.toHaveAttribute('open');
          await details.locator('summary').focus();
          await page.keyboard.press('Enter');
          await expect(details).toHaveAttribute('open');
        }
        if (slug === 'accessibility') {
          await expect(page.locator('article a[href^="https://www.w3.org/"]')).toHaveCount(3);
          await expect(
            page.locator(
              'section[aria-labelledby="для-разработчика"] [data-migration-placeholder]',
            ),
          ).toBeVisible();
          await expect(page.locator('#demo form')).toHaveCount(0);
        } else {
          await expect(page.locator('#demo h3')).toHaveText([
            'Слишком общее',
            'Понятно, что дальше',
          ]);
          await expect(page.locator('#demo .comparison p')).toHaveText([
            'Нет данных',
            'Объекты не найдены',
            'Измените запрос или сбросьте фильтры.',
          ]);
          await expect(page.locator('section[aria-labelledby="data"] li')).toHaveCount(4);
        }
      }
      if (slug === 'layout' || slug === 'sorting') {
        for (const scene of await page.locator('aurora-example-block.scene').all()) {
          await expect(scene).toHaveAttribute('data-ds-theme', theme);
          await expect(scene).toHaveAttribute('data-ds-appearance', appearance);
          await expect(scene).toHaveAttribute('data-ds-density', density);
        }
        for (const details of await page.locator('article details').all()) {
          await expect(details).not.toHaveAttribute('open');
          await details.locator('summary').focus();
          await page.keyboard.press('Enter');
          await expect(details).toHaveAttribute('open');
        }
        if (slug === 'layout') {
          await expect(page.locator('aurora-code-block .language')).toHaveText([
            'workspace.css',
            'product-grid.css',
          ]);
          await expect(page.locator('#anatomy-example .column-sheet span')).toHaveCount(12);
          await expect(page.locator('#spans-example .span-row')).toHaveCount(4);
          await expect(page.locator('#spans-example .span-block')).toHaveText([
            '12',
            '6',
            '6',
            '4',
            '4',
            '4',
            '8',
            '4',
          ]);
          await expect(page.locator('#centering-example .span-block')).toHaveText([
            '8 колонок',
            '10 колонок',
            '12 колонок',
          ]);
          const centered = await page
            .locator('#centering-example .span-block')
            .evaluateAll((blocks) =>
              blocks.map((el) => {
                const r = el.getBoundingClientRect();
                return r.left + r.width / 2;
              }),
            );
          assert.ok(centered.every((center) => Math.abs(center - centered[0]) < 1));
          await expect(page.locator('.grid-standard tbody tr')).toHaveCount(4);
          await expect(page.locator('aurora-code-block code').first()).toContainText(
            '@container (max-width: 600px)',
          );
          await expect(page.locator('aurora-code-block code').nth(1)).toContainText(
            'column-gap: var(--ds-gap-sm)',
          );
          assert.equal(
            await page
              .locator('#spans-example .span-row')
              .first()
              .evaluate((el) => getComputedStyle(el).columnGap),
            density === 'cozy' ? '16px' : '12px',
          );
        } else {
          await expect(page.locator('#sorting-reference')).toHaveAttribute('open');
          await expect(page.locator('#sorting-reference code').first()).toHaveText(
            'value={ {key, dir} }',
          );
          await expect(
            page.locator('section[aria-labelledby="пример-кода"] [data-migration-placeholder]'),
          ).toBeVisible();
          await expect(page.locator('#ready-interface button')).toHaveCount(0);
        }
      }
      if (slug === 'themes' || slug === 'theme-colors') {
        for (const details of await page.locator('article details').all()) {
          await details.locator('summary').focus();
          await page.keyboard.press('Enter');
          await expect(details).toHaveAttribute('open');
        }
        if (slug === 'themes') {
          await expect(page.locator('.token-row')).toHaveCount(10);
          for (const value of await page.locator('.token-row .value').all()) {
            await expect(value).not.toBeEmpty();
          }
          await expect(page.locator('#brand-comparison > *').first()).toHaveAttribute(
            'data-ds-theme',
            'DEFAULT',
          );
          await expect(page.locator('#brand-comparison > *').last()).toHaveAttribute(
            'data-ds-theme',
            'RED2',
          );
          for (const sample of await page.locator('#brand-comparison > *').all()) {
            await expect(sample).toHaveAttribute('data-ds-appearance', appearance);
            await expect(sample).toHaveAttribute('data-ds-density', density);
          }
          await expect(page.locator('#ready-interface')).toHaveAttribute('data-ds-theme', theme);
          await expect(page.locator('#token-values .token-row').first()).toHaveAttribute(
            'data-ds-theme',
            theme,
          );
        } else {
          await expect(page.locator('.contrast-pair')).toHaveCount(6);
          await expect(page.locator('#out .language')).toHaveText('CSS');
          await expect(page.locator('#palette-reference .tok')).toHaveCount(15);
          await expect(page.locator('#pl')).toHaveAttribute('data-ds-appearance', 'light');
          await expect(page.locator('#pd')).toHaveAttribute('data-ds-appearance', 'dark');
          await expect(page.locator('#pl')).toHaveAttribute('data-ds-density', density);
          await expect(page.locator('#r-brand .hex')).toHaveText('#2b5f9e');
          await page.locator('#bt').fill('#ffffff');
          await expect(page.locator('#r-brand .hex')).not.toHaveText('#ffffff');
          await expect(page.locator('#bs')).toHaveValue('#ffffff');
          const validCode = await page.locator('aurora-code-block code').textContent();
          await page.locator('#bt').fill('invalid');
          await expect(page.locator('#bt')).toHaveAttribute('aria-invalid', 'true');
          await expect(page.locator('#input-error')).toContainText('Введите цвет');
          assert.equal(await page.locator('aurora-code-block code').textContent(), validCode);
          await expect(page.locator('#bs')).toHaveValue('#ffffff');
          await page.locator('#bs').fill('#2b5f9e');
          await expect(page.locator('#bt')).toHaveValue('#2b5f9e');
          await expect(page.locator('#input-error')).toBeEmpty();
          await page.locator('#at').fill('#c1291f');
          await expect(page.locator('#warns')).toContainText('danger');
          await page.locator('#nm').fill('a b:1');
          await expect(page.locator('aurora-code-block code')).toContainText(
            '[data-ds-theme="AB1"]',
          );
          await page.locator('#at').fill('#efd63c');
        }
      }
      if (slug === 'charts' || slug === 'logo') {
        for (const details of await page.locator('article details').all()) {
          await expect(details).not.toHaveAttribute('open');
          await details.locator('summary').focus();
          await page.keyboard.press('Enter');
          await expect(details).toHaveAttribute('open');
        }
        await expect(page.locator('#ready-interface')).toHaveAttribute('data-ds-theme', theme);
        await expect(page.locator('#ready-interface')).toHaveAttribute(
          'data-ds-appearance',
          appearance,
        );
        await expect(page.locator('#ready-interface')).toHaveAttribute('data-ds-density', density);
        if (slug === 'charts') {
          await expect(page.locator('#data-rows tr')).toHaveCount(7);
          await expect(page.locator('#data-rows tr').nth(3).locator('th,td')).toHaveText([
            '11:00',
            'Нет данных',
            '64',
          ]);
          await expect(page.locator('#series-palette code')).toHaveText(
            Array.from({ length: 8 }, (_, i) => 'series-' + (i + 1)),
          );
          await expect(page.locator('#series-palette')).toHaveAttribute(
            'data-ds-appearance',
            appearance,
          );
          const swatches = await page
            .locator('#series-palette .swatch')
            .evaluateAll((items) => items.map((el) => getComputedStyle(el).backgroundColor));
          assert.equal(new Set(swatches).size, 8);
          assert.ok(swatches.every((color) => color !== 'rgba(0, 0, 0, 0)'));
        } else {
          await expect(page.locator('article img')).toHaveCount(5);
          for (const image of await page.locator('article img').all()) {
            assert.ok(await image.evaluate((el) => el.complete && el.naturalWidth > 0));
            await expect(image).toHaveAttribute('alt', /.+/);
          }
          await expect(page.locator('.sample')).toHaveCount(2);
          for (const sample of await page.locator('.sample').all()) {
            await expect(sample).toHaveAttribute('data-ds-appearance', 'light');
            await expect(sample).toHaveAttribute('data-ds-theme', theme);
          }
          await expect(page.locator('#background-scene')).toHaveAttribute(
            'data-ds-appearance',
            appearance,
          );
          assert.equal(
            await page.locator('.plate img').evaluate((el) => getComputedStyle(el).width),
            '26px',
          );
          assert.equal(
            await page.locator('.plate').evaluate((el) => getComputedStyle(el).width),
            '34px',
          );
        }
      }
      assert.deepEqual(
        await articleViolations(page),
        [],
        `${slug}/${theme}/${appearance}/${density}: accessibility`,
      );
      await page.locator('.page-contents a').last().click();
      await expect(
        page.locator(
          'h2[id="' + supplementalHeadings.at(-1).toLowerCase().replaceAll(' ', '-') + '"]',
        ),
      ).toBeFocused();
      await page.reload();
      await expect(
        page.locator(
          'h2[id="' + supplementalHeadings.at(-1).toLowerCase().replaceAll(' ', '-') + '"]',
        ),
      ).toBeFocused();
      if (theme === 'DEFAULT' && appearance === 'light') {
        await page.locator('#catalog-main').evaluate((el) => el.scrollTo(0, 0));
        await expect(page.locator('.page-contents a[aria-current="location"]')).toHaveText(
          headings[0],
        );
        await page.screenshot({ path: join(root, `.tmp/${slug}-wide.png`) });
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url + `foundations/${slug}?theme=RED2&appearance=dark&density=compact`);
    await expect(page.locator('h1')).toHaveText(title);
    for (const summary of await page.locator('article summary').all()) await summary.click();
    assert.deepEqual(await articleViolations(page), [], `${slug}: mobile accessibility`);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await page.locator('#catalog-main').evaluate((el) => el.scrollTo(0, 0));
    await page.screenshot({ path: join(root, `.tmp/${slug}-mobile.png`) });
    await page.setViewportSize({ width: 1472, height: 1000 });
  }
}
