import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import MarkdownIt from 'markdown-it';
import { parseFragment } from 'parse5';
import { expect } from '@playwright/test';
import { pageViolations } from './accessibility.mjs';

const pages = [
  {
    path: 'angular/setup',
    title: 'Подключение Angular',
    source: 'design-system/docs/usage.md',
    codes: 17,
  },
  {
    path: 'angular/adding-components',
    title: 'Добавление компонентов',
    source: 'ng-ui-kit/docs/adding-components.md',
    codes: 5,
  },
  {
    path: 'migration/breakpoints',
    title: 'Брейкпоинты: решения по миграции',
    source: 'design-system/components/DsBreakpointsDecisions/README.md',
    preview: 'design-system/components/DsBreakpointsDecisions/preview.html',
    codes: 0,
  },
];
const plain = (node) =>
  node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(plain).join('');
const compact = (text) => text.replace(/\s/g, '');

export async function checkGuides({ root, page, url, modes }) {
  const markdown = new MarkdownIt();
  for (const guide of pages) {
    const source = readFileSync(join(root, guide.source), 'utf8');
    const tokens = markdown.parse(source, {});
    const headings = tokens.flatMap((token, index) =>
      token.type === 'heading_open' && ['h2', 'h3'].includes(token.tag)
        ? [tokens[index + 1].children.map((child) => child.content).join('')]
        : [],
    );
    const fragments = [parseFragment(markdown.render(source))];
    if (guide.preview) {
      const preview = readFileSync(join(root, guide.preview), 'utf8').match(
        /<body[^>]*>([\s\S]*?)<\/body>/,
      )[1];
      const tree = parseFragment(preview);
      const originalHeadings = [];
      const collect = (node) => {
        if (node.tagName === 'h2') originalHeadings.push(plain(node));
        for (const child of node.childNodes ?? []) collect(child);
      };
      collect(tree);
      headings.unshift(...originalHeadings);
      fragments.push(tree);
    }
    const paragraphs = [];
    const collect = (node) => {
      // Keep reference-table contents; prose is intentionally edited for the Angular site.
      if (node.tagName === 'td' && !plain(node.parentNode).includes('React'))
        paragraphs.push(compact(plain(node)));
      for (const child of node.childNodes ?? []) collect(child);
    };
    for (const fragment of fragments) collect(fragment);
    for (const [theme, appearance, density] of modes) {
      await page.goto(
        url + guide.path + `?theme=${theme}&appearance=${appearance}&density=${density}`,
      );
      await expect(page.locator('h1')).toHaveText(guide.title);
      await expect(page.locator('article h2, article h3')).toHaveText(headings);
      await expect(page.locator('.page-contents a')).toHaveText(headings);
      await expect(page.locator('body')).toHaveAttribute('data-ds-appearance', 'light');
      await expect(page.locator('aurora-code-block')).toHaveCount(guide.codes);
      const text = compact(await page.locator('article').textContent());
      for (const paragraph of paragraphs)
        assert.ok(
          text.includes(paragraph),
          guide.path + ': source paragraph or table cell missing: ' + paragraph.slice(0, 80),
        );
      assert.doesNotMatch(text, /React-компоненты|ReactDOM|Next\.js|\.jsx|onApply|onClear/);
    }
    const fences = tokens.filter((token) => token.type === 'fence');
    assert.deepEqual(
      await page.locator('aurora-code-block pre code').allTextContents(),
      fences.map((token) => token.content),
      guide.path + ': code must retain source indentation and placeholders',
    );
    const ids = await page
      .locator('article [id]')
      .evaluateAll((elements) => elements.map((element) => element.id));
    assert.equal(new Set(ids).size, ids.length, guide.path + ': unique anchors');
    for (const anchor of await page.locator('article a[href*="#"]').all()) {
      const target = new URL(await anchor.getAttribute('href'), page.url());
      if (target.pathname === new URL(page.url()).pathname)
        assert.ok(ids.includes(decodeURIComponent(target.hash.slice(1))), target.href);
    }
    assert.deepEqual(await pageViolations(page), [], guide.path + ': accessibility');
    const lastId = await page.locator('.page-contents a').last().getAttribute('href');
    await page.locator('.page-contents a').last().click();
    const fragment = decodeURIComponent(new URL(lastId, page.url()).hash.slice(1));
    await expect(page.locator(`[id="${fragment}"]`)).toBeFocused();
    await page.reload();
    await expect(page.locator(`[id="${fragment}"]`)).toBeFocused();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url + guide.path);
    await expect(page.locator('.page-contents details')).not.toHaveAttribute('open');
    await page.locator('.page-contents summary').click();
    await page.locator('.page-contents a').last().click();
    await expect(page.locator(`[id="${fragment}"]`)).toBeFocused();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      guide.path + ': mobile overflow',
    );
    assert.deepEqual(await pageViolations(page), [], guide.path + ': mobile accessibility');
    await page.setViewportSize({ width: 1472, height: 1000 });
  }
  await page.goto(url + 'angular/setup');
  await expect(page.locator('aurora-code-block pre').first()).toHaveAttribute('role', 'group');
  const contents = page.locator('.page-contents');
  assert.ok(
    await contents.evaluate((element) => element.scrollHeight > element.clientHeight),
    'Long contents must scroll within the available height',
  );
  await expect(page.locator('aurora-code-block .language').filter({ hasText: 'YAML' })).toHaveCount(
    1,
  );
  assert.ok(
    await page.locator('aurora-code-block .hljs-attr').count(),
    'Structured snippets must be highlighted',
  );
  await page.goto(url + 'foundations/iconography?theme=RED2&appearance=dark&density=compact');
  await page.getByText('Технические параметры', { exact: true }).click();
  await page.getByRole('link', { name: 'Подключение в Angular', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Подключение Angular');
  assert.equal(new URL(page.url()).searchParams.get('theme'), 'RED2');
  await page.goto(url);
  await page.getByRole('link', { name: 'руководство по подключению', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Подключение Angular');
  await expect(
    page
      .getByRole('navigation', { name: 'Разделы документации' })
      .getByRole('heading', { name: 'Angular UI kit', exact: true }),
  ).toHaveCount(1);
  await expect(
    page
      .getByRole('navigation', { name: 'Разделы документации' })
      .getByRole('heading', { name: 'Миграция', exact: true }),
  ).toHaveCount(1);
}

export async function checkDocuments(fixture) {
  await checkStandaloneDocument(fixture);
  await checkReferenceDocuments(fixture);
}

async function checkStandaloneDocument({ root, page, url }) {
  const source = new MarkdownIt().render(
    readFileSync(join(root, 'docs/typography-migration.md'), 'utf8'),
  );
  const expected = [];
  const collect = (node) => {
    if (['p', 'li'].includes(node.tagName)) expected.push(compact(plain(node)));
    for (const child of node.childNodes ?? []) collect(child);
  };
  collect(parseFragment(source));
  await page.goto(url + 'foundations/typography?theme=RED2&appearance=dark&density=compact');
  await page.getByRole('link', { name: 'Смена типографической системы', exact: true }).click();
  assert.equal(
    new URL(page.url()).pathname,
    new URL(url).pathname + 'documents/typography-migration',
  );
  assert.equal(new URL(page.url()).searchParams.get('theme'), 'RED2');
  for (const width of [1472, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    // Direct opening and an anchor must work without a previous catalogue visit.
    await page.goto(
      url +
        'documents/typography-migration?theme=RED2&appearance=dark&density=compact#правила-переноса',
    );
    await expect(page.locator('h1')).toHaveText('Смена типографической системы');
    await expect(page.locator('#catalog-navigation')).toHaveCount(0);
    await expect(page.locator('.mobile-menu')).toHaveCount(0);
    await expect(page.locator('.page-contents')).toHaveCount(0);
    await expect(page.locator('.catalog-header')).toBeVisible();
    await expect(page.locator('[id="правила-переноса"]')).toBeFocused();
    const text = compact(await page.locator('article').textContent());
    for (const paragraph of expected)
      assert.ok(text.includes(paragraph), 'Document source text retained');
    const main = await page.locator('#catalog-main').boundingBox();
    assert.ok(main.x <= 1, 'Document must not reserve space for the left navigation');
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    assert.deepEqual(await pageViolations(page), [], 'Standalone document accessibility');
    await page.locator('#catalog-main').evaluate((el) => el.scrollTo(0, 0));
    await page.screenshot({ path: join(root, `.tmp/standalone-document-${width}.png`) });
    await page.getByRole('link', { name: 'На главную', exact: true }).click();
    await expect(page.locator('h1')).toHaveText('Прочитать первым');
    await expect(page.locator('#catalog-navigation')).toHaveCount(1);
    await expect(page.locator('.mobile-menu')).toHaveCount(1);
    assert.equal(new URL(page.url()).searchParams.get('theme'), 'RED2');
  }
  await page.setViewportSize({ width: 1472, height: 1000 });
}

const documents = [
  {
    path: 'documents/angular-ui-kit',
    title: 'Правила Angular UI kit',
    source: 'ng-ui-kit/docs/development.md',
    curated: true,
  },
  {
    path: 'documents/design',
    title: 'Дизайн-правила Aurora',
    source: 'design-system/docs/design.md',
    curated: true,
  },
  {
    path: 'documents/token-names',
    title: 'Регламент имён токенов',
    source: 'design-system/docs/tokens.md',
    curated: true,
  },
  {
    path: 'documents/release',
    title: 'Версии и публикация',
    source: 'docs/release.md',
    curated: true,
  },
  {
    path: 'documents/lint',
    title: 'Линтер системы',
    source: 'design-system/lint/README.md',
  },
];

// Check the shared visual contract as well as content: missing dev styles look like valid HTML.
async function checkDocumentStyles(page) {
  const styles = await page.locator('article').evaluate((article) => {
    const link = article.querySelector('a');
    const probe = document.createElement('span');
    probe.style.color = 'var(--ds-brand-text)';
    article.append(probe);
    const expected = getComputedStyle(probe).color;
    const heading = article.querySelector('h2');
    const standalone = article.classList.contains('document');
    probe.style.font = standalone ? 'var(--ds-type-section)' : 'var(--ds-type-title)';
    const expectedHeadingFont = getComputedStyle(probe).font;
    probe.remove();
    return {
      color: getComputedStyle(link).color,
      expected,
      headingFont: heading ? getComputedStyle(heading).font : null,
      expectedHeadingFont,
      margin: article.querySelector('li + li')
        ? getComputedStyle(article.querySelector('li + li')).marginTop
        : null,
    };
  });
  assert.equal(styles.color, styles.expected, 'Links must use the shared design token');
  if (styles.headingFont !== null)
    assert.equal(
      styles.headingFont,
      styles.expectedHeadingFont,
      'Headings must use shared typography',
    );
  if (styles.margin !== null)
    assert.equal(styles.margin, '8px', 'List items must retain shared spacing');
}

async function checkReferenceDocuments({ root, page, url }) {
  const idsByRoute = new Map();
  const links = [];
  for (const document of documents) {
    const markdown = new MarkdownIt();
    const source = readFileSync(join(root, document.source), 'utf8');
    const expected = [];
    const collect = (node) => {
      if (['p', 'th', 'td'].includes(node.tagName)) expected.push(compact(plain(node)));
      for (const child of node.childNodes ?? []) collect(child);
    };
    if (!document.curated) collect(parseFragment(markdown.render(source)));
    for (const width of [1472, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(url + document.path);
      await expect(page.locator('h1')).toHaveText(document.title);
      await expect(page.locator('#catalog-navigation, .mobile-menu, .page-contents')).toHaveCount(
        0,
      );
      await expect(page.locator('.catalog-header')).toBeVisible();
      const text = compact(await page.locator('article').textContent());
      if (document.path === 'documents/design') {
        for (const id of [
          'язык-и-тексты',
          'визуальные-основы',
          'типографика',
          'состояния',
          'раскладка',
          'графики',
          'доступность',
          'диалоги-и-оверлеи',
          'сортировка',
        ])
          await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
        await expect(page.locator('article')).not.toContainText('React');
        await expect(page.locator('#компоненты')).toHaveCount(0);
        assert.doesNotMatch(text, /DsAppHeader|DsUserMenu|DsStringsProvider|onChange\(|onClose/);
      }
      if (document.curated && document.path !== 'documents/design') {
        const tokens = markdown.parse(source, {});
        const headings = tokens.flatMap((token, index) =>
          token.type === 'heading_open' && token.tag === 'h2'
            ? [tokens[index + 1].children.map((child) => child.content).join('')]
            : [],
        );
        await expect(page.locator('article h2')).toHaveText(headings);
        assert.doesNotMatch(text, /React-компоненты|DsAppHeader|DsUserMenu|DsStringsProvider/);
      }
      for (const paragraph of expected)
        assert.ok(
          text.includes(paragraph),
          document.path + ': missing source text: ' + paragraph.slice(0, 90),
        );
      assert.deepEqual(
        await page.locator('aurora-code-block pre code').allTextContents(),
        markdown
          .parse(source, {})
          .filter((t) => t.type === 'fence')
          .map((t) => t.content),
        document.path + ': code indentation and content',
      );
      await checkDocumentStyles(page);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        document.path + ': overflow',
      );
      assert.deepEqual(await pageViolations(page), [], document.path + ': accessibility');
    }
    const ids = await page
      .locator('article [id]')
      .evaluateAll((elements) => elements.map((el) => el.id));
    assert.equal(new Set(ids).size, ids.length, document.path + ': duplicate anchors');
    idsByRoute.set(new URL(page.url()).pathname, ids);
    links.push(
      ...(await page
        .locator('article a[href]')
        .evaluateAll((elements) => elements.map((el) => el.href))),
    );
    await page.getByRole('link', { name: 'На главную', exact: true }).click();
    await expect(page.locator('h1')).toHaveText('Прочитать первым');
  }
  for (const href of links) {
    const target = new URL(href);
    const ids = idsByRoute.get(target.pathname);
    if (ids && target.hash)
      assert.ok(
        ids.includes(decodeURIComponent(target.hash.slice(1))),
        'Broken document anchor: ' + href,
      );
  }
  for (const path of ['angular/setup', 'angular/adding-components']) {
    await page.goto(url + path);
    await checkDocumentStyles(page);
  }
  await page.setViewportSize({ width: 1472, height: 1000 });
}
