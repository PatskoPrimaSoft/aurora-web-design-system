import { publicTokens } from './public-json.mjs';
export const rule = (selector, values) => `${selector} {\n${Object.entries(values).map(([p, v]) => `  ${p}: ${v};`).join('\n')}\n}\n`;
function roleAliases(source) {
  const ref = (tokens, value) => {
    const token = tokens.find(t => String(t.value) === String(value));
    return token ? `var(--${token.name})` : String(value);
  };
  return Object.fromEntries(source.type.groups.flatMap(g => g.styles.map(s => [`--${s.name}`,
    `${ref(source.fontWeight.tokens, s.fontWeight)} ${ref(source.fontSize.tokens, s.fontSize)}/${ref(source.other.tokens.filter(t => t.name.startsWith('ds-lh-')), s.lineHeight)} var(--${g.family})`])));
}
export function renderTokenCss(model) {
  const { sets, density, aliases, names } = model;
  const themed = names.filter(n => Object.values(sets).some(values => values[n] !== sets['DEFAULT.light'][n]));
  const internals = (theme) => Object.fromEntries(themed.flatMap(name => ['light', 'dark'].map(mode => [`--ds-_${name.slice(5)}--${mode}`, sets[`${theme}.${mode}`][name]])));
  const typography = roleAliases(model.source);
  let css = rule(':root', { ...sets['DEFAULT.light'], ...typography, ...internals('DEFAULT'), '--ds-_if-dark': '', '--ds-_if-light': 'initial', '--ds-_if-red2': '', '--ds-_if-default': 'initial' });
  for (const mode of ['light', 'dark']) {
    const values = Object.fromEntries(names.filter(n => !themed.includes(n) && sets['DEFAULT.light'][n] !== sets['DEFAULT.dark'][n]).map(n => [n, sets[`DEFAULT.${mode}`][n]]));
    css += rule(`[data-ds-appearance="${mode}"]`, { ...values, '--ds-_if-dark': mode === 'dark' ? 'initial' : '', '--ds-_if-light': mode === 'light' ? 'initial' : '' });
  }
  for (const theme of ['DEFAULT', 'RED2']) css += rule(`[data-ds-theme="${theme}"]`, {...internals(theme), '--ds-_if-red2': theme === 'RED2' ? 'initial' : '', '--ds-_if-default': theme === 'DEFAULT' ? 'initial' : ''});
  for (const mode of ['cozy', 'compact']) css += rule(`[data-ds-density="${mode}"]`, density[mode]);
  const recalculated = Object.fromEntries(names.filter(n => aliases[n].length && !themed.includes(n)).map(n => [n, sets['DEFAULT.light'][n]]));
  Object.assign(recalculated, typography);
  // Re-evaluate alias expressions against primitives on this scope boundary.
  // Inherited private aliases would otherwise retain their ancestor's values.
  for (const name of themed.filter(n => aliases[n].length)) for (const mode of ['light', 'dark']) {
    const normal=sets[`DEFAULT.${mode}`][name], red=sets[`RED2.${mode}`][name];
    recalculated[`--ds-_${name.slice(5)}--${mode}`] = normal === red ? normal : `var(--ds-_if-red2, ${red}) var(--ds-_if-default, ${normal})`;
  }
  for (const name of themed) {
    const internal = `--ds-_${name.slice(5)}`;
    recalculated[name] = `var(--ds-_if-dark, var(${internal}--dark)) var(--ds-_if-light, var(${internal}--light))`;
  }
  css += rule('[data-ds-theme], [data-ds-appearance], [data-ds-density]', recalculated);
  return css;
}
export function renderTypography(source) {
  const values = {};
  for (const [name, value] of Object.entries(publicTokens(source).type.families)) values[`--font-${name}`] = value;
  let css = '';
  for (const group of source.type.groups) for (const s of group.styles) {
    values[`--text-${s.name}`] = `${s.fontWeight} ${s.fontSize}/${s.lineHeight} var(--font-${group.family})`;
    css += rule(`.${s.name}`, { 'font-family': `var(--font-${group.family})`, 'font-size': s.fontSize, 'line-height': s.lineHeight, 'font-weight': s.fontWeight, 'letter-spacing': s.letterSpacing ?? '0' });
  }
  return rule(':root', values) + css;
}
export function renderLegacyTokens(model) {
  const selectors = { 'DEFAULT.light': ':root, [data-theme="light"]', 'DEFAULT.dark': '[data-theme="ds-appearance-dark-ds-default"]', 'RED2.light': '[data-theme="ds-appearance-light-ds-red2"]', 'RED2.dark': '[data-theme="ds-appearance-dark-ds-red2"]' };
  return Object.entries(selectors).map(([key, selector]) => rule(selector, model.sets[key])).join('\n') + renderTypography(model.source);
}
