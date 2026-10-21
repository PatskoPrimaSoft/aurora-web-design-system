/**
 * Небольшие помощники разбора значений. Без зависимостей: правила должны
 * работать в любом приложении, которое уже поставило stylelint.
 */

/** Именованные цвета CSS. `transparent` и `currentColor` сюда не входят — они разрешены. */
export const NAMED_COLORS = new Set([
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black',
  'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse',
  'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan',
  'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta',
  'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
  'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink',
  'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen',
  'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow',
  'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender',
  'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
  'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon',
  'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue',
  'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine',
  'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue',
  'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream',
  'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange',
  'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred',
  'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple',
  'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen',
  'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow',
  'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet',
  'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen',
]);

const COLOR_FUNCTIONS = /\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\s*\(/gi;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const URL_CALL = /\burl\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\)/gi;

/** Убирает то, что не является кодом: комментарии и содержимое `url()`. */
export function scrub(value) {
  return String(value)
    .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
    .replace(URL_CALL, (m) => ' '.repeat(m.length));
}

/**
 * Находит литеральные цвета в значении.
 * @returns {{text: string, index: number, kind: 'hex'|'function'|'named'}[]}
 */
export function findColorLiterals(value) {
  const src = scrub(value);
  const found = [];

  for (const m of src.matchAll(HEX)) {
    found.push({ text: m[0], length: m[0].length, index: m.index, kind: 'hex' });
  }
  for (const m of src.matchAll(COLOR_FUNCTIONS)) {
    found.push({ text: `${m[1]}(…)`, length: m[1].length, index: m.index, kind: 'function' });
  }
  // Именованные цвета — только как отдельные слова, не как часть идентификатора
  // (`--ds-red2-bg`, `snow-line` и подобное не ловим).
  for (const m of src.matchAll(/(^|[^\w-])([a-zA-Z]+)(?![\w-])/g)) {
    const word = m[2].toLowerCase();
    if (NAMED_COLORS.has(word)) {
      found.push({ text: m[2], length: m[2].length, index: m.index + m[1].length, kind: 'named' });
    }
  }

  return found.sort((a, b) => a.index - b.index);
}

/** Имена кастомных свойств, к которым обращаются через `var()`. */
export function findVarRefs(value) {
  const src = scrub(value);
  const refs = [];
  for (const m of src.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)) {
    refs.push({ name: m[1], index: m.index });
  }
  return refs;
}

/** Числа с указанной единицей измерения. */
export function findUnits(value, units) {
  const src = scrub(value);
  const re = new RegExp(`(?<![\\w.#-])(\\d*\\.?\\d+)(${units.join('|')})(?![\\w-])`, 'gi');
  const found = [];
  for (const m of src.matchAll(re)) {
    found.push({ text: m[0], unit: m[2].toLowerCase(), index: m.index });
  }
  return found;
}

/** Расстояние Левенштейна — для подсказки «вы имели в виду …». */
export function distance(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  const cur = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = cur.slice();
  }
  return prev[n];
}

/** Ближайшее по написанию имя из списка, если оно достаточно близко. */
export function closest(name, candidates) {
  let best = null;
  let bestScore = Infinity;
  const limit = Math.max(2, Math.floor(name.length / 3));
  for (const candidate of candidates) {
    const score = distance(name, candidate);
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return bestScore <= limit ? best : null;
}
