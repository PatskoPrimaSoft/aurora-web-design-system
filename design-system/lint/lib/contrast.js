/**
 * Контраст токенов по WCAG 2.x во всех четырёх наборах (DEFAULT/RED2 × light/dark).
 * Читает скомпилированный `tokens.css`: `var()` разворачивается внутри набора,
 * полупрозрачный цвет накладывается на `ds-surface` того же набора.
 */
const SETS = {
  'DEFAULT/light': ':root, [data-theme="light"]',
  'RED2/light': '[data-theme="ds-appearance-light-ds-red2"]',
  'DEFAULT/dark': '[data-theme="ds-appearance-dark-ds-default"]',
  'RED2/dark': '[data-theme="ds-appearance-dark-ds-red2"]',
};

export function parseSets(tokensCss) {
  const css = tokensCss.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = {};
  for (const [, sel, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decl = Object.fromEntries([...body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]));
    blocks[sel.trim()] = { ...(blocks[sel.trim()] ?? {}), ...decl };
  }
  const base = { ...blocks[SETS['DEFAULT/light']], ...(blocks[':root'] ?? {}) };
  return Object.fromEntries(Object.entries(SETS).map(([name, sel]) => [name, { ...base, ...blocks[sel] }]));
}

function resolve(set, name, depth = 0) {
  const v = set[name];
  if (v == null || depth > 20) throw new Error(`нет токена --${name}`);
  const m = /^var\(--([\w-]+)/.exec(v);
  return m ? resolve(set, m[1], depth + 1) : v;
}

function rgba(v) {
  let m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(v);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).concat(m[2] ? parseInt(m[2], 16) / 255 : 1);
  m = /^rgba?\(([^)]+)\)$/.exec(v);
  if (m) { const p = m[1].split(',').map((x) => parseFloat(x)); return [p[0], p[1], p[2], p[3] ?? 1]; }
  throw new Error(`не цвет: ${v}`);
}

function over(fg, bg) {
  const a = fg[3];
  return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)).concat(1);
}

function lum([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(set, fgName, bgName) {
  const surface = rgba(resolve(set, 'ds-surface'));
  const bg = over(rgba(resolve(set, bgName)), surface);
  const fg = over(rgba(resolve(set, fgName)), bg);
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}
