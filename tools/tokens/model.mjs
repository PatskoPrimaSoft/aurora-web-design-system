import { publicTokens } from './public-json.mjs';
export const THEME_IDS = { 'DEFAULT.light': 'light', 'DEFAULT.dark': 'ds-appearance-dark-ds-default', 'RED2.light': 'ds-appearance-light-ds-red2', 'RED2.dark': 'ds-appearance-dark-ds-red2' };
export const cssValue = value => value.replace(/\{([\w-]+)\}/g, (_, name) => `var(--${name})`);
export function readTokenModel(source) {
  const entries = new Map();
  const add = (name, value) => {
    if (entries.has(`--${name}`)) throw new Error(`design-system/tokens/source.json: ${name}: duplicate token`);
    entries.set(`--${name}`, value);
  };
  for (const section of Object.values(source)) for (const token of section?.tokens ?? []) add(token.name, token.value);
  for (const [name, value] of Object.entries(publicTokens(source).type.families)) add(name, value);
  const sets = {};
  for (const [key, id] of Object.entries(THEME_IDS)) {
    const fallback = key.endsWith('dark') ? THEME_IDS['DEFAULT.dark'] : 'light';
    sets[key] = Object.fromEntries([...entries].map(([name, raw]) => {
      const value = typeof raw === 'string' ? raw : raw[id] ?? raw[fallback] ?? raw.light;
      if (typeof value !== 'string') throw new Error(`design-system/tokens/source.json: ${name}: missing ${key} value`);
      return [name, cssValue(value)];
    }));
  }
  const aliases = {};
  for (const [name, value] of entries) {
    const values = typeof value === 'string' ? [value] : Object.values(value);
    aliases[name] = [...new Set(values.flatMap(v => [...cssValue(v).matchAll(/var\((--[\w-]+)/g)].map(m => m[1])))];
    for (const ref of aliases[name]) if (!entries.has(ref)) throw new Error(`design-system/tokens/source.json: ${name}: unknown reference ${ref}`);
  }
  const visiting = new Set(), visited = new Set();
  const visit = name => {
    if (visiting.has(name)) throw new Error(`design-system/tokens/source.json: ${name}: reference cycle`);
    if (visited.has(name)) return;
    visiting.add(name); for (const ref of aliases[name]) visit(ref); visiting.delete(name); visited.add(name);
  };
  for (const name of entries.keys()) visit(name);
  const density = { cozy: {}, compact: {} };
  for (const token of source.spacing.tokens) {
    const value = token.value;
    density.cozy[`--${token.name}`] = cssValue(typeof value === 'string' ? value : value.light);
    density.compact[`--${token.name}`] = cssValue(typeof value === 'string' ? value : value['ds-density-compact'] ?? value.light);
  }
  return { source, names: [...entries.keys()], sets, density, aliases };
}
