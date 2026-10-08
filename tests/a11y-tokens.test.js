import {loadRuntime} from './helpers/runtime.js';
/* Запуск: node tests/a11y-tokens.test.js [путь к bundle.js]
   Нужен jsdom (npm i -D jsdom). №1, №2, №5 на собранном бандле:
   какими токенами рисуются контролы и тост и как подписан индикатор состояния. */
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
let box = render(h(NS.DsCheckbox, { state: 'unchecked' }));
ok(box.querySelector('[aria-hidden="true"]').style.border.includes('var(--ds-border-control)'), 'DsCheckbox unchecked: граница ds-border-control');
box = render(h(NS.DsCheckbox, { state: 'unchecked' }));
ReactDOM.flushSync(()=>box.querySelector('label').dispatchEvent(new w.MouseEvent('mouseover',{bubbles:true})));
await new Promise(resolve=>setTimeout(resolve,0));
ok(box.querySelector('[aria-hidden="true"]').style.border.includes('var(--ds-border-control-hover)'), 'DsCheckbox unchecked + hover: ds-border-control-hover');
box = render(h(NS.DsCheckbox, { state: 'unchecked', radio: true }));
ok(box.querySelector('[aria-hidden="true"]').style.border.includes('var(--ds-border-control)'), 'радио unchecked: граница ds-border-control');
box = render(h(NS.DsSwitch, { checked: false, label: 'Показывать треки' }));
const track = box.querySelector('span[aria-hidden="true"]');
ok(track.style.border.includes('var(--ds-border-control)') && track.style.background.includes('var(--ds-border-control)'),
  'DsSwitch off: трек — ds-border-control (граница и заливка)');
ok(!fs.readFileSync(path.join(ROOT, 'components/src/components/forms/DsCheckbox.jsx'), 'utf8').includes('border-field'),
  'DsCheckbox больше не использует ds-border-field');

// №2 — действие в тосте
box = render(h(NS.DsToast, { action: () => {}, actionLabel: 'Отменить' }, 'Объект перемещён в архив'));
const act = [...box.querySelectorAll('button')].find((b) => b.textContent === 'Отменить');
ok(act.style.color === 'var(--ds-fg-action-on-inverse)', 'DsToast: действие — ds-fg-action-on-inverse');
ok(act.style.textDecoration.includes('underline'), 'DsToast: действие подчёркнуто (нецветовой признак)');

box = render(h(NS.DsStateIcon, { state: 'alarm' }));
ok(box.firstChild.getAttribute('aria-label') === 'Тревога', 'DsStateIcon по-прежнему подписан');

if (fails) { console.error(`${fails} FAIL`); process.exit(1); }
console.log('все проверки прошли');
