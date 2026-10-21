/**
 * Проверка имён токенов по регламенту (docs/tokens.md).
 *
 * Работает по `tokens.json`, а не по CSS: имя токена — это контракт системы,
 * и проверять его надо там, где оно заводится, а не там, где им пользуются.
 * Запускается в `design-system/lint/test/run.js`, то есть в `npm test` системы.
 *
 * Лестницы ступеней и сегодняшние отступления — в `lint/naming.config.json`.
 * Долг записывается поимённо и с причиной: это не «выключить правило», а
 * список, который видно целиком. Новый токен мимо грамматики не пройдёт.
 */
import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const STATUS = ['success', 'warning', 'danger', 'info'];
export const STATUS_SLOTS = ['bg', 'fg', 'line', 'solid'];

const SIZE_LIKE = /^(\d?x{0,3}s|\d?x{0,3}l|s|m|l|small|medium|large|tiny|huge|big|narrow|wide)$/;

export function loadConfig(path) {
  const file = path ?? fileURLToPath(new URL('../naming.config.json', import.meta.url));
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** Все имена токенов с указанием семейства, в котором они объявлены. */
export function collect(tokens) {
  const entries = [];
  for (const [family, value] of Object.entries(tokens)) {
    if (family === 'type' || !value || typeof value !== 'object') continue;
    for (const token of value.tokens ?? []) {
      if (token?.name) entries.push({ name: token.name, family });
    }
  }
  for (const family of Object.keys(tokens.type?.families ?? {})) {
    entries.push({ name: family, family: 'type.families' });
  }
  return entries;
}

/**
 * @returns {{code: string, name: string, message: string}[]}
 */
export function checkNames(tokens, config = loadConfig()) {
  const prefixes = config.prefixes;
  const ladders = config.ladders;
  const shape = new RegExp(`^(${prefixes.join('|')})-[a-z0-9]+(-[a-z0-9]+)*$`);
  const entries = collect(tokens);
  const names = new Set(entries.map((e) => e.name));
  const problems = [];
  const seen = new Map();

  for (const { name, family } of entries) {
    // Форма имени: нижний регистр, цифры и дефисы, обязательный префикс системы.
    if (!shape.test(name)) {
      problems.push({
        code: 'shape',
        name,
        message: `имя не по форме <${prefixes.join('|')}>-сегмент[-сегмент…] в нижнем регистре`,
      });
      continue;
    }

    // Имя используется один раз на всю систему: одинаковые имена в разных
    // семействах затирают друг друга при генерации CSS.
    if (seen.has(name)) {
      problems.push({
        code: 'duplicate',
        name,
        message: `объявлен дважды: ${seen.get(name)} и ${family}`,
      });
    } else {
      seen.set(name, family);
    }

    const segments = name.split('-').slice(1);
    const last = segments.at(-1);

    // Ступень размера берётся из лестницы своего домена, а не придумывается
    // на месте. У домена может быть своя лестница (брейкпоинты, начертания).
    const ladder = ladders[segments[0]] ?? ladders.default;
    if (SIZE_LIKE.test(last) && !ladder.includes(last)) {
      problems.push({
        code: 'size-ladder',
        name,
        message: `ступень «${last}» вне лестницы ${ladder.join(' < ')}`,
      });
    }

    // Безсуффиксное имя рядом со ступенью -md читается как «средний»,
    // а значит им и не является. Либо базовое имя равно -md, либо его нет.
    if (names.has(`${name}-md`)) {
      problems.push({
        code: 'bare-base',
        name,
        message: `есть и ${name}, и ${name}-md: базовое имя читается как «средний», но означает другую ступень`,
      });
    }

    // Чернила на заливке существуют только вместе с заливкой.
    if (last === 'on' && segments.length > 1) {
      const base = name.slice(0, -'-on'.length);
      if (!names.has(base)) {
        problems.push({ code: 'orphan-on', name, message: `нет парной заливки ${base}` });
      }
    }
  }

  // Статус — это всегда четвёрка слотов целиком.
  const prefix = entries[0]?.name.split('-')[0] ?? prefixes[0];
  for (const status of STATUS) {
    const missing = STATUS_SLOTS.filter((slot) => !names.has(`${prefix}-${status}-${slot}`));
    if (missing.length && missing.length < STATUS_SLOTS.length) {
      problems.push({
        code: 'status-quartet',
        name: `${prefix}-${status}-*`,
        message: `не хватает слотов: ${missing.join(', ')}`,
      });
    }
  }

  return problems;
}

/** Отфильтрованный список: только то, что не записано в долги. */
export function checkOpen(tokens, config = loadConfig()) {
  const debts = new Set((config.debts ?? []).map((item) => `${item.code}:${item.name}`));
  return checkNames(tokens, config).filter((p) => !debts.has(`${p.code}:${p.name}`));
}

/**
 * Запущен ли модуль напрямую (`node design-system/lint/scripts/check-names.js`), а не импортирован.
 *
 * Сравниваем пути файловой системы, а не строки URL: `import.meta.url` —
 * percent-encoded (`file:///C:/...` на Windows, `%20` вместо пробела, `%D0%...`
 * вместо кириллицы), а `process.argv[1]` — сырой путь ОС. Прежнее сравнение
 * `file://${argv[1]}` не совпадало ни на Windows, ни в пути с пробелом или
 * кириллицей, и CLI молча выходил с кодом 0. `realpathSync` снимает симлинки,
 * на Windows регистр пути не значим.
 */
export function isDirectRun(moduleUrl, argvPath = process.argv[1]) {
  if (!argvPath) return false;
  try {
    const norm = (p) => {
      const real = realpathSync.native(resolve(p));
      return process.platform === 'win32' ? real.toLowerCase() : real;
    };
    return norm(fileURLToPath(moduleUrl)) === norm(argvPath);
  } catch {
    return false;
  }
}

// Запуск напрямую: node design-system/lint/scripts/check-names.js [путь к tokens.json]
if (isDirectRun(import.meta.url)) {
  const tokensPath =
    process.argv[2] ?? fileURLToPath(new URL('../../../dist/tokens.json', import.meta.url));
  const tokens = JSON.parse(readFileSync(tokensPath, 'utf8'));
  const all = checkNames(tokens);
  const open = checkOpen(tokens);

  for (const p of open) console.error(`× ${p.name} — ${p.message} [${p.code}]`);
  console.log(
    `${collect(tokens).length} имён, нарушений: ${all.length}, из них в долгах: ${all.length - open.length}`,
  );
  if (open.length) process.exit(1);
}
