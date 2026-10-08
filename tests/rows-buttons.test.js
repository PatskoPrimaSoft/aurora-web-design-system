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
// DsIconButton: подсказка и загрузка согласованы с остальными кнопками.
{
  const host=d.createElement('div');d.body.append(host);const root=ReactDOM.createRoot(host);
  const action=spy(),submit=spy(),outer=spy(),focus=spy();
  const draw=(props={})=>act(()=>root.render(h('form',{onSubmit:e=>{e.preventDefault();submit();},onKeyDown:e=>{if(e.key==='Escape'&&!e.defaultPrevented)outer();}},
    h(NS.DsIconButton,{icon:'refresh',label:'Обновить данные',tone:'primary',onClick:action,onFocus:focus,'aria-describedby':'hint',...props}))));
  draw();const button=host.querySelector('button');act(()=>button.focus());
  ok(!button.hasAttribute('aria-label')&&button.querySelector('[data-ds-icon-button-label]')?.textContent==='Обновить данные','DsIconButton: доступное имя задано переводимым скрытым текстом');
  ok(d.querySelector('[role="tooltip"]')?.textContent==='Обновить данные'&&!button.hasAttribute('title'),'DsIconButton: подсказка по фокусу без title');
  ok(button.getAttribute('aria-describedby')?.startsWith('hint ')&&focus.calls.length===1,'DsIconButton: описание и обработчик фокуса сохраняются');
  key(button,'keydown','Escape');ok(!d.querySelector('[role="tooltip"]')&&outer.calls.length===0,'DsIconButton: Escape закрывает только подсказку');
  key(button,'keydown','Escape');ok(outer.calls.length===1,'DsIconButton: без подсказки Escape доходит до внешнего слоя');
  draw({loading:true,type:'submit'});
  ok(button.querySelector('[data-ds-icon-button-label]')?.textContent==='Обновить данные','DsIconButton: скрытая подпись сохраняется при загрузке');
  ok(d.activeElement===button&&!button.disabled&&button.getAttribute('aria-busy')==='true'&&button.getAttribute('aria-disabled')==='true','DsIconButton: загрузка сохраняет фокус и объявляет состояние');
  const event=fire(button,'click',{},w.MouseEvent);
  ok(event.defaultPrevented&&!action.calls.length&&!submit.calls.length,'DsIconButton: загрузка блокирует действие и submit');
  ok(!!button.querySelector('[data-ds-icon-button-spinner]')&&button.style.background.includes('ds-brand'),'DsIconButton: спиннер сохраняет тон');
  draw({type:'submit'});click(button);
  ok(action.calls.length===1&&submit.calls.length===1,'DsIconButton: после загрузки действие и submit работают');
  draw({disabled:true,loading:true});ok(button.disabled,'DsIconButton: явный disabled сохраняет нативную блокировку');
  act(()=>root.unmount());host.remove();
}
// DsFab: подсказка соблюдает Escape-контракт, загрузка сохраняет фокус и блокирует submit.
{
  const host=d.createElement('div');d.body.append(host);const root=ReactDOM.createRoot(host);
  const action=spy(),submit=spy(),outer=spy(),focus=spy();
  const draw=(props={})=>act(()=>root.render(h('form',{onSubmit:e=>{e.preventDefault();submit();},onKeyDown:e=>{if(e.key==='Escape'&&!e.defaultPrevented)outer();}},
    h(NS.DsFab,{label:'Добавить объект',onClick:action,onFocus:focus,...props}))));
  draw();let button=host.querySelector('button');act(()=>button.focus());
  ok(d.querySelector('[role="tooltip"]')?.textContent==='Добавить объект'&&!button.hasAttribute('title'),'DsFab: системная подсказка по фокусу без нативного title');
  key(button,'keydown','Escape');ok(!d.querySelector('[role="tooltip"]')&&outer.calls.length===0,'DsFab: Escape закрывает только видимую подсказку');
  key(button,'keydown','Escape');ok(outer.calls.length===1,'DsFab: без подсказки Escape передаётся внешнему слою');
  ok(focus.calls.length===1,'DsFab: обработчик фокуса потребителя сохраняется');
  draw({loading:true,type:'submit'});
  ok(d.activeElement===button&&!button.disabled&&button.getAttribute('aria-busy')==='true'&&button.getAttribute('aria-disabled')==='true','DsFab: загрузка сохраняет фокус и объявляет недоступность');
  const event=fire(button,'click',{},w.MouseEvent);
  ok(event.defaultPrevented&&action.calls.length===0&&submit.calls.length===0,'DsFab: загрузка блокирует действие и submit');
  ok(!!button.querySelector('[data-ds-fab-spinner]')&&button.style.background.includes('ds-brand'),'DsFab: загрузка сохраняет тон и показывает спиннер');
  draw({extended:true});act(()=>button.blur());act(()=>button.focus());
  ok(!d.querySelector('[role="tooltip"]'),'DsFab: полная видимая подпись не дублируется подсказкой');
  draw({disabled:true,loading:true});ok(button.disabled,'DsFab: явный disabled сохраняет нативную блокировку');
  act(()=>root.unmount());host.remove();
}
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
  const btn = box.querySelector('[data-ds-list-actions] button');
  const main = box.querySelector('button');
  ok(nested(box) === 0, 'DsListRow: действия не вложены в основную кнопку');
  click(btn); ok(del.calls.length === 1 && open.calls.length === 0, 'DsListRow: действие не открывает строку');
  click(main); ok(open.calls.length === 1, 'DsListRow: основная зона открывает');
  ok(!btn.hasAttribute('title'),'DsListRow: DsIconButton не дублирует подсказку нативным title');
  act(()=>btn.focus());
  ok(d.querySelectorAll('[role="tooltip"]').length===1&&d.querySelector('[role="tooltip"]')?.textContent==='Удалить','DsListRow: действие показывает одну системную подсказку с клавиатуры');
  act(()=>btn.blur());
  fire(box.querySelector('[data-ds-list-title]'),'pointerover',{pointerType:'mouse'});
  await new Promise(resolve=>w.setTimeout(resolve,0));
  ok(!d.querySelector('[role="tooltip"]'),'DsListRow: переход к короткому названию закрывает подсказку действия');
  const title=box.querySelector('[data-ds-list-title]');
  Object.defineProperty(title,'scrollWidth',{value:200});Object.defineProperty(title,'clientWidth',{value:100});
  fire(main,'focusin');
  ok(box.querySelector('[role="tooltip"]')?.textContent==='MAZ 5440','DsListRow: сокращённое название раскрывается при фокусе');
  key(main,'keydown','Escape');
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
// DsButton: загрузка сохраняет фокус, блокирует действие и отправку формы.
{
  const box=d.createElement('div');d.body.appendChild(box);
  const root=ReactDOM.createRoot(box),action=spy(),submit=spy(),parentClick=spy();
  function update(props){act(()=>root.render(h('form',{onSubmit:e=>{e.preventDefault();submit();},onClick:parentClick},
    h(NS.DsButton,{type:'submit',icon:'save',iconRight:'arrow_forward',onClick:action,...props},'Сохранить изменения'))));}
  update({});
  const button=box.querySelector('button');act(()=>button.focus());
  const color=button.style.color,background=button.style.background;
  update({loading:true});
  ok(!button.disabled&&button.getAttribute('aria-disabled')==='true'&&button.getAttribute('aria-busy')==='true','DsButton: загрузка объявлена и сохраняет фокусируемость');
  ok(d.activeElement===button&&button.style.color===color&&button.style.background===background,'DsButton: загрузка сохраняет фокус и тон');
  const event=fire(button,'click',{},w.MouseEvent);
  ok(event.defaultPrevented&&action.calls.length===0&&submit.calls.length===0&&parentClick.calls.length===0,'DsButton: загрузка блокирует действие, отправку формы и всплытие клика');
  ok(button.textContent.includes('Сохранить изменения'),'DsButton: при загрузке остаётся доступная подпись');
  update({loading:false});
  click(button);
  ok(action.calls.length===1&&submit.calls.length===1,'DsButton: после загрузки действие и submit восстановлены');
  update({disabled:true,loading:true});
  ok(button.disabled,'DsButton: явный disabled сохраняет нативную блокировку');
  act(()=>root.unmount());box.remove();
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

// DsTable: имя, сортировка и раскрытие текста без вмешательства в действия строки.
{
  const sort=spy();
  const box=render(h(NS.DsTable,{caption:'Транспорт',ariaLabel:'Транспорт компании',fixedLayout:true,
    columns:[{key:'name',label:'Объект',sortable:true}],rows:ROWS,sortKey:'name',sortDir:'asc',onSort:sort}));
  ok(box.querySelector('caption')?.textContent==='Транспорт'&&box.querySelector('table')?.getAttribute('aria-label')==='Транспорт компании','DsTable: подпись и доступное имя');
  ok(box.querySelector('th')?.getAttribute('scope')==='col','DsTable: заголовок связан со столбцом');
  ok(box.querySelector('table')?.style.tableLayout==='fixed','DsTable: фиксированная раскладка включается явно');
  const button=box.querySelector('th button');
  ok(button?.getAttribute('aria-label')==='Объект: сортировать по убыванию','DsTable: сортировка объявляет следующее действие');
  click(button);
  ok(JSON.stringify(sort.calls[0])===JSON.stringify(['name','desc']),'DsTable: сортировка сохраняет управляемый контракт');
  const en=render(h(NS.DsStringsProvider,{strings:NS.dsStringsEn},h(NS.DsTable,{columns:[{key:'name',label:'Name',sortable:true}],onSort:sort})));
  ok(en.querySelector('th button')?.getAttribute('aria-label')==='Name: sort ascending','DsTable: действие сортировки локализовано');
}
{
  const box=table({selectedIds:[3],activeId:4}),rows=box.querySelectorAll('tbody tr');
  for(const row of rows){
    fire(row,'mouseover',{relatedTarget:null},w.MouseEvent);
    await new Promise(resolve=>setTimeout(resolve,30));
    ok(row.style.backgroundImage.includes('overlay-hover'),'DsTable: наведение видно поверх выбора и просмотра');
    fire(row,'mouseout',{relatedTarget:d.body},w.MouseEvent);
  }
}
{
  const open=spy();
  const box=render(h(NS.DsTable,{columns:[{key:'name',label:'Имя'}],rows:[{id:1,name:'Очень длинное имя объекта'}],onRowClick:open}));
  const button=box.querySelector('[data-ds-row-action]'),text=button?.querySelector('[data-ds-table-text]');
  // jsdom не выполняет раскладку: задаём только результат измерения обрезки.
  if(text){Object.defineProperty(text,'scrollWidth',{value:200});Object.defineProperty(text,'clientWidth',{value:80});}
  fire(button,'focusin',{},w.FocusEvent);
  const tip=d.querySelector('[role="tooltip"]');
  ok(tip?.textContent==='Очень длинное имя объекта','DsTable: фокус раскрывает обрезанное значение');
  act(()=>button.focus());
  fire(w,'resize');
  ok(d.querySelector('[role="tooltip"]')?.textContent==='Очень длинное имя объекта','DsTable: подсказка сфокусированного текста сохраняется при изменении размера');
  const dismissed=key(button,'keydown','Escape');
  ok(dismissed.defaultPrevented&&!d.querySelector('[role="tooltip"]'),'DsTable: Escape потребляется только при открытой подсказке');
  ok(!key(button,'keydown','Escape').defaultPrevented,'DsTable: без подсказки Escape проходит к родительскому слою');
  act(()=>button.blur());
  fire(button,'mouseover',{relatedTarget:null},w.MouseEvent);
  await new Promise(resolve=>setTimeout(resolve,30));
  const hoverEscape=key(d,'keydown','Escape');
  ok(hoverEscape.defaultPrevented&&!d.querySelector('[role="tooltip"]'),'DsTable: Escape закрывает подсказку наведения при фокусе вне ячейки');
  click(button);ok(open.calls.length===1,'DsTable: подсказка не меняет действие строки');
}


// DsTreeRow: раскрытие только для веток, независимые действия и читаемые сокращения.
{
  const plain=render(h(NS.DsTreeRow,{title:'Пустая группа'}));
  ok(!/expand_more|chevron_right/.test(plain.textContent),'DsTreeRow: без onToggle нет ложного шеврона');
  const toggle=spy(),open=spy();
  const box=render(h(NS.DsTreeRow,{title:'Группа',active:true,onClick:open,onToggle:toggle,selected:3,total:12,unread:120,select:'checked'}));
  const main=box.querySelector('button:not([aria-expanded])'),chevron=box.querySelector('button[aria-expanded]');
  ok(main?.getAttribute('aria-current')==='true'&&box.firstElementChild.style.boxShadow.includes('ds-brand'),'DsTreeRow: открытая группа объявлена и отмечена полосой');
  const count=box.querySelector('[data-ds-tree-count]'),badge=box.querySelector('[data-ds-tree-unread]');
  ok(count?.getAttribute('aria-label')==='Выбрано 3 из 12'&&badge?.getAttribute('aria-label')==='120 непрочитанных','DsTreeRow: полное озвучивание обоих счётчиков');
  const single=render(h(NS.DsTreeRow,{title:'Группа',onToggle:toggle}));
  const slot=single.querySelector('[data-ds-tree-chevron]');
  ok(chevron?.style.width===slot?.style.width&&chevron?.style.width==='var(--ds-control-h-sm)','DsTreeRow: постоянная ширина области шеврона');
  const idle=render(h(NS.DsTreeRow,{title:'Группа',onClick:open,select:'unchecked'}));
  fire(idle.querySelector('label'),'pointerover',{pointerType:'mouse'});
  ok(idle.firstElementChild.style.background==='transparent','DsTreeRow: чекбокс не подсвечивает всю строку');
  const idleMain=idle.querySelector('button');
  fire(idleMain,'pointerover',{pointerType:'mouse'});
  await new Promise(resolve=>w.setTimeout(resolve,0));
  ok(idleMain.style.background==='var(--ds-surface-hover)','DsTreeRow: hover основной области');
  key(idleMain,'keydown',' ');
  ok(idleMain.style.background==='var(--ds-surface-active)','DsTreeRow: нажатие основной области');
  key(idleMain,'keyup',' ');
  const clipped=render(h(NS.DsTreeRow,{title:'Длинное название группы',onClick:open}));
  const title=clipped.querySelector('[data-ds-tree-title]');
  if(title){Object.defineProperty(title,'scrollWidth',{value:200});Object.defineProperty(title,'clientWidth',{value:80});}
  act(()=>clipped.querySelector('button').focus());
  const tip=d.querySelector('[role="tooltip"]');
  ok(tip?.textContent==='Длинное название группы','DsTreeRow: обрезанное название доступно по фокусу');
  ok(tip?.id===clipped.querySelector('button').getAttribute('aria-describedby'),'DsTreeRow: подсказка связана с основной областью');
  const escape=key(clipped.querySelector('button'),'keydown','Escape');
  ok(escape.defaultPrevented&&!d.querySelector('[role="tooltip"]'),'DsTreeRow: Escape закрывает подсказку и защищает внешний слой');
  ok(!key(clipped.querySelector('button'),'keydown','Escape').defaultPrevented,'DsTreeRow: без подсказки Escape проходит дальше');
  const en=render(h(NS.DsStringsProvider,{strings:NS.dsStringsEn},h(NS.DsTreeRow,{title:'Group',selected:1,total:2})));
  ok(en.querySelector('[data-ds-tree-count]')?.getAttribute('aria-label')==='Selected 1 of 2','DsTreeRow: счётчик локализован');
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }
console.log('все проверки прошли');
