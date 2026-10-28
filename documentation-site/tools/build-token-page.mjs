import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { renderTokenReference } from '../../design-system/tools/docs/tokens.mjs';
import { readTokenModel } from '../../design-system/tools/tokens/model.mjs';

// Reuse the canonical token catalogue at build time; no old site scripts run in Angular.
export function buildTokenPage() {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const out = join(root, 'documentation-site/.tmp');
  const model = readTokenModel(
    JSON.parse(readFileSync(join(root, 'design-system/tokens/source.json'), 'utf8')),
  );
  const reference = renderTokenReference(model);
  const categories = [
    ...reference.html.matchAll(
      /<section class="token-section" id="token-([^"]+)" data-category="[^"]+" data-group="([^"]+)"><h2>([^<]+)<\/h2>/g,
    ),
  ].map(([, id, group, title]) => ({ id, group, title }));
  const categoryGroups = new Map(categories.map(({ id, group }) => [id, group]));
  if (!categories.length || !reference.entries.length) {
    throw new Error('Token page: canonical renderer returned an empty catalogue');
  }
  const entries = reference.entries.map(({ name, category, usage }) => {
    const group = categoryGroups.get(category);
    if (!group) throw new Error(`Token page: category ${category} was not found for ${name}`);
    return { name, category, group, search: (name + ' ' + usage).toLocaleLowerCase('ru') };
  });
  let html = reference.html.replace(/<link[^>]+>/, '').replace(/<script[\s\S]*?<\/script>/, '');
  html = html.replaceAll('@', '&#64;').replaceAll('{', '&#123;').replaceAll('}', '&#125;');
  html = html.replace(
    '<div class="token-reference">',
    '<div class="token-reference" [attr.data-brand]="settings.theme()" (click)="handleClick($event)">',
  );
  html = html.replace(
    /data-token-group="([^"]+)" aria-pressed="[^"]+"/g,
    (_, id) =>
      `data-token-group="${id}" [attr.aria-pressed]="group() === '${id}'" (click)="selectGroup('${id}')"`,
  );
  html = html.replace(
    '<p class="token-group-description"></p>',
    '<p class="token-group-description" [textContent]="description()"></p>',
  );
  html = html.replace(
    '<input type="search"',
    '<input type="search" [value]="query()" (input)="selectQuery($any($event.target).value)"',
  );
  html = html.replace(
    '<select aria-label="Категория">',
    '<select aria-label="Категория" [value]="category()" (change)="selectCategory($any($event.target).value)">',
  );
  html = html.replace(
    '<select aria-label="Бренд">',
    '<select aria-label="Бренд" [value]="settings.theme()" (change)="selectBrand($any($event.target).value)">',
  );
  html = html.replace(
    '<p class="token-count" role="status"></p>',
    '<p class="token-count" role="status" [textContent]="count() + \' из ' +
      entries.length +
      ' токенов\'"></p>',
  );
  html = html.replace(
    /<section class="token-section" id="token-([^"]+)"/g,
    (_, id) =>
      `<section class="token-section" id="token-${id}" tabindex="-1" [hidden]="!visibleCategories().has('${id}')"`,
  );
  html = html.replace(
    /<tr id="([^"]+)" data-token-row/g,
    (_, id) =>
      `<tr id="${id}" tabindex="-1" [hidden]="!visibleNames().has('--${id}')" data-token-row`,
  );
  html = html.replace(
    /<a href="#([^"]+)"/g,
    (_, id) => `<a [routerLink]="[]" fragment="${id}" queryParamsHandling="preserve"`,
  );
  html = html.replace(
    /data-category-link="([^"]+)"/g,
    (_, id) => `data-category-link="${id}" [hidden]="!visibleCategories().has('${id}')"`,
  );
  html = html.replace(
    '<p class="token-empty" hidden>',
    '<p class="token-empty" [hidden]="count() > 0">',
  );
  html = html.replace(
    '<p class="token-copy-status" role="status">Нажмите на имя токена, чтобы скопировать CSS-переменную.</p>',
    '<p class="token-copy-status" role="status" [textContent]="status()"></p>',
  );
  // Fail during generation if a renderer change leaves the Angular controls or filters disconnected.
  const requiredBindings = [
    '(click)="handleClick($event)"',
    '(input)="selectQuery(',
    '(change)="selectCategory(',
    '(change)="selectBrand(',
    '[textContent]="description()"',
    '[textContent]="status()"',
    '[hidden]="count() > 0"',
  ];
  for (const binding of requiredBindings) {
    if (!html.includes(binding)) throw new Error(`Token page: missing binding ${binding}`);
  }
  if ((html.match(/\[hidden\]="!visibleNames\(\)\.has\(/g) ?? []).length !== entries.length) {
    throw new Error('Token page: not all canonical rows received an Angular filter binding');
  }
  if (
    (html.match(/\[hidden\]="!visibleCategories\(\)\.has\(/g) ?? []).length !==
    categories.length * 2
  ) {
    throw new Error('Token page: category sections and contents links are out of sync');
  }
  // These examples explain token primitives using native HTML; no UI-kit component is substituted.
  mkdirSync(out, { recursive: true });
  writeFileSync(
    join(out, 'tokens-page.generated.html'),
    '<!-- Generated by tools/build-token-page.mjs; do not edit. -->\n<article class="token-page-content"><h1 id="page-title" tabindex="-1">Дизайн-токены</h1>' +
      html +
      '</article>\n',
  );
  writeFileSync(join(out, 'tokens-page.generated.json'), JSON.stringify({ categories, entries }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) buildTokenPage();
