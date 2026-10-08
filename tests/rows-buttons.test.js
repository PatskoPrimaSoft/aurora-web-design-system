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
// DsChipGroup: композиция не перехватывает действия чипов, очистка управляется родителем.
{
  ok(typeof NS.DsChipGroup === 'function', 'DsChipGroup: экспортируется');
  if(NS.DsChipGroup){
    const clear=spy(),select=spy(),remove=spy();
    const chips=[h(NS.DsChip,{key:'a',selected:true,onClick:select},'Нет связи'),h(NS.DsChip,{key:'b',onClick:select},'Грузовики')];
    const box=render(h(NS.DsChipGroup,{ariaLabel:'Типы объектов',onClearAll:clear},chips));
    ok(box.firstElementChild.getAttribute('role')==='group'&&box.firstElementChild.getAttribute('aria-label')==='Типы объектов','DsChipGroup: доступное имя группы');
    const buttons=box.querySelectorAll('button');
    click(buttons[0]);click(buttons[2]);
    ok(select.calls.length===1&&clear.calls.length===1&&buttons[2].textContent==='Очистить все','DsChipGroup: выбор и очистка вызывают независимые обработчики');
    ok(box.querySelectorAll('[aria-pressed]').length===2&&nested(box)===0,'DsChipGroup: очистка не меняет дочерние чипы и не создаёт вложенных кнопок');
    const values=render(h(NS.DsChipGroup,{ariaLabel:'Значения'},h(NS.DsChip,{removable:true,onRemove:remove},'Топливо')));
    click(values.querySelector('button'));
    ok(remove.calls.length===1&&values.querySelectorAll('button').length===1,'DsChipGroup: без onClearAll остаётся только удаление значения');
    const empty=render(h(NS.DsChipGroup,{ariaLabel:'Пустая',onClearAll:clear},[null,false]));
    ok(!empty.firstElementChild,'DsChipGroup: пустая группа не показывает очистку');
    const fragment=render(h(NS.DsChipGroup,{ariaLabel:'Пустая',onClearAll:clear},h(React.Fragment,null,false)));
    ok(!fragment.firstElementChild,'DsChipGroup: пустой фрагмент не показывает очистку');
    const en=render(h(NS.DsStringsProvider,{strings:NS.dsStringsEn},h(NS.DsChipGroup,{ariaLabel:'Values',onClearAll:clear},h(NS.DsChip,null,'Fuel'))));
    ok(en.querySelector('button').textContent==='Clear all','DsChipGroup: очистка локализована');
  }
}
// DsChip: семантика выбора, блокировка удаления и имена одинаковых крестиков.
{
  const select = spy(), remove = spy();
  const filter = render(h(NS.DsChip, {selected:true,count:0,onClick:select}, 'Нет связи'));
  const button = filter.querySelector('button');
  ok(button?.getAttribute('aria-pressed') === 'true' && button?.type === 'button', 'DsChip: фильтр — нативная кнопка с объявленным выбором');
  ok(button?.querySelector('[aria-hidden="true"]')?.textContent === 'check' && button?.getAttribute('aria-label') === 'Нет связи 0', 'DsChip: выбранный фильтр отмечен галочкой, нулевой счётчик доступен');
  if(button)click(button);
  ok(select.calls.length === 1, 'DsChip: фильтр вызывает действие один раз');
  const idle = render(h(NS.DsChip, {onClick:select}, 'Грузовики')).querySelector('button');
  ok(idle?.getAttribute('aria-pressed') === 'false' && !idle?.querySelector('[aria-hidden="true"]'), 'DsChip: невыбранный фильтр объявлен без галочки');
  const disabled = render(h(NS.DsChip, {disabled:true,removable:true,onRemove:remove}, 'Топливо'));
  const cross = disabled.querySelector('button');
  click(cross);
  ok(cross.disabled && remove.calls.length === 0, 'DsChip: disabled блокирует удаление');
  const value = render(h(NS.DsChip, {removable:true,onRemove:remove,onClick:select}, 'Пробег'));
  ok(nested(value) === 0 && value.firstElementChild.tagName === 'SPAN', 'DsChip: удаляемое значение не содержит вложенных кнопок');
  ok(value.querySelector('button').getAttribute('aria-label') === 'Убрать: Пробег', 'DsChip: имя крестика включает значение');
  click(value.querySelector('button'));
  ok(remove.calls.length === 1 && select.calls.length === 1, 'DsChip: удаление не запускает выбор');
  const en = render(h(NS.DsStringsProvider, {strings:NS.dsStringsEn}, h(NS.DsChip, {removable:true}, 'Fuel')));
  ok(en.querySelector('button').getAttribute('aria-label') === 'Remove: Fuel', 'DsChip: имя удаления локализовано');
  const rich = render(h(NS.DsChip, {removable:true,ariaLabel:'Полное имя'}, h('strong', null, 'Имя')));
  ok(rich.querySelector('button').getAttribute('aria-label') === 'Убрать: Полное имя', 'DsChip: сложное содержимое использует полную подпись');
}
// DsBulkActionsBar: один сброс при любом объёме выбора, с сохранением обоих контрактов обработчиков.
{
  ok(typeof NS.DsBulkActionsBar === 'function' && NS.DsBulkBar === undefined, 'DsBulkActionsBar: новое имя экспортируется без старого алиаса');
  const select = spy(), clear = spy();
  const bulk = (props) => render(h(NS.DsBulkActionsBar, { count: 12, total: 148, noun: 'объектов',
    onSelectAll: select, onClear: clear, actions: h(NS.DsButton, null, 'Экспорт'), ...props }));
  const partial = bulk({});
  ok(partial.textContent.includes('Выбрано: 12 объектов'), 'DsBulkActionsBar: единая подпись частичного выбора');
  const buttons = [...partial.querySelectorAll('button')];
  ok(buttons.map(b => b.textContent).join('|') === 'Выбрать все 148|Экспорт|Снять выбор', 'DsBulkActionsBar: порядок и единственная кнопка сброса');
  ok(buttons[2].style.height === 'var(--ds-control-h-sm)' && buttons[2].style.borderRadius === 'var(--ds-radius-control)', 'DsBulkActionsBar: выравнивание сброса не заменяет оформление DsButton');
  click(buttons[0]); click(buttons[2]);
  ok(select.calls[0]?.[0] === true && clear.calls.length === 1, 'DsBulkActionsBar: выбрать все и очистить используют свои обработчики');
  const full = bulk({count: 148});
  ok(full.textContent.includes('Выбраны все 148 объектов') && full.querySelectorAll('button').length === 2, 'DsBulkActionsBar: полный выбор без дублирующего сброса');
  const fallback = bulk({count: 148, onClear: undefined});
  click([...fallback.querySelectorAll('button')].find(b => b.textContent === 'Снять выбор'));
  ok(select.calls.at(-1)?.[0] === false, 'DsBulkActionsBar: без onClear сброс вызывает onSelectAll(false)');
  const empty = bulk({count: 0});
  ok(!empty.querySelector('[role="toolbar"]'), 'DsBulkActionsBar: при пустом выборе панель скрыта');
  const en = render(h(NS.DsStringsProvider, {strings:NS.dsStringsEn}, h(NS.DsBulkActionsBar, {count:148,total:148})));
  ok(en.textContent.includes('All 148 objects selected'), 'DsBulkActionsBar: полный выбор локализован');
}


// ---------------- №3 DsTreeRow
{
  const open = spy(), tog = spy(), sel = spy();
  const box = render(h(NS.DsTreeRow, { title: 'Грузовики', expanded: true, onToggle: tog, onClick: open, select: 'indeterminate', onSelectChange: sel }));
  const chev = box.querySelector('button[aria-expanded]'), cb = box.querySelector('input[type="checkbox"]');
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
  for(const props of [{active:true},{selected:true}]){
    const box=render(h(NS.DsListRow,{title:'Объект',onClick:()=>{},...props}));
    const button=box.querySelector('button');
    fire(button,'pointerover',{pointerType:'mouse'});
    await new Promise(resolve=>w.setTimeout(resolve,0));
    ok(box.firstElementChild.style.backgroundImage.includes('overlay-hover'),'DsListRow: выбранная строка реагирует на наведение');
    fire(button,'pointerdown',{pointerType:'mouse',button:0});
    ok(box.firstElementChild.style.backgroundImage.includes('overlay-press'),'DsListRow: нажатие усиливает оверлей выбранной строки');
    fire(button,'pointerup',{pointerType:'mouse'});
    ok(box.firstElementChild.style.backgroundImage.includes('overlay-hover'),'DsListRow: отпускание возвращает наведение');
  }
}
{
  for(const [active,selected] of [[true,false],[false,true],[true,true]]){
    const row=render(h(NS.DsListRow,{title:'Объект',active,selected})).firstElementChild;
    ok(row.style.background==='var(--ds-surface-selected)',`DsListRow active=${active} selected=${selected}: подложка просмотра и выбора`);
    ok(row.style.boxShadow.includes('inset')===active,`DsListRow active=${active} selected=${selected}: полоса только для просмотра`);
  }
}
{
  const open=spy();
  const link=render(h(NS.DsListRow,{title:'Объект',href:'#object',active:true,actionsWidth:32}));
  ok(link.querySelector('a')?.getAttribute('href')==='#object'&&link.querySelector('a')?.getAttribute('aria-current')==='page','DsListRow: переход — нативная ссылка с текущей страницей');
  ok(link.querySelector('[data-ds-list-actions]')?.style.width==='32px','DsListRow: пустое место действий сохраняет ширину колонки');
  const passive=render(h(NS.DsListRow,{title:'Объект',as:'div',href:'#object',onClick:open}));
  ok(!passive.querySelector('a,button'),'DsListRow: as=div отключает и ссылку, и кнопку');
  const text=render(h(NS.DsListRow,{title:'Объект',subtitle:'Нет связи',onClick:open}));
  ok(text.querySelector('[data-ds-list-subtitle]')?.style.fontFamily!=='var(--ds-font-mono)','DsListRow: пояснение использует обычный шрифт');
  const mono=render(h(NS.DsListRow,{title:'Объект',subtitle:'AB 1234-7',subtitleMono:true}));
  ok(mono.querySelector('[data-ds-list-subtitle]')?.style.fontFamily==='var(--ds-font-mono)','DsListRow: номера можно оформить моноширинным шрифтом');
  const button=text.querySelector('button');
  key(button,'keydown',' ');
  ok(text.firstElementChild.style.background==='var(--ds-surface-active)','DsListRow: клавиатурное нажатие меняет подложку');
  fire(button,'focusout');
  ok(text.firstElementChild.style.background!=='var(--ds-surface-active)','DsListRow: потеря фокуса сбрасывает нажатие');
}
{
  const open = spy(), del = spy();
  const box = render(h(NS.DsListRow, { title: 'MAZ 5440', onClick: open, actions: h(NS.DsIconButton, { icon: 'delete', label: 'Удалить', onClick: del }) }));
  const btn = box.querySelector('button[aria-label="Удалить"]');
  ok(nested(box) === 0, 'DsListRow: действия не вложены в основную кнопку');
  click(btn); ok(del.calls.length === 1 && open.calls.length === 0, 'DsListRow: действие не открывает строку');
  click(box.querySelector('button:not([aria-label])')); ok(open.calls.length === 1, 'DsListRow: основная зона открывает');
  ok(!btn.hasAttribute('title'),'DsListRow: DsIconButton не дублирует подсказку нативным title');
  fire(btn,'focusin');
  ok(box.querySelector('[role="tooltip"]')?.textContent==='Удалить','DsListRow: действие показывает подпись с клавиатуры');
  fire(box.querySelector('[data-ds-list-title]'),'pointerover',{pointerType:'mouse'});
  await new Promise(resolve=>w.setTimeout(resolve,0));
  ok(!box.querySelector('[role="tooltip"]'),'DsListRow: переход к короткому названию закрывает подсказку действия');
  const title=box.querySelector('[data-ds-list-title]');
  Object.defineProperty(title,'scrollWidth',{value:200});Object.defineProperty(title,'clientWidth',{value:100});
  fire(box.querySelector('button:not([aria-label])'),'focusin');
  ok(box.querySelector('[role="tooltip"]')?.textContent==='MAZ 5440','DsListRow: сокращённое название раскрывается при фокусе');
  key(box.querySelector('button:not([aria-label])'),'keydown','Escape');
  ok(!box.querySelector('[role="tooltip"]'),'DsListRow: Escape закрывает подсказку');
}
// ---------------- №3 + №4 DsTable
const ROWS = [{ id: 3, name: 'Scania' }, { id: 4, name: 'Renault' }];
const cols = [{ key: 'name', label: 'Объект' }, { key: 'x', label: 'X', render: () => 'ячейка' }];
const table = (p) => render(h(NS.DsTable, { columns: cols, rows: ROWS, selectable: true, ...p }));
const head = (box) => box.querySelector('th input[type="checkbox"]');
{
  const openRow = spy(), tog = spy();
  const box = table({ selectedIds: [], onRowClick: openRow, onToggleRow: tog });
  const rowBtn = box.querySelector('[data-ds-row-action]');
  ok(rowBtn && rowBtn.textContent === 'Scania', 'DsTable: строку можно открыть кнопкой в опорной колонке');
  click(rowBtn); ok(openRow.calls.length === 1, 'DsTable: кнопка строки открывает её один раз');
  click(box.querySelectorAll('td input[type="checkbox"]')[0]); ok(tog.calls.length === 1 && openRow.calls.length === 1, 'DsTable: чекбокс строки её не открывает');
  click(box.querySelectorAll('tbody td')[2]); ok(openRow.calls.length === 2, 'DsTable: клик мышью по ячейке открывает строку');
  ok(box.querySelectorAll('td input[type="checkbox"]')[0].getAttribute('aria-label') === 'Выбрать «Scania»', 'DsTable: чекбокс строки назван по строке');
}
ok(head(table({ selectedIds: [1, 2] })).checked === false, '№4: выбранные на другой странице не включают «выбрать все»');
ok(head(table({ selectedIds: [1, 3] })).indeterminate === true, '№4: часть видимых — indeterminate');
ok(head(table({ selectedIds: [4, 1, 3] })).checked === true, '№4: все видимые (+ чужие) — checked');
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
  ok(head(box).checked === true && [...box.querySelectorAll('td input[type="checkbox"]')].every((c) => c.checked === true),
    '№4: allSelected — заголовок и строки выбраны');
  click([...box.querySelectorAll('button')].find((x) => x.textContent === 'Снять выбор')); ok(clear.calls.length === 1, '№4: «Снять выбор» вызывает onClearSelection');
  const e = render(h(NS.DsTable, { columns: cols, rows: [], selectable: true, selectedIds: [5] }));
  ok(head(e).disabled && head(e).checked === false, '№4: пустая таблица — «выбрать все» отключён');
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
// DsPagination: прямые переходы, текущая страница и доступная навигация.
{
  const change=spy();
  const box=render(h(NS.DsPagination,{page:9,pageSize:10,length:200,onPageChange:change,ariaLabel:'Страницы объектов'}));
  ok(box.firstElementChild.tagName==='NAV'&&box.firstElementChild.getAttribute('aria-label')==='Страницы объектов','DsPagination: именованная навигация');
  const current=box.querySelector('[aria-current="page"]');
  ok(current?.textContent==='10'&&!current?.hasAttribute('aria-pressed'),'DsPagination: текущая страница объявлена как page');
  const last=Array.from(box.querySelectorAll('button')).find(b=>b.textContent==='20');
  if(last)click(last);
  ok(change.calls[0]?.[0]===19,'DsPagination: прямой переход сохраняет индекс с нуля');
  ok(!box.querySelector('button')?.textContent.includes('…')&&box.textContent.includes('…'),'DsPagination: пропуски страниц не кнопки');
  const compact=render(h(NS.DsPagination,{page:1,pageSize:10,length:200,compact:true,onPageChange:change,onPageSizeChange:spy()}));
  ok(compact.querySelectorAll('button').length===2&&!compact.querySelector('select')&&!compact.querySelector('[aria-current]'),'DsPagination: компактный вариант сохраняет две стрелки');
  const empty=render(h(NS.DsPagination,{length:0,onPageChange:change}));
  ok(empty.querySelectorAll('button').length===2&&Array.from(empty.querySelectorAll('button')).every(b=>b.disabled),'DsPagination: пустая выборка без фиктивной страницы');
  const en=render(h(NS.DsStringsProvider,{strings:NS.dsStringsEn},h(NS.DsPagination,{length:30,pageSize:10,onPageChange:change})));
  ok(en.querySelector('nav')?.getAttribute('aria-label')==='Pagination'&&en.querySelector('[aria-current]')?.getAttribute('aria-label')==='Page 1','DsPagination: локализация навигации и номеров страниц');
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }
console.log('все проверки прошли');
