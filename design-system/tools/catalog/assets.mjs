import { readFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, relative, dirname, isAbsolute, sep } from 'node:path';
import { parse } from 'parse5';
export const vendorAssets = {'vendor/echarts.min.js':'node_modules/echarts/dist/echarts.min.js'};
export function sourceAsset(root, path) {
  const file = resolve(root, path);
  return !existsSync(file) && /^(?:fonts|assets\/fonts)\//.test(path.replaceAll('\\','/')) ? resolve(root, 'design-system', path) : file;
}
export function assetPath(root, from, url) {
  if (/^(?:data:|blob:|#)/.test(url)) return null;
  const u = new URL(url, `http://aurora.local/${from}`);
  if (u.origin !== 'http://aurora.local') throw new Error(`${from}: external asset ${url}`);
  const requested = decodeURIComponent(u.pathname).slice(1);
  const path = resolve(root, vendorAssets[requested] ?? requested);
  const rel = relative(resolve(root), path);
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error(`${from}: unsafe asset ${url}`);
  if (!existsSync(sourceAsset(root, rel))) throw new Error(`${from}: missing asset ${url}`);
  return rel;
}
export function previewAssets(root, from, html, ignoredPaths = []) {
  const refs = new Set();
  const add = (url, owner=from) => {
    const candidate=new URL(url,`http://aurora.local/${owner}`);
    if(candidate.origin==='http://aurora.local' && ignoredPaths.includes(decodeURIComponent(candidate.pathname).slice(1)))return;
    const path = assetPath(root, owner, url);
    if (!path || refs.has(path)) return;
    refs.add(path);
    if (/\.css$/i.test(path)) {
      const text=readFileSync(sourceAsset(root,path),'utf8');
      urls(text,path.replaceAll('\\','/'));
      for(const match of text.matchAll(/@import\s+['"]([^'"]+)['"]/g)) add(match[1],path.replaceAll('\\','/'));
    }
  };
  const urls = (text,owner=from) => { for (const m of text.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) add(m[1],owner); };
  const walk = node => {
    for (const a of node.attrs ?? []) {
      if ((a.name === 'src' || a.name === 'poster' || (node.tagName === 'link' && a.name === 'href'))) add(a.value);
      if (a.name === 'style') urls(a.value);
    }
    if (node.tagName === 'style') urls(node.childNodes.map(n => n.value ?? '').join(''));
    if (node.tagName === 'script') for (const m of node.childNodes.map(n => n.value ?? '').join('').matchAll(/\b(?:src|logoSrc|poster)\s*[:=]\s*['"]([^'"]+)['"]/g)) add(m[1]);
    for (const child of node.childNodes ?? []) walk(child);
  };
  walk(parse(html));
  return [...refs];
}
export function copyAsset({ root, outDir, path }) {
  const destination = Object.keys(vendorAssets).find(key=>vendorAssets[key]===path.replaceAll('\\','/')) ?? path;
  const target = resolve(outDir, destination);
  const rel = relative(resolve(outDir), target);
  if (rel.startsWith('..') || isAbsolute(rel)) throw new Error(`Unsafe output asset ${path}`);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(sourceAsset(root, path), target);
}
