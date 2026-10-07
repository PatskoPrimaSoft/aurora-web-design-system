import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, relative, posix } from 'node:path';
import { parse, parseFragment, serialize } from 'parse5';
import { transform } from 'esbuild';
import {scopeOptions,applyQueryScope} from '../../catalog/state.js';
import {readCards} from './index.mjs';

const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
function setAttr(node, name, value) {
  const found = node.attrs.find(a => a.name === name);
  if (found) found.value = value; else node.attrs.push({ name, value });
}
export async function renderPreview({ root, card, mode = 'legacy', scope, standalone = false }) {
  if (!['legacy', 'current'].includes(mode)) throw new Error(`Unknown preview mode: ${mode}`);
  const doc = parse(readFileSync(join(root, card.previewPath), 'utf8'));
  let head, html;
  const tasks = [];
  const walk = node => {
    if (node.tagName === 'head') head = node;
    if (node.tagName === 'html') html = node;
    if (node.tagName === 'base') node._remove = true;
    if (node.tagName === 'script') {
      const src = attr(node, 'src');
      if (src && /(?:react(?:-dom)?\.production|bundle\.js|babel(?:\.min)?\.js|(?:^|\/)(?:runtime|components)\.js(?:[?#]|$))/.test(src)) { node._remove = true; return; }
      const type = attr(node, 'type') ?? '';
      if (!['', 'text/javascript', 'application/javascript', 'text/babel', 'application/json'].includes(type)) throw new Error(`${card.previewPath}: unsupported script type ${type}`);
      if (type === 'text/babel') tasks.push(transform(node.childNodes.map(n => n.value ?? '').join(''), { loader: 'jsx', jsx: 'transform', sourcefile: card.previewPath }).then(result => {
        node.attrs = node.attrs.filter(a => !['type', 'data-presets'].includes(a.name));
        node.childNodes = [{ nodeName: '#text', value: result.code, parentNode: node }];
      }));
    }
    if (node.tagName === 'link' && attr(node, 'rel') === 'stylesheet' && /(?:tokens(?:\/scoped)?\.css|bundle\.css|dist\/styles\.css)/.test(attr(node, 'href') ?? '')) node._remove = true;
    for (const a of node.attrs ?? []) {
      if (!['src', 'href', 'poster'].includes(a.name) || /^(?:data:|blob:|#|mailto:)/.test(a.value)) continue;
      const url = new URL(a.value, `http://aurora.local/${card.previewPath}`);
      if (url.origin !== 'http://aurora.local') {
        if (!node._remove && ['script', 'img', 'link'].includes(node.tagName)) throw new Error(`${card.previewPath}: external resource ${a.value}`);
        continue;
      }
      const path = decodeURIComponent(url.pathname).slice(1);
      const linkedCard = /^components\/([\w-]+)\/preview\.html$/.exec(path);
      if (node.tagName === 'a' && ['2 · Основы', '3 · Миграция', '4 · Бренд (общее)', '6 · Карта'].includes(card.group) && linkedCard) {
        if (!existsSync(join(root,path))) throw new Error(`${card.previewPath}: missing linked card ${path}`);
        a.value = posix.relative(posix.dirname(card.previewPath), 'index.html') + '?card=' + linkedCard[1];
        setAttr(node, 'target', '_top');
        continue;
      }
      if (['script', 'img', 'link'].includes(node.tagName) && !node._remove) {
        if (relative(root, resolve(root, path)).startsWith('..') || !existsSync(join(root, path))) throw new Error(`${card.previewPath}: missing asset ${path}`);
      }
      a.value = posix.relative(posix.dirname(card.previewPath), path) + url.search + url.hash;
    }
    for (const child of node.childNodes ?? []) walk(child);
    if (node.childNodes) node.childNodes = node.childNodes.filter(n => !n._remove);
  };
  walk(doc);
  await Promise.all(tasks);
  if (scope) for (const [name, value] of Object.entries(scope)) setAttr(html, `data-ds-${name}`, value);
  const scripts = mode === 'legacy'
    ? ['/components/lib/react.production.min.js', '/components/lib/react-dom.production.min.js', '/components/bundle.js']
    : ['/runtime.js', '/components.js'];
  const base = posix.dirname(card.previewPath);
  const local = file => posix.relative(base, file.replace(/^\//, ''));
  const baseHref = standalone ? './' : '/' + (base === '.' ? '' : base + '/');
  const count=mode==='current'&&card.id==='overview'?`<script>window.__DS_CARD_COUNT__=${readCards(root).length};</script>`:'';
  const injected = parseFragment(`<base href="${baseHref}">${count}<script>(${applyQueryScope.toString()})(${JSON.stringify(scopeOptions)})</script><link rel="stylesheet" href="${local('dist/styles.css')}">${scripts.map(src => `<script src="${local(src)}"></script>`).join('')}`).childNodes;
  for (const n of injected) n.parentNode = head;
  head.childNodes.unshift(...injected);
  return serialize(doc);
}
