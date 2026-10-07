# Unified DsCheckbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Оставить один публичный DsCheckbox для всех сценариев выбора.

**Architecture:** Настоящий input внутри label управляет семантикой и клавиатурой. Приватная функция рисует общий символ; все потребители используют state и onChange(nextState). Старые компоненты и карточки удаляются без алиасов.

**Tech Stack:** React 18, JSX, TypeScript declarations, jsdom, Playwright, Node 22 через mise.

**Spec:** `docs/superpowers/specs/2026-10-07-unified-checkbox-design.md`

## Global Constraints

- Размер символа 18 px и граница 2 px сохраняются; цвета только через существующие токены.
- Единственные состояния: unchecked, checked, indeterminate. Callback возвращает checked или unchecked.
- Radio нормализует indeterminate в unchecked. Нет props checked/indeterminate и режимов button/decorative.
- Без onChange компонент управляемый и не меняет значение при взаимодействии.
- Не подавлять всплытие событий внутри DsCheckbox; отделять выбор от действий строки.
- Не менять версию пакета, релизные ветки и не выполнять push.
- Проверить DEFAULT/light/cozy, DEFAULT/dark/compact, RED2/light/cozy, RED2/dark/compact.
- Не редактировать dist/site вручную; сохранить исторические документы.

## Review Focus

- Изменение state снаружи после клика должно синхронизировать checked и DOM indeterminate.
- Клик по подписи не должен вызывать callback дважды или открывать строку.
- Стрелки радио должны выбирать соседний вариант с общим name и сохранять независимость другой группы.
- Описание должно объявляться у правильного input, даже если рядом несколько компонентов.
- Контрол без callback должен сохранять значение после клика и не оставаться визуально выбранным.

## File Structure

- `components/src/components/forms/DsCheckbox.jsx`: единый контрол, приватный символ в этом же файле.
- `components/DsCheckbox/DsCheckbox.d.ts`: единый публичный контракт.
- `components/src/index.js`: удалить экспорты двух старых файлов.
- Удалить `components/src/components/primitives/DsCheck.jsx`, `components/src/components/forms/DsSelectBox.jsx` и каталоги карточек `components/DsCheck`, `components/DsCheckButton`, `components/DsSelectBox`.
- `components/src/components/data/{DsTable,DsObjectRow,DsTreeRow,DsSelectionBar}.jsx` и `components/src/components/forms/DsFilterMenu.jsx`: адаптация потребителей.
- `components/DsCheckbox/{preview.html,README.md}`, `tools/catalog/build.mjs`: одна карточка с описанием на странице.
- `tests/rows-buttons.test.js`, `tests/a11y-tokens.test.js`, `tests/browser/selection.spec.js`: контракты и поведение.
- `tests/catalog-search.test.js`, `tests/docs-api.test.js`, `tests/browser/catalogue.spec.js`: новый набор карточек и API.
- Остальные активные примеры в `components/`, `templates/`, документация `docs/design.md` и `CHANGELOG.md`: миграция ссылок и вызовов по результату rg.

### Task 1: Единый контрол и миграция потребителей

**Interfaces:** Produces `DsCheckbox({state,onChange,label,ariaLabel,description,radio,disabled,name,value,hit})`; consumes existing tokens and DsIcon.

- [x] Обновить тесты состояний в `tests/rows-buttons.test.js` до нового контракта и нативных селекторов. Добавить проверки отсутствия старых экспортов и внешнего обновления state:

```js
ok(!NS.DsCheck && !NS.DsCheckButton && !NS.DsSelectBox, 'only DsCheckbox is public');
for (const [state, next] of [['unchecked','checked'],['checked','unchecked'],['indeterminate','checked']]) {
  const change = spy();
  const box = render(h(NS.DsCheckbox, {state, ariaLabel:'Select objects', onChange:change}));
  click(box.querySelector('input'));
  ok(change.calls.length === 1 && change.calls[0][0] === next, `DsCheckbox ${state}: emits ${next}`);
}
```

- [x] Запустить `mise exec -- npm run build`, затем `mise exec -- node tests/rows-buttons.test.js`; убедиться, что новый контракт не проходит на старой реализации.
- [x] Перенести рисование из DsCheck в приватную функцию внутри DsCheckbox.jsx. Сохранить формулу точки, заливки, токены и hover. Input остаётся непосредственным соседом span области символа для CSS `:focus-visible+span`.
- [x] Реализовать управляемый input, уникальный description id, ariaLabel и hit. Ключевая логика:

```jsx
const mixed = !radio && state === 'indeterminate';
const checked = state === 'checked';
React.useEffect(() => {
  if (box.current) box.current.indeterminate = mixed;
}, [mixed, checked]);
// input: checked={checked}, aria-checked={mixed ? 'mixed' : undefined}
// onChange={e => onChange?.(e.target.checked ? 'checked' : 'unchecked')}
// readOnly={!onChange}; disabled={disabled}; aria-describedby={description ? descriptionId : undefined}
```

- [x] Убедиться, что mixed соответствует checked=false; radio+indeterminate не рисует символ. Без callback при необходимости восстановить DOM checked/indeterminate после нативного события, не меняя внешнего состояния.
- [x] Перевести потребителей, сохранив родительские callback-контракты и hit={24} таблицы:

```jsx
<DsCheckbox state={select} ariaLabel={S.selectItem(name)} onChange={onSelectChange}/>
<DsCheckbox state={headState} hit={24} ariaLabel={S.table.selectPage}
  disabled={!rows.length} onChange={toggleVisible}/>
<DsCheckbox state={state} ariaLabel={S.selectAllObjects}
  onChange={next => onSelectAll && onSelectAll(next === 'checked')}/>
<DsCheckbox state={arr.includes(v) ? 'checked' : 'unchecked'} label={l}
  onChange={next => set(next === 'checked' ? [...arr,v] : arr.filter(x => x !== v))}/>
```

- [x] Удалить старые source-файлы и экспорты; переписать все активные JSX/HTML-вызовы. В тестах заменить role-атрибутные селекторы кнопок на `input[type="checkbox"]`, проверить состояние через checked/indeterminate. Сохранить проверки открытия и раскрытия строк отдельно от выбора.
- [x] Перевести a11y-tokens.test.js на наблюдение приватного символа через отрисованный DsCheckbox и pointer hover. Не экспортировать приватную функцию ради теста.
- [x] Добавить jsdom-проверки: disabled без callback, клик по label ровно один callback, отсутствие callback не меняет значение, description ids уникальны, radio+indeterminate unchecked; внешний rerender mixed→checked→unchecked обновляет обе DOM-свойства.
- [x] Запустить `mise exec -- npm test`; исправить регрессии нового API.
- [x] Сохранить согласованный набор изменений коммитом `Unify selection controls under DsCheckbox` после проверок.

### Task 2: Одна карточка и актуальная документация

**Interfaces:** Consumes DsCheckbox API из Task 1; produces одну карточку DsCheckbox с интерактивными состояниями и inline description.

- [x] Обновить docs-api/catalog-search проверки: DsCheckbox найден по checkbox/выбор/радио, старых карточек и публичных деклараций нет. В catalogue.spec.js проверять API-страницу DsCheckbox и её declarationPath `components/DsCheckbox/DsCheckbox.d.ts`.
- [x] Запустить `mise exec -- node tests/docs-api.test.js` и `mise exec -- node tests/catalog-search.test.js`; проверить ожидаемый провал до удаления карточек.
- [x] Удалить три старых каталога карточек. Перенести таблицу токенов и матрицу из DsCheck в DsCheckbox. Для hover-колонки использовать реальные контролы с указанием наведения пользователю; не добавлять публичный hover prop. Показать все disabled состояния, подпись/описание, радио и интерактивный mixed без подписи с ariaLabel. Группы радио в матрице имеют независимые name.
- [x] В `tools/catalog/build.mjs` заменить исключение inline description с DsCheck на DsCheckbox. Обновить subtitle и aliases карточки под единый компонент, высоту под фактический контент.
- [x] Обновить README и docs/design.md: новое API, правила радио и переходов, ariaLabel без подписи, native Space/стрелки, hit. Добавить Unreleased breaking запись об удалении трёх экспортов и изменении DsCheckbox callback/props/Enter.
- [x] Найти оставшиеся старые имена командой `rg -n 'DsCheckButton|DsSelectBox|\bDsCheck\b' components templates tools tests docs`. В активном коде/документации удалить ссылки; историю и проверки отсутствия экспортов сохранить.
- [x] Запустить `mise exec -- npm run build:catalog`, `mise exec -- node tests/docs-api.test.js`, `mise exec -- node tests/catalog-search.test.js` и `mise exec -- npm test`.
- [x] Сохранить коммитом `Consolidate checkbox catalogue and documentation` после проверок.

### Task 3: Браузерная проверка и живой каталог

**Interfaces:** Consumes единый каталог и реальные input; produces проверку четырёх scopes и визуальные артефакты.

- [x] Перенести `tests/browser/selection.spec.js` на единственную DsCheckbox страницу. Сохранить вычисление контраста disabled символов и рамок, 2px, пять disabled вариантов и три выбранных символа.
- [x] Проверить в каждом scope mixed→checked по Space и отсутствие изменения по Enter:

```js
const mixed = page.getByRole('checkbox', {name:'Все объекты группы'});
await expect(mixed).toHaveJSProperty('indeterminate', true);
await mixed.focus();
await page.keyboard.press('Space');
await expect(mixed).toBeChecked();
await expect(mixed).toHaveJSProperty('indeterminate', false);
await page.keyboard.press('Enter');
await expect(mixed).toBeChecked();
await expect(mixed).toBeFocused();
```

- [x] Добавить браузерные проверки стрелок в radio группе, независимости другой группы, доступного description и видимого outline на соседнем span. Проверить hit=24 в DsTable, отсутствие открытия строки при выборе label/input и отсутствие submit при выборе внутри формы.
- [x] Запустить `mise exec -- npx playwright test tests/browser/selection.spec.js tests/browser/catalogue.spec.js --workers=1` и просмотреть screenshots всех четырёх scopes. При ошибках исторического baseline catalogue отделить их от регрессий и проверить актуальную сборку напрямую.
- [x] Проверить превью на ширине 390px: нет внутренней горизонтальной прокрутки, высота соответствует метаданным; описание находится на основной странице. Проверить сборку каталога и отсутствие старых карточек/API-страниц.
- [x] Выполнить финальные `mise exec -- npm test` и `git diff --check`, сохранить коммитом `Verify unified checkbox keyboard and accessibility behavior`.
- [x] Обновить живой dev-каталог на 127.0.0.1:5173; если build.mjs был загружен сервером до изменений, перезапустить npm run dev. В итоговом сообщении указать изменения API, реальные результаты проверок и ссылку на каталог. Предложить `/aurora-impl-report`.

## Результат выполнения

Реализация выполнена в feat/unified-checkbox. Исходники и карточки сохранены одним атомарным коммитом: сборка проверяет ссылки документации до создания runtime. Hover показан реальным наведением, без дублирующей колонки. Проверки: npm test, docs-api, catalog-search, 5 браузерных тестов каталога, 3 теста фокуса и 2 теста выбора прошли. Независимое ревью не выявило замечаний. Ветка оставлена для выбора способа интеграции; push не выполнялся.
