import {loadRuntime} from './helpers/runtime.js';
/* Запуск: node tests/nav-dialog-i18n.test.js [путь к bundle.js]
   Нужен jsdom (npm i -D jsdom). №7 — вкладки и меню, Escape по слоям, №9 — имя
   диалога, строки интерфейса (DsStringsProvider). Проверяется собранный бандл. */
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
const act = (fn) => ReactDOM.flushSync(fn);
const mount = (el) => { const box = d.createElement('div'); d.body.appendChild(box); const root = ReactDOM.createRoot(box);
  act(() => root.render(el)); return { box, root, rerender: (x) => act(() => root.render(x)), unmount: () => act(() => root.unmount()) }; };
const key = (el, k, extra = {}) => { const e = new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra }); act(() => el.dispatchEvent(e)); return e; };
const click = (el) => act(() => el.click());

// Banner: announcement urgency is explicit and independent of visual tone.
{
  let closed=0;
  const props={tone:'danger',title:'Данные недоступны',children:'Попробуйте позднее.',onClose:()=>closed++,closeLabel:'Скрыть сообщение об ошибке'};
  const view=mount(h(NS.DsBanner,props));
  ok(!view.box.querySelector('[role="alert"],[role="status"],[aria-live]'),'DsBanner: статичная ошибка не объявляется автоматически');
  ok(view.box.querySelector('h2')?.textContent==='Данные недоступны','DsBanner: заголовок по умолчанию h2');
  const close=view.box.querySelector('button');
  ok(close?.querySelector('[data-ds-icon-button-label]')?.textContent===props.closeLabel,'DsBanner: системная кнопка закрытия с контекстной подписью');
  click(close);ok(closed===1,'DsBanner: закрытие сообщает родителю');
  view.rerender(h(NS.DsBanner,{...props,announcement:'polite',headingLevel:'h4'}));
  ok(view.box.querySelector('[role="status"][aria-atomic="true"]')&&view.box.querySelector('h4'),'DsBanner: polite и уровень заголовка независимы от danger');
  view.rerender(h(NS.DsBanner,{...props,tone:'info',announcement:'assertive',headingLevel:'none'}));
  ok(view.box.querySelector('[role="alert"][aria-atomic="true"]')&&!view.box.querySelector('h1,h2,h3,h4,h5,h6'),'DsBanner: assertive и обычная подпись независимы от info');
  view.rerender(h(NS.DsStringsProvider,{strings:NS.dsStringsEn},h(NS.DsBanner,{title:'Notice',onClose:()=>{}})));
  ok(view.box.querySelector('[data-ds-icon-button-label]')?.textContent==='Close','DsBanner: стандартная подпись закрытия локализована');
  view.rerender(h(NS.DsBanner,{title:'Сообщение'}));ok(!view.box.querySelector('button'),'DsBanner: без onClose нет кнопки');view.unmount();
}

// Stepper: completion must not make a locked step clickable or hide the current number.
{
  const steps=[{label:'Файл',disabled:true},{label:'Поля'},{label:'Проверка'}],seen=[];
  const props={steps,active:1,completed:[0,1],onSelect:i=>seen.push(i),ariaLabel:'Импорт объектов'};
  const {box,rerender,unmount}=mount(h(NS.DsStepper,props));
  ok(box.querySelector('ol').getAttribute('aria-label')==='Импорт объектов','DsStepper: имя последовательности');
  const buttons=box.querySelectorAll('button');
  click(buttons[0]);ok(buttons[0].disabled&&seen.length===0,'DsStepper: завершённый disabled шаг не вызывает выбор');
  click(buttons[1]);ok(seen.join()==='1','DsStepper: доступный текущий шаг вызывает выбор');
  ok(buttons[1].querySelector('[aria-hidden="true"]')?.textContent==='2','DsStepper: текущий шаг сохраняет номер при completed');
  ok(box.textContent.includes('Шаг 2 из 3')&&box.textContent.includes('текущий')&&box.textContent.includes('завершён')&&box.textContent.includes('недоступен'),'DsStepper: текстовые статусы шагов');
  rerender(h(NS.DsStepper,{...props,isComplete:true}));
  ok(!box.querySelector('[aria-current]')&&box.querySelectorAll('.material-symbols-outlined').length===3,'DsStepper: вся задача завершена без текущего шага');
  rerender(h(NS.DsStepper,{steps,active:1}));
  ok(!box.querySelector('button')&&box.querySelector('[aria-current="step"]'),'DsStepper: режим чтения без недоступных кнопок');
  rerender(h(NS.DsStringsProvider,{strings:NS.dsStringsEn},h(NS.DsStepper,{steps,active:1})));
  ok(box.querySelector('ol').getAttribute('aria-label')==='Task steps'&&box.textContent.includes('Step 2 of 3')&&box.textContent.includes('current'),'DsStepper: статусы используют общий словарь');
  unmount();
}

// Tabs: visited panels preserve local state, explicit unmount opts into reset.
{
  let mounts=0;
  function Form(){React.useEffect(()=>{mounts++;},[]);return h('input',{'aria-label':'Название',defaultValue:'Исходное'});}
  const panel=active=>h(NS.DsTabPanel,{idBase:'preserve',id:'form',active},h(Form));
  const view=mount(panel(false));
  ok(!view.box.querySelector('input'),'DsTabPanel: неоткрытая панель не монтирует форму');
  view.rerender(panel(true));const input=view.box.querySelector('input');input.value='Черновик';
  view.rerender(panel(false));
  ok(view.box.querySelector('input')===input&&view.box.querySelector('[role="tabpanel"]').hidden,'DsTabPanel: посещённая панель сохраняет скрытое содержимое');
  view.rerender(panel(true));
  ok(view.box.querySelector('input').value==='Черновик'&&mounts===1,'DsTabPanel: ввод сохраняется после возврата');
  view.rerender(h(NS.DsTabPanel,{idBase:'preserve',id:'form',active:false,unmountOnHide:true},h(Form)));
  ok(!view.box.querySelector('input'),'DsTabPanel: unmountOnHide сбрасывает содержимое');view.unmount();
  const items=[{id:'a',label:'Первый',badge:0},{id:'b',label:'Второй',badge:12}];
  const tabs=mount(h(NS.DsTabs,{idBase:'fallback',items,active:'removed'}));
  ok([...tabs.box.querySelectorAll('[role="tab"]')].map(t=>t.tabIndex).join()==='0,-1','DsTabs: неизвестный active оставляет вход через Tab');
  ok(!tabs.box.querySelector('[aria-selected="true"]'),'DsTabs: fallback не объявляет невыбранную панель выбранной');
  tabs.rerender(h(NS.DsTabs,{idBase:'fallback',tone:'segmented',items,active:'a'}));
  ok(tabs.box.querySelectorAll('[data-ds-tab-count]').length===2&&tabs.box.textContent.includes('12'),'DsTabs: segmented показывает счётчики, включая ноль');tabs.unmount();
}

// ---------------- №7 вкладки внутри страницы
{
  const items = [{ id: 'a', label: 'Датчики' }, { id: 'b', label: 'Треки' }, { id: 'c', label: 'Отчёты' }];
  let active = 'a'; const seen = [];
  const App = () => { const [v, setV] = React.useState('a'); active = v;
    return h(React.Fragment, null, h(NS.DsTabs, { items, active: v, onChange: (x) => { seen.push(x); setV(x); }, idBase: 't1', 'aria-label': 'Карточка объекта' }),
      ...items.map((it) => h(NS.DsTabPanel, { key: it.id, idBase: 't1', id: it.id, active: v === it.id }, 'панель ' + it.label))); };
  const { box } = mount(h(App));
  const tabs = () => [...box.querySelectorAll('[role="tab"]')];
  ok(box.querySelector('[role="tablist"]') && tabs().length === 3, 'DsTabs underline: tablist из трёх вкладок');
  ok(tabs().map((t) => t.tabIndex).join() === '0,-1,-1', 'DsTabs: один вход через Tab (roving tabindex)');
  tabs()[0].focus(); key(tabs()[0], 'ArrowRight');
  ok(active === 'b' && d.activeElement === tabs()[1] && tabs()[1].tabIndex === 0, 'DsTabs: → переводит фокус и выбирает следующую');
  key(tabs()[1], 'End'); ok(active === 'c' && d.activeElement === tabs()[2], 'DsTabs: End — последняя');
  key(tabs()[2], 'ArrowRight'); ok(active === 'a', 'DsTabs: → с последней — по кругу на первую');
  key(tabs()[0], 'ArrowLeft'); ok(active === 'c', 'DsTabs: ← с первой — на последнюю');
  key(tabs()[2], 'Home'); ok(active === 'a', 'DsTabs: Home — первая');
  const t = tabs()[0], panel = d.getElementById(t.getAttribute('aria-controls'));
  ok(panel && panel.getAttribute('role') === 'tabpanel' && panel.getAttribute('aria-labelledby') === t.id && !panel.hidden,
    'DsTabs + DsTabPanel: вкладка связана с панелью в обе стороны');
  ok(d.getElementById('t1-panel-b').hidden, 'DsTabPanel: панель невыбранной вкладки скрыта');
  const noBase = mount(h(NS.DsTabs, { items, active: 'a', onChange: () => {} })).box;
  ok(!noBase.querySelector('[aria-controls]'), 'DsTabs без idBase не ссылается на несуществующие панели');
}
// ---------------- №7 навигация в шапке
{
  const { box } = mount(h(NS.DsAppHeader, { product: 'Aurora' },
    h(NS.DsTabs, { tone: 'onHeader', active: 'mon', onChange: () => {}, items: [{ id: 'mon', label: 'Мониторинг', icon: 'map' }, { id: 'rep', label: 'Отчёты', icon: 'assessment' }] })));
  ok(!box.querySelector('[role="tab"],[role="tablist"]'), 'шапка: разделы — навигация, не вкладки');
  ok(box.querySelectorAll('nav').length === 1 && box.querySelector('nav nav') === null && box.querySelector('nav').getAttribute('aria-label') === 'Разделы',
    'шапка: один ориентир <nav> с именем, без вложенного nav');
  const btns = [...box.querySelectorAll('nav button')];
  ok(btns[0].getAttribute('aria-current') === 'page' && !btns[1].hasAttribute('aria-current'), 'шапка: активный раздел — aria-current="page"');
  const solo = mount(h(NS.DsTabs, { tone: 'onHeader', active: 'x', items: [{ id: 'x', label: 'X' }] })).box;
  ok(solo.querySelector('nav[aria-label="Разделы"]'), 'DsTabs onHeader вне шапки ставит свой <nav>');
}
// ---------------- №7 меню: фокус и клавиатура
const items = [{ id: 'a', label: 'Профиль' }, { id: 'b', label: 'Настройки' }, { id: 'c', label: 'Выйти' }];
{
  const picked = [];
  const { box } = mount(h(NS.DsMenu, { trigger: h(NS.DsButton, null, 'Меню'), items, onSelect: (it) => picked.push(it.id) }));
  const trig = box.querySelector('button[aria-haspopup="menu"]');
  trig.focus(); click(trig);
  const mi = () => [...box.querySelectorAll('[role="menuitem"]')];
  ok(trig.getAttribute('aria-expanded') === 'true' && d.activeElement === mi()[0], 'меню: открытие переводит фокус на первый пункт');
  ok(trig.getAttribute('aria-controls') === box.querySelector('[role="menu"]').id, 'меню: триггер ссылается на меню (aria-controls)');
  key(mi()[0], 'ArrowDown'); ok(d.activeElement === mi()[1], 'меню: ↓ — следующий пункт');
  key(mi()[1], 'ArrowUp'); key(mi()[0], 'ArrowUp'); ok(d.activeElement === mi()[2], 'меню: ↑ с первого — на последний');
  key(mi()[2], 'Home'); ok(d.activeElement === mi()[0], 'меню: Home — первый');
  key(mi()[0], 'Escape'); ok(!box.querySelector('[role="menu"]') && d.activeElement === trig, 'меню: Escape закрывает и возвращает фокус на триггер');
  key(trig, 'ArrowUp'); ok(d.activeElement === mi()[2], 'меню: ↑ на триггере открывает с последним пунктом');
  click(mi()[1]); ok(picked[0] === 'b' && !box.querySelector('[role="menu"]') && d.activeElement === trig, 'меню: выбор пункта закрывает и возвращает фокус');
  key(trig, 'ArrowDown'); key(mi()[0], 'Tab'); ok(!box.querySelector('[role="menu"]'), 'меню: Tab закрывает меню');
}
// ---------------- Меню: семантика выбора, имя и поиск по подписи
{
  const picked=[];
  const App=()=>{const [checked,setChecked]=React.useState(false);return h(NS.DsMenu,{
    trigger:h(NS.DsButton,{id:'menu-selection-trigger'},'Вид'),
    items:[{id:'map',label:'Карта',icon:'map',type:'radio',checked:true},
      {id:'tracks',label:'Треки',type:'checkbox',checked},
      {id:'disabled',label:'Точки',disabled:true},{id:'table',label:'Таблица'}],
    onSelect:it=>{picked.push(it.id);if(it.id==='tracks')setChecked(v=>!v);}});};
  const {box,unmount}=mount(h(App));const trigger=box.querySelector('button');click(trigger);
  const menu=()=>box.querySelector('[role="menu"]');
  ok(menu().getAttribute('aria-labelledby')===trigger.id,'меню: доступное имя связано с триггером');
  const radio=box.querySelector('[role="menuitemradio"]');
  ok(radio?.getAttribute('aria-checked')==='true','меню: radio объявляет выбранное значение');
  const checkbox=()=>box.querySelector('[role="menuitemcheckbox"]');
  ok(checkbox()?.getAttribute('aria-checked')==='false','меню: checkbox объявляет невыбранное значение');
  key(d.activeElement,'т');
  ok(d.activeElement===checkbox(),'меню: поиск по букве включает варианты выбора');
  key(d.activeElement,'а');
  ok(d.activeElement.textContent==='Таблица','меню: поиск по нескольким буквам пропускает disabled');
  checkbox().focus();click(checkbox());
  ok(menu()&&checkbox()?.getAttribute('aria-checked')==='true'&&d.activeElement===checkbox(),'меню: checkbox меняет значение без закрытия и потери фокуса');
  ok(box.querySelectorAll('[data-ds-menu-icon-slot]').length===4,'меню: иконки имеют единую колонку');
  if(radio)click(radio);
  ok(!menu()&&d.activeElement===trigger&&picked.join() ==='tracks,map','меню: radio закрывает меню и возвращает фокус');
  unmount();
  const named=mount(h(NS.DsMenu,{menuLabel:'Фильтры объектов',trigger:h(NS.DsButton,null,'Фильтры'),items:[{label:'Активные',type:'checkbox',closeOnSelect:true}]}));
  click(named.box.querySelector('button'));
  ok(named.box.querySelector('[role="menu"]')?.getAttribute('aria-label')==='Фильтры объектов','меню: отдельное доступное имя');
  click(named.box.querySelector('[role="menuitemcheckbox"]')||named.box.querySelector('[role="menuitem"]'));
  ok(!named.box.querySelector('[role="menu"]'),'меню: closeOnSelect переопределяет поведение checkbox');named.unmount();
}
// ---------------- Меню пользователя — единственный публичный контрол профиля
{
  ok(!('DsHeaderChip' in NS), 'DsHeaderChip удалён из публичного API без алиаса');
  const picked=[];
  const {box,unmount}=mount(h(NS.DsAppHeader,{actions:h(NS.DsUserMenu,{
    name:'Анна Иванова',email:'anna@example.com',avatarSrc:'avatar.png',items,onSelect:item=>picked.push(item.id)
  })}));
  const trigger=box.querySelector('button[aria-haspopup="menu"]');
  ok(trigger&&trigger.textContent.includes('Анна Иванова')&&trigger.querySelector('img[alt=""]'), 'DsUserMenu: имя и декоративный аватар в кнопке шапки');
  trigger.focus();key(trigger,'ArrowDown');
  const entries=box.querySelectorAll('[role="menuitem"]');
  ok(d.activeElement===entries[0]&&box.textContent.includes('anna@example.com'), 'DsUserMenu: клавиатура открывает меню и переводит фокус');
  click(entries[1]);
  ok(picked[0]==='b'&&!box.querySelector('[role="menu"]')&&d.activeElement===trigger, 'DsUserMenu: выбор вызывает onSelect и возвращает фокус');
  unmount();
}
// ---------------- Escape по слоям + №9
{
  let closed = 0;
  const app = (open = true) => h(NS.DsDialog, { open, title: 'Назначить водителя', description: 'Водитель получит уведомление.', onClose: () => closed++ },
    h(NS.DsMenu, { trigger: h(NS.DsButton, null, 'Водитель'), items }));
  const { box, unmount } = mount(app());
  const dlg = d.querySelector('[role="dialog"]');
  const title = d.getElementById(dlg.getAttribute('aria-labelledby'));
  ok(title && title.textContent === 'Назначить водителя' && !dlg.hasAttribute('aria-label'), '№9: строковый заголовок — имя через aria-labelledby');
  ok(d.getElementById(dlg.getAttribute('aria-describedby'))?.textContent === 'Водитель получит уведомление.', '№9: описание — aria-describedby');
  const trig = box.querySelector('button[aria-haspopup="menu"]'); click(trig);
  key(d.activeElement, 'Escape');
  ok(!box.querySelector('[role="menu"]') && closed === 0, 'Escape: закрыто только меню, диалог остался');
  key(trig, 'Escape'); ok(closed === 1, 'Escape: второй Escape закрывает диалог');
  unmount();
}
{
  const { unmount } = mount(h(NS.DsDialog, { title: h('span', null, 'Объект ', h('b', null, 'Volvo')), onClose: () => {} }, 'x'));
  const dlg = d.querySelector('[role="dialog"]');
  ok(d.getElementById(dlg.getAttribute('aria-labelledby'))?.textContent === 'Объект Volvo', '№9: JSX-заголовок тоже даёт непустое имя');
  unmount();
  const errs = []; const ce = w.console.error; w.console.error = (m) => errs.push(String(m));
  const a = mount(h(NS.DsDialog, { 'aria-label': 'Импорт', onClose: () => {} }, 'x'));
  ok(d.querySelector('[role="dialog"]').getAttribute('aria-label') === 'Импорт' && !errs.length, '№9: без заголовка — aria-label');
  a.unmount();
  const b = mount(h(NS.DsDialog, { onClose: () => {} }, 'x')); b.unmount();
  w.console.error = ce;
  ok(errs.some((e) => e.includes('aria-label')), '№9: без заголовка и aria-label — ошибка в консоли');
  let closed = 0; const c = mount(h(NS.DsDialog, { title: 'Отправка команды', dismissable: false, onClose: () => closed++ }, 'x'));
  key(d.querySelector('[role="dialog"]'), 'Escape'); ok(closed === 0, 'Escape: dismissable=false — диалог не закрывается');
  c.unmount();
  const fm = mount(h(NS.DsFilterMenu, { label: 'Скорость', type: 'number', value: 0 }));
  const fb = fm.box.querySelector('button'); fb.focus(); click(fb);
  ok(d.activeElement === fm.box.querySelector('input'), 'DsFilterMenu: открытие переводит фокус в поле');
  key(d.activeElement, 'Escape'); ok(!fm.box.querySelector('[role="dialog"]') && d.activeElement === fb, 'DsFilterMenu: Escape закрывает и возвращает фокус');
}
// Подсказка строки поглощает только первый Escape, сохраняя внешний диалог.
for(const trigger of ['title','action']){
  let closed=0;
  const fixture=mount(h(NS.DsDialog,{title:'Объект',onClose:()=>closed++},
    h(NS.DsListRow,{title:'Полное название объекта',onClick:()=>{},
      actions:h(NS.DsIconButton,{icon:'info',label:'Сведения об объекте'})})));
  const row=d.querySelector('[role="dialog"] [data-ds-list-row]');
  const title=row.querySelector('[data-ds-list-title]');
  Object.defineProperty(title,'scrollWidth',{value:200});Object.defineProperty(title,'clientWidth',{value:100});
  const control=trigger==='title'?row.querySelector('button'):row.querySelector('[data-ds-list-actions] button');
  act(()=>control.focus());
  ok(d.querySelectorAll('[role="tooltip"]').length===1,`DsListRow ${trigger}: одна подсказка открыта в диалоге`);
  const first=key(control,'Escape');
  ok(first.defaultPrevented&&!d.querySelector('[role="tooltip"]')&&closed===0,`DsListRow ${trigger}: первый Escape закрывает только подсказку`);
  key(control,'Escape');
  ok(closed===1,`DsListRow ${trigger}: без подсказки Escape закрывает диалог`);
  fixture.unmount();
}
// Подсказка дерева закрывается раньше внешнего диалога, включая hover без фокуса строки.
for(const trigger of ['focus','hover']){
  let closed=0;
  const fixture=mount(h(NS.DsDialog,{title:'Группы',onClose:()=>closed++},
    h(NS.DsTreeRow,{title:'Длинное название группы',onClick:()=>{}}),
    h('button',{'data-other-action':''},'Другое действие')));
  const row=d.querySelector('[role="dialog"] [data-ds-tree-row]');
  const title=row.querySelector('[data-ds-tree-title]');
  Object.defineProperty(title,'scrollWidth',{value:200});Object.defineProperty(title,'clientWidth',{value:100});
  const control=row.querySelector('button');
  if(trigger==='focus')act(()=>control.focus());
  else{
    act(()=>d.querySelector('[data-other-action]').focus());
    act(()=>control.dispatchEvent(new w.MouseEvent('mouseover',{bubbles:true})));
    await new Promise(resolve=>w.setTimeout(resolve,0));
  }
  ok(!!d.querySelector('[role="tooltip"]'),`DsTreeRow ${trigger}: подсказка открыта в диалоге`);
  const first=key(d.activeElement,'Escape');
  ok(first.defaultPrevented&&!d.querySelector('[role="tooltip"]')&&closed===0,`DsTreeRow ${trigger}: первый Escape сохраняет диалог`);
  key(d.activeElement,'Escape');
  ok(closed===1,`DsTreeRow ${trigger}: второй Escape закрывает диалог`);
  fixture.unmount();
}
// ---------------- строки интерфейса
{
  const ru = mount(h(NS.DsToast, { action: () => {} }, 'x')).box;
  ok([...ru.querySelectorAll('button')].some((b) => b.textContent === 'Отменить'), 'строки: по умолчанию русские');
  const en = mount(h(NS.DsStringsProvider, { strings: NS.dsStringsEn },
    h(NS.DsToast, { action: () => {} }, 'x'), h(NS.DsTable, { columns: [{ key: 'n', label: 'N' }], rows: [] }),
    h(NS.DsStateIcon, { state: 'alarm' }))).box;
  ok([...en.querySelectorAll('button')].some((b) => b.textContent === 'Undo'), 'строки: dsStringsEn — «Undo» в тосте');
  ok(en.textContent.includes('No data'), 'строки: dsStringsEn — «No data» в пустой таблице');
  ok(en.querySelector('[role="img"]').getAttribute('aria-label') === 'Alarm', 'строки: dsStringsEn — состояние объекта «Alarm»');
  const part = mount(h(NS.DsStringsProvider, { strings: { undo: 'Вернуть', state: { alarm: 'Авария' } } },
    h(NS.DsToast, { action: () => {} }, 'x'), h(NS.DsStateIcon, { state: 'alarm' }), h(NS.DsStateIcon, { state: 'offline' }))).box;
  const labels = [...part.querySelectorAll('[role="img"]')].map((x) => x.getAttribute('aria-label'));
  ok([...part.querySelectorAll('button')].some((b) => b.textContent === 'Вернуть') && labels[0] === 'Авария' && labels[1] === 'Нет связи',
    'строки: частичный словарь накладывается на русский (вложенные ключи тоже)');
  const prop = mount(h(NS.DsStringsProvider, { strings: NS.dsStringsEn }, h(NS.DsToast, { action: () => {}, actionLabel: 'Отменить перенос' }, 'x'))).box;
  ok([...prop.querySelectorAll('button')].some((b) => b.textContent === 'Отменить перенос'), 'строки: явный проп побеждает словарь');
  ok(NS.dsStringsRu.objects(1) === '1 объект' && NS.dsStringsRu.objects(3) === '3 объекта' && NS.dsStringsRu.objects(11) === '11 объектов',
    'строки: русское склонение числительных');
  const keysRu = JSON.stringify(Object.keys(NS.dsStringsRu).sort()), keysEn = JSON.stringify(Object.keys(NS.dsStringsEn).sort());
  const nested = Object.keys(NS.dsStringsRu).filter((k) => typeof NS.dsStringsRu[k] === 'object')
    .every((k) => JSON.stringify(Object.keys(NS.dsStringsRu[k]).sort()) === JSON.stringify(Object.keys(NS.dsStringsEn[k]).sort()));
  ok(keysRu === keysEn && nested, 'строки: ru и en содержат одни и те же ключи');
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }
console.log('все проверки прошли');
