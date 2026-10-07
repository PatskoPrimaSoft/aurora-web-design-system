import {loadRuntime} from './helpers/runtime.js';
/* Запуск: node tests/rows-buttons.test.js [путь к bundle.js]
   Нужен jsdom (npm i -D jsdom). №3 — анатомия строк, №4 — выбор в DsTable,
   №8 — нажатие кнопок. Проверяется собранный бандл. */
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
const { React, ReactDOM } = w; const h = React.createElement;
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const render = (el) => { const box = w.document.createElement('div'); w.document.body.appendChild(box);
  const root = ReactDOM.createRoot(box); ReactDOM.flushSync(() => root.render(el)); return box; };
const act = (fn) => ReactDOM.flushSync(fn);
const fire = (el, type, props = {}, Ctor = w.Event) => { const e = new Ctor(type, { bubbles: true, cancelable: true, ...props });
  for (const [k, v] of Object.entries(props)) if (!(k in e) || e[k] !== v) Object.defineProperty(e, k, { value: v });
  act(() => el.dispatchEvent(e)); return e; };
const key = (el, type, k) => fire(el, type, { key: k }, w.KeyboardEvent);
const click = (el) => act(() => el.click());
const spy = () => { const f = (...a) => { f.calls.push(a); }; f.calls = []; return f; };
const nested = (box) => box.querySelectorAll('button button, [role="button"] button, button [role="button"]').length;

// Selection state names must drive both the glyph and the accessible control.
for (const [state, aria, glyph, next] of [
  ['unchecked', 'false', '', 'checked'],
  ['checked', 'true', 'check', 'unchecked'],
  ['indeterminate', 'mixed', 'remove', 'checked'],
]) {
  const change = spy();
  const box = render(h(NS.DsCheckButton, { state, label: 'Select objects', onChange: change }));
  const checkbox = box.querySelector('[role="checkbox"]');
  ok(checkbox.getAttribute('aria-checked') === aria && checkbox.textContent === glyph, `DsCheckButton ${state}: semantics and glyph agree`);
  click(checkbox);
  ok(change.calls[0]?.[0] === next, `DsCheckButton ${state}: emits ${next}`);
}
{
  const selectAll = spy();
  const box = render(h(NS.DsSelectionBar, { selected: 2, total: 5, onSelectAll: selectAll }));
  click(box.querySelector('[role="checkbox"]'));
  ok(selectAll.calls[0]?.[0] === true, 'DsSelectionBar: partial selection selects all objects');
  const change = spy();
  const disabled = render(h(NS.DsCheckButton, { state: 'checked', disabled: true, onChange: change }));
  click(disabled.querySelector('button'));
  ok(change.calls.length === 0, 'DsCheckButton disabled: click does not change the value');
}
{
  const box = render(h(NS.DsCheckbox, { radio: true, checked: false, indeterminate: true, label: 'Radio' }));
  ok(!box.querySelector('input').indeterminate && !box.querySelector('span[aria-hidden="true"]').firstChild,
    'DsCheckbox radio: indeterminate does not override unchecked state');
}
for (const checked of [false, true]) {
  const change = spy();
  const box = render(h(NS.DsCheckbox, { checked, indeterminate: true, label: 'All objects', onChange: event => change(event.target.checked) }));
  click(box.querySelector('input'));
  ok(change.calls[0]?.[0] === true, `DsCheckbox indeterminate (checked=${checked}): selects all`);
}

// ---------------- №3 DsObjectRow
{
  const open = spy(), sel = spy();
  const box = render(h(NS.DsObjectRow, { name: 'Volvo FH16', state: 'alarm', select: 'unchecked', onSelectChange: sel, onClick: open }));
  const cb = box.querySelector('[role="checkbox"]'), main = box.querySelector('button[aria-label="Volvo FH16"]');
  ok(main && nested(box) === 0, 'DsObjectRow: основная зона — кнопка, вложенных контролов нет');
  ok(!main.contains(cb), 'DsObjectRow: чекбокс — сосед основной зоны');
  const ks = key(cb, 'keydown', ' '), ke = key(cb, 'keydown', 'Enter');
  ok(!ks.defaultPrevented && !ke.defaultPrevented && open.calls.length === 0, 'DsObjectRow: Space/Enter на чекбоксе не перехватываются строкой');
  click(cb); ok(sel.calls.length === 1 && open.calls.length === 0, 'DsObjectRow: клик по чекбоксу — только выбор');
  click(main); ok(open.calls.length === 1, 'DsObjectRow: основная зона открывает объект');
  const plain = render(h(NS.DsObjectRow, { name: 'GAZ', state: 'parked' }));
  ok(!plain.querySelector('button') && plain.querySelector('[role="group"][aria-label="GAZ"]'), 'DsObjectRow без onClick — не контрол, но с именем');
}
// ---------------- №3 DsTreeRow
{
  const open = spy(), tog = spy(), sel = spy();
  const box = render(h(NS.DsTreeRow, { title: 'Грузовики', expanded: true, onToggle: tog, onClick: open, select: 'indeterminate', onSelectChange: sel }));
  const chev = box.querySelector('button[aria-expanded]'), cb = box.querySelector('[role="checkbox"]');
  const main = [...box.querySelectorAll('button')].find((b) => b !== chev && b !== cb);
  ok(nested(box) === 0 && chev && main, 'DsTreeRow: шеврон, основная зона и чекбокс — соседи');
  ok(chev.getAttribute('aria-label') === 'Свернуть «Грузовики»', 'DsTreeRow: у шеврона понятное имя');
  ok(!key(cb, 'keydown', ' ').defaultPrevented, 'DsTreeRow: Space на чекбоксе не перехватывается');
  click(cb); ok(sel.calls.length === 1 && tog.calls.length === 0, 'DsTreeRow: чекбокс выбирает, но не сворачивает');
  click(main); ok(open.calls.length === 1 && tog.calls.length === 0, 'DsTreeRow: основная зона открывает');
  click(chev); ok(tog.calls.length === 1 && tog.calls[0][0] === false, 'DsTreeRow: шеврон сворачивает');
  const t2 = spy(); const b2 = render(h(NS.DsTreeRow, { title: 'Фургоны', expanded: false, onToggle: t2 }));
  const m2 = b2.querySelector('button'); click(m2);
  ok(b2.querySelectorAll('button').length === 1 && m2.getAttribute('aria-expanded') === 'false' && t2.calls[0][0] === true,
    'DsTreeRow только с onToggle: одна кнопка раскрытия с aria-expanded');
}
// ---------------- №3 DsListRow
{
  const open = spy(), del = spy();
  const box = render(h(NS.DsListRow, { title: 'MAZ 5440', onClick: open, actions: h(NS.DsIconButton, { icon: 'delete', label: 'Удалить', onClick: del }) }));
  const btn = box.querySelector('button[aria-label="Удалить"]');
  ok(nested(box) === 0, 'DsListRow: действия не вложены в основную кнопку');
  click(btn); ok(del.calls.length === 1 && open.calls.length === 0, 'DsListRow: действие не открывает строку');
  click(box.querySelector('button:not([aria-label])')); ok(open.calls.length === 1, 'DsListRow: основная зона открывает');
}
// ---------------- №3 + №4 DsTable
const ROWS = [{ id: 3, name: 'Scania' }, { id: 4, name: 'Renault' }];
const cols = [{ key: 'name', label: 'Объект' }, { key: 'x', label: 'X', render: () => 'ячейка' }];
const table = (p) => render(h(NS.DsTable, { columns: cols, rows: ROWS, selectable: true, ...p }));
const head = (box) => box.querySelector('th [role="checkbox"]');
{
  const openRow = spy(), tog = spy();
  const box = table({ selectedIds: [], onRowClick: openRow, onToggleRow: tog });
  const rowBtn = box.querySelector('[data-ds-row-action]');
  ok(rowBtn && rowBtn.textContent === 'Scania', 'DsTable: строку можно открыть кнопкой в опорной колонке');
  click(rowBtn); ok(openRow.calls.length === 1, 'DsTable: кнопка строки открывает её один раз');
  click(box.querySelectorAll('td [role="checkbox"]')[0]); ok(tog.calls.length === 1 && openRow.calls.length === 1, 'DsTable: чекбокс строки её не открывает');
  click(box.querySelectorAll('tbody td')[2]); ok(openRow.calls.length === 2, 'DsTable: клик мышью по ячейке открывает строку');
  ok(box.querySelectorAll('td [role="checkbox"]')[0].getAttribute('aria-label') === 'Выбрать «Scania»', 'DsTable: чекбокс строки назван по строке');
}
ok(head(table({ selectedIds: [1, 2] })).getAttribute('aria-checked') === 'false', '№4: выбранные на другой странице не включают «выбрать все»');
ok(head(table({ selectedIds: [1, 3] })).getAttribute('aria-checked') === 'mixed', '№4: часть видимых — indeterminate');
ok(head(table({ selectedIds: [4, 1, 3] })).getAttribute('aria-checked') === 'true', '№4: все видимые (+ чужие) — checked');
{
  const tv = spy(); let box = table({ selectedIds: [3], onToggleVisible: tv }); click(head(box));
  ok(JSON.stringify(tv.calls[0]) === JSON.stringify([[3, 4], 'checked']), '№4: из indeterminate — onToggleVisible(видимые ID, "checked")');
  box = table({ selectedIds: [3, 4], onToggleVisible: tv }); click(head(box));
  ok(JSON.stringify(tv.calls[1]) === JSON.stringify([[3, 4], 'unchecked']), '№4: из checked — onToggleVisible(видимые ID, "unchecked")');
  const old = spy(), warns = []; const cw = w.console.warn; w.console.warn = (m) => warns.push(m);
  click(head(table({ selectedIds: [], onToggleAll: old }))); click(head(table({ selectedIds: [], onToggleAll: old })));
  w.console.warn = cw;
  ok(old.calls.length === 2 && old.calls[0][0] === 'checked' && warns.length === 1, '№4: старый onToggleAll работает, предупреждение одно');
}
{
  const all = spy(), clear = spy();
  let box = table({ selectedIds: [3, 4], totalCount: 120, onSelectAll: all });
  const b = [...box.querySelectorAll('button')].find((x) => x.textContent === 'Выбрать все 120');
  ok(b && box.textContent.includes('Выбраны все 2 на странице'), '№4: предложение выбрать всю выборку');
  click(b); ok(all.calls.length === 1, '№4: onSelectAll вызван');
  ok(!table({ selectedIds: [3], totalCount: 120, onSelectAll: all }).textContent.includes('Выбрать все 120'), '№4: пока страница выбрана не вся — не предлагаем');
  box = table({ selectedIds: [], allSelected: true, totalCount: 120, onClearSelection: clear });
  ok(head(box).getAttribute('aria-checked') === 'true' && [...box.querySelectorAll('td [role="checkbox"]')].every((c) => c.getAttribute('aria-checked') === 'true'),
    '№4: allSelected — заголовок и строки выбраны');
  click([...box.querySelectorAll('button')].find((x) => x.textContent === 'Снять выбор')); ok(clear.calls.length === 1, '№4: «Снять выбор» вызывает onClearSelection');
  const e = render(h(NS.DsTable, { columns: cols, rows: [], selectable: true, selectedIds: [5] }));
  ok(head(e).disabled && head(e).getAttribute('aria-checked') === 'false', '№4: пустая таблица — «выбрать все» отключён');
}
// ---------------- №8 нажатие
const img = (el) => el.style.backgroundImage || '';
const mouse = { pointerType: 'mouse', button: 0 };
{
  const kd = spy(); const box = render(h(NS.DsButton, { onKeyDown: kd }, 'Сохранить')); const b = box.querySelector('button');
  fire(b, 'pointerdown', mouse); ok(img(b).includes('overlay-press'), 'DsButton: мышь — нажатие 16%');
  fire(b, 'pointerup', mouse); ok(!img(b).includes('overlay-press'), 'DsButton: отпускание снимает нажатие');
  key(b, 'keydown', ' '); ok(img(b).includes('overlay-press') && kd.calls.length === 1, 'DsButton: Space — нажатие, onKeyDown потребителя вызван');
  key(b, 'keyup', ' '); ok(!img(b).includes('overlay-press'), 'DsButton: keyup Space снимает нажатие');
  key(b, 'keydown', 'Enter'); ok(img(b).includes('overlay-press'), 'DsButton: Enter — нажатие'); key(b, 'keyup', 'Enter');
  fire(b, 'pointerdown', { pointerType: 'touch' }); ok(img(b).includes('overlay-press'), 'DsButton: touch — нажатие'); fire(b, 'pointercancel', {});
  /* onPointerEnter React строит из pointerover, и это «непрерывное» событие: его
     обновление рендерится не синхронно, поэтому ждём тик. */
  const tick = () => new Promise((r) => setTimeout(r, 30));
  fire(b, 'pointerover', { pointerType: 'touch' }); await tick(); ok(!img(b).includes('overlay'), 'DsButton: touch не даёт hover');
  fire(b, 'pointerout', { pointerType: 'touch' }); fire(b, 'pointerover', mouse); await tick(); ok(img(b).includes('overlay-hover'), 'DsButton: hover мыши — 10%');
  const d = render(h(NS.DsButton, { disabled: true }, 'Нет')).querySelector('button');
  fire(d, 'pointerdown', mouse); key(d, 'keydown', ' '); ok(!img(d), 'DsButton disabled: не реагирует');
  const s = render(h(NS.DsButton, { tone: 'secondary' }, 'Отмена')).querySelector('button');
  fire(s, 'pointerdown', mouse); ok(s.style.background.includes('surface-active'), 'DsButton secondary: нажатие сдвигает фон');
}
{
  const p = render(h(NS.DsIconButton, { icon: 'add', label: 'Добавить', tone: 'primary' })).querySelector('button');
  fire(p, 'pointerdown', mouse); ok(img(p).includes('overlay-press'), 'DsIconButton primary: нажатие 16%');
  const g = render(h(NS.DsIconButton, { icon: 'edit', label: 'Править' })).querySelector('button');
  key(g, 'keydown', ' '); ok(g.style.background.includes('surface-active'), 'DsIconButton ghost: Space — нажатие сдвигает фон');
  ok(!g.hasAttribute('aria-pressed'), 'DsIconButton без active — не переключатель');
  const t0 = render(h(NS.DsIconButton, { icon: 'filter_alt', label: 'Фильтр', active: false })).querySelector('button');
  const t1 = render(h(NS.DsIconButton, { icon: 'filter_alt', label: 'Фильтр', active: true })).querySelector('button');
  ok(t0.getAttribute('aria-pressed') === 'false' && t1.getAttribute('aria-pressed') === 'true', 'DsIconButton active: устойчивое состояние — aria-pressed');
  fire(t1, 'pointerdown', mouse); ok(img(t1).includes('overlay-press'), 'DsIconButton active: нажатие поверх выбранного');
  const f = render(h(NS.DsFab, { label: 'Добавить объект' })).querySelector('button');
  fire(f, 'pointerdown', { pointerType: 'touch' }); ok(img(f).includes('overlay-press'), 'DsFab: touch — нажатие 16%');
  key(f, 'keyup', ' '); fire(f, 'pointerup', {}); ok(!img(f).includes('overlay-press'), 'DsFab: отпускание снимает нажатие');
  const fd = render(h(NS.DsFab, { label: 'X', disabled: true })).querySelector('button');
  fire(fd, 'pointerdown', mouse); ok(!img(fd), 'DsFab disabled: не реагирует');
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }
console.log('все проверки прошли');
