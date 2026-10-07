import {loadRuntime} from './helpers/runtime.js';
/* Запуск: node tests/a11y-tokens.test.js [путь к bundle.js]
   Нужен jsdom (npm i -D jsdom). №1, №2, №5 на собранном бандле:
   какими токенами рисуются контролы и тост и что строка объекта отдаёт скринридеру. */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const {dom,window:w}=loadRuntime({html:'<!doctype html><body><div id=r></div></body>',pretendToBeVisual:true});
const d=w.document;
const NS = w[Object.keys(w).find((k) => k.startsWith('AuroraWebDesignSystem_'))];
const { React, ReactDOM } = w;
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const render = (el) => { const box = w.document.createElement('div'); w.document.body.appendChild(box);
  ReactDOM.flushSync(() => ReactDOM.createRoot(box).render(el)); return box; };
const h = React.createElement;

// №1 — контролы, у которых граница единственный признак
let box = render(h(NS.DsCheck, { state: 'unchecked' }));
ok(box.firstChild.style.border.includes('var(--ds-border-control)'), 'DsCheck unchecked: граница ds-border-control');
box = render(h(NS.DsCheck, { state: 'unchecked', hover: true }));
ok(box.firstChild.style.border.includes('var(--ds-border-control-hover)'), 'DsCheck unchecked + hover: ds-border-control-hover');
box = render(h(NS.DsCheck, { state: 'unchecked', radio: true }));
ok(box.firstChild.style.border.includes('var(--ds-border-control)'), 'радио unchecked: граница ds-border-control');
box = render(h(NS.DsSwitch, { checked: false, label: 'Показывать треки' }));
const track = box.querySelector('span[aria-hidden="true"]');
ok(track.style.border.includes('var(--ds-border-control)') && track.style.background.includes('var(--ds-border-control)'),
  'DsSwitch off: трек — ds-border-control (граница и заливка)');
ok(!fs.readFileSync(path.join(ROOT, 'components/src/components/primitives/DsCheck.jsx'), 'utf8').includes('border-field'),
  'DsCheck больше не использует ds-border-field');

// №2 — действие в тосте
box = render(h(NS.DsToast, { action: () => {}, actionLabel: 'Отменить' }, 'Объект перемещён в архив'));
const act = [...box.querySelectorAll('button')].find((b) => b.textContent === 'Отменить');
ok(act.style.color === 'var(--ds-fg-action-on-inverse)', 'DsToast: действие — ds-fg-action-on-inverse');
ok(act.style.textDecoration.includes('underline'), 'DsToast: действие подчёркнуто (нецветовой признак)');

// №5 — строка объекта для скринридера
const row = (props) => render(h(NS.DsObjectRow, { name: 'Volvo FH16', onClick: () => {}, ...props })).querySelector('button[aria-describedby]');
const desc = (r) => r.ownerDocument.getElementById(r.getAttribute('aria-describedby'))?.textContent ?? '';
let r = row({ state: 'alarm', details: 'Минск, ул. Кальварийская', unread: 3, freshness: 'late', signal: 'weak' });
ok(r.getAttribute('aria-label') === 'Volvo FH16', 'имя строки — только name, без инициалов аватара');
ok(desc(r).startsWith('Тревога'), 'описание начинается с состояния: «Тревога»');
for (const part of ['Данные нескольких часов', 'Слабый сигнал', 'Минск, ул. Кальварийская', '3 непрочитанных'])
  ok(desc(r).includes(part), `описание содержит «${part}»`);
ok(desc(row({ state: 'offline' })).startsWith('Нет связи'), 'offline → «Нет связи»');
ok(desc(row({ state: 'nodata' })).startsWith('Нет данных'), 'nodata → «Нет данных»');
ok(desc(row({ state: 'unknown-value' })).startsWith('Стоянка'), 'неизвестное состояние → как parked');
ok(desc(row({ state: 'alarm', stateLabel: 'Alarm' })).startsWith('Alarm'), 'stateLabel переопределяет подпись');
r = row({ state: 'moving' });
ok([...r.children].filter((c) => c.tagName === 'SPAN' && !c.id).slice(0, 2).every((c) => c.getAttribute('aria-hidden') === 'true'),
  'аватар и колонка глифов — aria-hidden');
const src = fs.readFileSync(path.join(ROOT, 'components/src/components/data/DsObjectRow.jsx'), 'utf8');
ok(!/const STATE=/.test(src) && src.includes("from './DsStateIcon.jsx'"), 'DsObjectRow берёт состояния из DsStateIcon (одна копия)');
box = render(h(NS.DsStateIcon, { state: 'alarm' }));
ok(box.firstChild.getAttribute('aria-label') === 'Тревога', 'DsStateIcon по-прежнему подписан');

if (fails) { console.error(`${fails} FAIL`); process.exit(1); }
console.log('все проверки прошли');
