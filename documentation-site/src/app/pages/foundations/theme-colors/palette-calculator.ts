// Algorithm preserved from DsBrandPick/preview.html; this module only calculates preview data.
const S = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)),
  G = (v: number) => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
function hex2rgb(h: string) {
  h = h.replace('#', '');
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}
function rgb2hex(r: number[]) {
  return (
    '#' +
    r
      .map((v) =>
        Math.round(Math.min(1, Math.max(0, v)) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
// Colour mixing and lightness adjustment use OKLab/OKLCH, as in the original calculator.
function rgb2lab(rgb: number[]) {
  const [r, g, b] = rgb.map(S);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b),
    m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b),
    s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function lab2rgbRaw(L: number, a: number, b2: number) {
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b2, 3),
    m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b2, 3),
    s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b2, 3);
  return [
    G(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    G(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    G(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}
// Reduce chroma when the chosen lightness and hue fall outside the sRGB gamut.
function lab2hex(L: number, a: number, b2: number) {
  const inG = (r: number[]) => r.every((v) => v >= -0.002 && v <= 1.002);
  if (inG(lab2rgbRaw(L, a, b2))) return rgb2hex(lab2rgbRaw(L, a, b2));
  let lo = 0,
    hi = 1;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (inG(lab2rgbRaw(L, a * mid, b2 * mid))) lo = mid;
    else hi = mid;
  }
  return rgb2hex(lab2rgbRaw(L, a * lo, b2 * lo));
}
function oklch(hx: string) {
  const [L, a, b] = rgb2lab(hex2rgb(hx));
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C: Math.hypot(a, b), h };
}
function fromLCH(L: number, C: number, h: number) {
  return lab2hex(L, C * Math.cos((h * Math.PI) / 180), C * Math.sin((h * Math.PI) / 180));
}
function lum(rgb: number[]) {
  const [r, g, b] = rgb.map(S);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function cr(h1: string, h2: string) {
  const a = lum(hex2rgb(h1)),
    b = lum(hex2rgb(h2));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function mix(hx: string, pct: number, onto: string) {
  const A = rgb2lab(hex2rgb(hx)),
    B = rgb2lab(hex2rgb(onto));
  return lab2hex(
    A[0] * pct + B[0] * (1 - pct),
    A[1] * pct + B[1] * (1 - pct),
    A[2] * pct + B[2] * (1 - pct),
  );
}
function rgba(hx: string, al: number) {
  const [r, g, b] = hex2rgb(hx);
  return (
    'rgba(' +
    Math.round(r * 255) +
    ',' +
    Math.round(g * 255) +
    ',' +
    Math.round(b * 255) +
    ',' +
    al +
    ')'
  );
}
/* подмешивание с полом отделимости: бледный исходник требует большего процента,
   иначе подложка на поверхности неотличима от самой поверхности */
function tint(from: string, onto: string, pct: number, minCr: number): [string, number] {
  let p = pct,
    out = mix(from, p, onto);
  while (p < 0.6 && cr(out, onto) < minCr) {
    p += 0.01;
    out = mix(from, p, onto);
  }
  return [out, Math.round(p * 100)];
}
/* самая светлая точка оттенка, где контраст к светлому ref ещё >= target */
function darkenTo(seed: string, ref: string, target: number) {
  const { C, h } = oklch(seed);
  let lo = 0.05,
    hi = 0.99;
  if (cr(fromLCH(lo, C, h), ref) < target) return fromLCH(lo, C, h);
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (cr(fromLCH(mid, C, h), ref) >= target) lo = mid;
    else hi = mid;
  }
  return fromLCH(lo, C, h);
}
/* цвет в заданном окне светлоты; если порог к тёмному ref там не проходит — выше */
function lift(seed: string, L: number, ref: string, target: number, cScale?: number) {
  const { C, h } = oklch(seed);
  let out = fromLCH(L, C * (cScale || 1), h);
  while (L < 0.97 && cr(out, ref) < target) {
    L += 0.01;
    out = fromLCH(L, C * (cScale || 1), h);
  }
  return out;
}

// Fixed reference surfaces belong to the calculator, not to application theme styling.
const BG = '#f6f7f9',
  SURF = '#ffffff',
  D_SURF = '#15191f',
  ON_BRAND_D = '#0d1520';
const STATUS: Record<string, string> = {
    success: '#157a45',
    danger: '#c1291f',
    warning: '#9a6400',
  },
  SN: Record<string, string> = {
    success: 'success — «в движении»',
    danger: 'danger — «офлайн»',
    warning: 'warning — «тревога»',
  };

export interface PaletteRow {
  color: string;
  label: string;
  checks: [string, boolean | null][];
}
/** Accepts validated #RRGGBB colours and a raw theme name; does not change source tokens. */
export function calculatePalette(seed: string, aseed: string, name: string) {
  const rows: Record<string, PaletteRow> = {};
  function put(id: string, color: string, label?: string) {
    rows[id] = { color, label: label ?? color, checks: [] };
  }
  function chk(id: string, parts: [string, boolean | null][]) {
    rows[id].checks = parts;
  }
  const brand = cr(seed, SURF) >= 4.5 ? seed : darkenTo(seed, SURF, 4.5);
  const [bsub, bsubP] = tint(brand, SURF, 0.08, 1.06),
    [bbor, bborP] = tint(brand, SURF, 0.28, 1.45);
  const btxt = cr(brand, BG) >= 4.5 ? brand : darkenTo(seed, BG, 4.5);
  const aq = oklch(aseed),
    aDarkInk = fromLCH(0.26, Math.min(aq.C, 0.06), aq.h);
  const acc = aseed,
    accWhite = cr(acc, SURF) >= 4.5,
    aon = accWhite ? '#ffffff' : aDarkInk;
  const asub = tint(acc, SURF, 0.08, 1.06);
  const amark = cr(acc, BG) >= 3 ? acc : darkenTo(aseed, BG, 3),
    amon = cr(amark, '#ffffff') >= 4.5 ? '#ffffff' : aDarkInk;
  const dbrand = lift(seed, 0.69, ON_BRAND_D, 4.5),
    dbtxt = lift(seed, 0.82, D_SURF, 4.5, 0.6);
  const dacc = cr(aseed, D_SURF) >= 3 ? aseed : lift(aseed, 0.75, D_SURF, 3);
  const dq = oklch(dacc),
    daon = fromLCH(0.24, Math.min(dq.C, 0.06), dq.h);
  put('brand', brand);
  chk('brand', [
    ['белая подпись ' + cr(brand, SURF).toFixed(1) + ':1', cr(brand, SURF) >= 4.5],
    ['к фону ' + cr(brand, BG).toFixed(1) + ':1', cr(brand, BG) >= 3],
    [brand === seed ? 'исходник подошёл как есть' : 'исходник затемнён с ' + seed, null],
  ]);
  put('bsub', bsub);
  chk('bsub', [
    ['отделима от поверхности ' + cr(bsub, SURF).toFixed(2) + ':1', cr(bsub, SURF) >= 1.06],
    ['текст на подложке ' + cr(btxt, bsub).toFixed(1) + ':1', cr(btxt, bsub) >= 4.5],
    ['заливка ' + bsubP + '% в поверхности', null],
  ]);
  put('bbor', bbor);
  chk('bbor', [
    [
      'отличима от --ds-border ' + cr(bbor, '#e2e5ec').toFixed(2) + ':1',
      cr(bbor, '#e2e5ec') >= 1.15,
    ],
    [
      'оттенок сохранён ' + Math.round(oklch(bbor).h) + '°',
      Math.abs(oklch(bbor).h - oklch(brand).h) < 12,
    ],
    ['заливка ' + bborP + '% в поверхности', null],
  ]);
  put('btxt', btxt);
  chk('btxt', [
    ['к --ds-bg ' + cr(btxt, BG).toFixed(1) + ':1', cr(btxt, BG) >= 4.5],
    [brand === btxt ? 'равен заливке — берём её' : 'заливка не прошла, затемнён', null],
  ]);
  put('acc', acc);
  chk('acc', [
    [
      'подпись ' + (accWhite ? 'белая' : 'тёмная') + ' ' + cr(acc, aon).toFixed(1) + ':1',
      cr(acc, aon) >= 4.5,
    ],
  ]);
  put('aon', aon);
  chk('aon', [[accWhite ? 'белое проходит' : 'белое не проходит — тёмное', null]]);
  put('asub', asub[0]);
  chk('asub', [
    ['отделима от поверхности ' + cr(asub[0], SURF).toFixed(2) + ':1', cr(asub[0], SURF) >= 1.06],
    ['текст на подложке ' + cr(btxt, asub[0]).toFixed(1) + ':1', cr(btxt, asub[0]) >= 4.5],
    ['акцент ' + asub[1] + '% в поверхности' + (asub[1] > 10 ? ' — бледный исходник' : ''), null],
  ]);
  put('amark', amark);
  chk('amark', [
    ['фигура к фону ' + cr(amark, BG).toFixed(1) + ':1', cr(amark, BG) >= 3],
    [amark === acc ? 'равен акценту' : 'акцент светлее порога, затемнён', null],
  ]);
  put('amon', amon);
  chk('amon', [['цифра на метке ' + cr(amon, amark).toFixed(1) + ':1', cr(amon, amark) >= 4.5]]);
  put('dbrand', dbrand);
  chk('dbrand', [
    ['тёмная подпись ' + cr(dbrand, ON_BRAND_D).toFixed(1) + ':1', cr(dbrand, ON_BRAND_D) >= 4.5],
    ['к фону ' + cr(dbrand, D_SURF).toFixed(1) + ':1', cr(dbrand, D_SURF) >= 3],
    ['L ' + oklch(dbrand).L.toFixed(2) + ' против ' + oklch(brand).L.toFixed(2) + ' в light', null],
  ]);
  put('dbsub', rgba(dbrand, 0.14), rgba(dbrand, 0.14));
  chk('dbsub', [['полупрозрачная подложка', null]]);
  put('dbbor', rgba(dbrand, 0.34), rgba(dbrand, 0.34));
  chk('dbbor', [['полупрозрачная граница', null]]);
  put('dbtxt', dbtxt);
  chk('dbtxt', [
    ['к --ds-surface ' + cr(dbtxt, D_SURF).toFixed(1) + ':1', cr(dbtxt, D_SURF) >= 4.5],
    ['отделим от заливки ' + cr(dbtxt, dbrand).toFixed(2) + ':1', cr(dbtxt, dbrand) >= 1.35],
  ]);
  put('dacc', dacc);
  chk('dacc', [
    ['фигура к фону ' + cr(dacc, D_SURF).toFixed(1) + ':1', cr(dacc, D_SURF) >= 3],
    [dacc === aseed ? 'исходник подошёл как есть' : 'поднят по светлоте', null],
  ]);
  put('daon', daon);
  chk('daon', [['подпись на акценте ' + cr(daon, dacc).toFixed(1) + ':1', cr(daon, dacc) >= 4.5]]);

  const bh = oklch(brand).h,
    ah = oklch(acc).h,
    dh = (x: number, y: number) => {
      const d = Math.abs(x - y) % 360;
      return d > 180 ? 360 - d : d;
    };
  const W: [string, string][] = [];
  if (dh(bh, ah) < 40)
    W.push([
      'w',
      'Оттенки бренда и акцента расходятся на ' +
        Math.round(dh(bh, ah)) +
        '° — меньше 40°. «Новое» и «нажми» будут выглядеть одним цветом: уводите акцент по оттенку или берите второй фирменный цвет.',
    ]);
  for (const k in STATUS) {
    const d = dh(ah, oklch(STATUS[k]).h);
    if (d < 22)
      W.push([
        'w',
        'Акцент лежит в ' +
          Math.round(d) +
          '° от ' +
          SN[k] +
          '. Счётчик непрочитанного будет читаться как состояние объекта.',
      ]);
  }
  if (cr(seed, SURF) < 4.5)
    W.push([
      'w',
      'Исходник бренда не несёт белую подпись (' +
        cr(seed, SURF).toFixed(1) +
        ':1) — в --ds-brand идёт затемнённая версия того же оттенка, ' +
        brand +
        '. Логотип при этом остаётся исходным цветом.',
    ]);
  if (!W.length)
    W.push([
      'g',
      'По оттенку акцент отличается от бренда и статусов. Проверьте контраст в справочнике и результат на реальных экранах.',
    ]);

  const pairs: [string, number, number, number][] = [
    ['Подпись кнопки / заливка', cr(SURF, brand), cr(ON_BRAND_D, dbrand), 4.5],
    ['Ссылка / фон', cr(btxt, BG), cr(dbtxt, D_SURF), 4.5],
    [
      'Текст выбора / подложка',
      cr(btxt, bsub),
      cr(dbtxt, rgb2hex(hex2rgb(dbrand).map((v, i) => v * 0.14 + hex2rgb(D_SURF)[i] * 0.86))),
      4.5,
    ],
    ['Подпись / акцент', cr(aon, acc), cr(daon, dacc), 4.5],
    ['Цифра / метка', cr(amon, amark), cr(daon, dacc), 4.5],
    ['Метка / фон', cr(amark, BG), cr(dacc, D_SURF), 3],
  ];
  const failures = pairs.reduce((n, p) => n + Number(p[1] < p[3]) + Number(p[2] < p[3]), 0);
  const recommendations = W.filter((w) => w[0] === 'w').length;

  const n = (name.trim().replace(/[^a-z0-9_-]/gi, '') || 'NAME').toUpperCase();
  const css =
    '[data-ds-theme="' +
    n +
    '"]{\n' +
    '--ds-brand:' +
    brand +
    ';--ds-brand-subtle:' +
    bsub +
    ';--ds-brand-border:' +
    bbor +
    ';--ds-brand-text:' +
    btxt +
    ';\n' +
    '--ds-accent:' +
    acc +
    ';--ds-accent-on:' +
    aon +
    ';--ds-accent-subtle:' +
    asub[0] +
    ';\n' +
    '--ds-accent-mark:' +
    amark +
    ';--ds-accent-mark-on:' +
    amon +
    ';\n}\n' +
    '[data-ds-appearance="dark"][data-ds-theme="' +
    n +
    '"],\n[data-ds-appearance="dark"] [data-ds-theme="' +
    n +
    '"]:not([data-ds-appearance="light"]){\n' +
    '--ds-brand:' +
    dbrand +
    ';--ds-brand-subtle:' +
    rgba(dbrand, 0.14) +
    ';--ds-brand-border:' +
    rgba(dbrand, 0.34) +
    ';--ds-brand-text:' +
    dbtxt +
    ';\n' +
    '--ds-accent:' +
    dacc +
    ';--ds-accent-on:' +
    daon +
    ';--ds-accent-subtle:' +
    rgba(dacc, 0.16) +
    ';\n' +
    '--ds-accent-mark:var(--ds-accent);--ds-accent-mark-on:var(--ds-accent-on);\n}';
  return {
    rows,
    warnings: W,
    pairs: pairs.map(([label, light, dark, threshold]) => ({ label, light, dark, threshold })),
    summary:
      'Контраст: ' +
      (failures ? 'не пройдено проверок — ' + failures : 'показанные пары прошли проверку') +
      '. Рекомендации по палитре: ' +
      recommendations +
      '.',
    css,
    light: {
      brand,
      onBrand: SURF,
      subtle: bsub,
      border: bbor,
      text: btxt,
      accent: acc,
      accentOn: aon,
      mark: amark,
      markOn: amon,
    },
    dark: {
      brand: dbrand,
      onBrand: ON_BRAND_D,
      subtle: rgba(dbrand, 0.14),
      border: rgba(dbrand, 0.34),
      text: dbtxt,
      accent: dacc,
      accentOn: daon,
      mark: dacc,
      markOn: daon,
    },
  };
}
