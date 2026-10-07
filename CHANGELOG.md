# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Policy: [Versions and publishing](docs/release.md#versioning).

## [Unreleased]

### Removed

- **Breaking:** удалены `DsHeaderChip`, `DsHeaderChipProps`, отдельная карточка
  и проп `DsAppHeader.user`. Используйте `DsUserMenu` в `actions` шапки.
  Алиасов и перенаправлений для `DsHeaderChip` нет; изменение требует MAJOR-релиза.

### Fixed

- Иконки статусов `DsToast` используют новые токены `ds-*-fg-on-inverse`,
  сохраняющие контраст на инверсном фоне в светлом и тёмном режимах DEFAULT и RED2.

- Браузерная проверка восстановления dev-превью ждёт полную пересборку до 15 секунд,
  как проверка dev-сервера, чтобы медленный CI не выдавал ложный сбой через 5 секунд.

### Changed

- Раздел о миграции брейкпоинтов сокращён до принятых решений и списка работ
  в приложении. Общие правила остаются в «Основах»; уточнены независимость
  плотности, ограничения ширины контента и статус миграции.

- Описание решений по миграции брейкпоинтов показано на странице карточки;
  материал занимает доступную ширину и растёт по содержимому без внутренней прокрутки.

- Карточка `DsBreakpointsDecisions` переименована в «Брейкпоинты: решения по миграции»
  в меню, обзоре и заголовках страницы.

- Раздел «Миграция» расположен сразу после «Основ» в меню и обзоре каталога;
  нумерация разделов обновлена.

- Знак бренда показан на разных фонах одновременно в светлом и тёмном режимах.

- Знак и локап объединены в карточку «Логотип бренда» с правилами применения
  на основной странице. Старые ссылки на знак открывают объединённую карточку.

- Раздел «Бренд (общее)» перенесён перед компонентами в меню и обзоре каталога:
  бренд — раздел 4, компоненты — раздел 5.

- Разделы меню каталога идут по номерам от «Начала» до «Эталонных экранов»;
  семейства компонентов расположены внутри порядка раздела «Компоненты».

- Обзор каталога отображается без рамки и внутренней прокрутки: ширина следует
  доступному месту, высота — содержимому страницы.

- Обложка Aurora перенесена в начало обзора каталога; отдельная карточка Cover
  удалена из навигации.

- Карточки «Стрелки направления», «Маркеры и значки карты» и «Трек на карте»
  перенесены из бренда в раздел «Карта». Правила применения расположены
  под примерами на основной странице, как в «Основах».

- Все 13 карточек раздела «Основы» получили названия по теме без префикса `Ds`.
  Описания и примеры подключения теперь открыты под демонстрацией на странице
  каталога; прежние адреса документации сохранены. Обновлены тексты и ссылки,
  примеры типографики, состояний и сортировки наследуют режим каталога.

- Карточка `DsDensity` переименована в «Плотность интерфейса»: реальные
  `DsPanel`, `DsField`, `DsButton` и `DsTable` сравниваются в cozy и compact
  с синхронными поиском и сортировкой. Адрес карточки сохранён.

- Страница `DsHeader` объединена с `DsAppHeader`: общая документация и два
  варианта навигации находятся в одной карточке. Старые ссылки открывают
  объединённую страницу с сохранением темы и плотности; API не изменён.

- Счётчики оповещений в `DsTabs` отображаются без обводки и внешнего ореола,
  как над иконкой в шапке, так и рядом с подписью.

- Документация объединена по задачам: краткий README ведёт к подключению,
  дизайн-правилам и разработке. Руководства находятся в `docs/`; в корне осталось
  пять MD-файлов. В npm-пакете инструкции подключения, Angular, линтера и миграции
  теперь доступны как `docs/usage.md` и `docs/migration.md`.

- Каталог группирует семейства, ищет по именам, aliases, описаниям и props;
  сохраняет выбранные скоупы в URL и сравнивает четыре режима без изменения
  ширины примеров и их локальных тем. API выводится из исходников и `.d.ts`,
  справочник токенов — из общей модели. Ссылки документации проверяются при `verify`.
  Старые manifest/API и workflow синхронизации артефакта удалены; обоснования
  решений сохранены в карточках и истории Git.
  Доступность оболочки, клавиатура, отсутствие новых AXE-нарушений в шести
  примерах, автономная работа всех страниц и восстановление dev после ошибок
  проверяются автоматически. Известные нарушения исходных примеров выделяются
  отдельно и не скрываются отключением правил.

- Angular поставляется скомпилированными входами `/angular` и `/angular/echarts`.
  Базовое подключение обходится без ECharts и алиаса TypeScript; провайдер выставляет
  скоупы при bootstrap. Старые пути адаптеров, сервис, InjectionToken и SCSS сохранены.
  Три независимых приложения проверяют production AOT и поведение установленного tarball.
  Инструкция подключения сведена в [docs/usage.md](docs/usage.md).

- Токены и стили генерируются из одной модели в репозитории, React-превью и UI-тесты
  собираются из актуальных исходников. `npm run dev` запускает локальный каталог
  всех 69 страниц без CDN; `npm run verify` проверяет совместимость с исходной версией.
  Публичные входы, CSS-переменные, пути и версия пакета сохранены.

- Разработка дизайн-системы перенесена в репозиторий: общие инструкции в `AGENTS.md`,
  проверка релизных команд работает на Node без зависимости от bash. Codex-хук
  требует подтверждения доверия через `/hooks`; прежняя защита пока сохранена.

## [3.0.0] — 2026-09-30

### Changed — BREAKING

- Пакет переехал в организацию PrimaSoftLLC и называется `@primasoftllc/design-system` (репозиторий
  `PrimaSoftLLC/aurora-web-design-system`). В приложении: `.npmrc` — `@primasoftllc:registry=https://npm.pkg.github.com`,
  `scope: '@primasoftllc'` у `actions/setup-node`, зависимость и все пути `@nikolaynn/design-system…` →
  `@primasoftllc/design-system…` (стили в `angular.json`, алиас Angular-слоя в `tsconfig.json`, `extends` в
  `.stylelintrc.json`, `echarts-theme`). Доступ CI приложения на чтение выдаётся в настройках нового пакета
  (PUBLISHING.md). API не изменился. `@nikolaynn/design-system@2.0.0` остаётся в реестре, новых версий под
  старым именем не будет.

## [2.0.0] — 2026-09-23

### Changed — BREAKING

- Пакет называется `@nikolaynn/design-system` и ставится из GitHub Packages
  (`@nikolaynn:registry=https://npm.pkg.github.com`). `styles.css` и `tokens.css` — собранные файлы из `dist/`
  (`@nikolaynn/design-system/styles.css`, `…/tokens.css`), а не `components/bundle.css` и корневой `tokens.css`.
  Angular-слой подключается алиасом `@nikolaynn/design-system/angular` в `tsconfig.json` (templates/angular/README.md).
- `react`, `react-dom` — необязательные peer-зависимости: приложению на Angular они не нужны.
- `DsTable`: `onToggleAll` устарел — `onToggleVisible(visibleIds, next)`.
  Старый проп работает (получает `next`) и пишет одно предупреждение в консоль.
- `DsIconButton`: `aria-pressed` ставится, только если `active` задан (true или
  false) — это кнопка-переключатель. Обычная кнопка больше не объявляет себя
  переключателем.
- Разметка строк: основная зона `DsObjectRow` / `DsTreeRow` / `DsListRow` —
  `<button>` внутри контейнера-`div`, а не `div role="button"` целиком. Стили,
  нацеленные на корень строки как на кнопку, нужно перенести.

- Префикс системы `v2` заменён на `ds`. В новом проекте `v2` читался как номер
  версии самой системы, которым он не является; `ds` однозначно помечает токен и
  компонент дизайн-системы. Переименовано одним заходом, без слоя алиасов:
  система ещё не подключена ни в одном приложении, поэтому ломать нечего.
  - токены: `--v2-*` → `--ds-*` (231 имя), семейства → `--font-ds-*`;
  - скоупы: `data-v2-theme` / `-appearance` / `-density` → `data-ds-*`;
  - компоненты: `V2Button` → `DsButton` и так далее, включая имена папок и `.d.ts`;
  - типы Angular-слоя `V2Theme` / `V2Appearance` / `V2Density` → `Ds*`,
    ключи `localStorage` → `ds-appearance` / `ds-density`;
  - анимации `v2-spin` / `v2-pulse` → `ds-spin` / `ds-pulse`;
  - экспорт ECharts `v2EChartsTheme` → `dsEChartsTheme`.
- `--ds-focus-ring` и `--ds-focus-ring-danger` больше не содержат зашитый hex:
  цвет идёт от `--ds-focus-color` и `--ds-danger-solid`. До этого кольцо фокуса
  оставалось синим в теме RED2.

- Значения плотности `compact` (28 токенов) перенесены в `tokens.json`, тема
  `ds-density-compact`. До этого они жили только в `components/bundle.css`, и
  правка размера в редакторе токенов меняла cozy, но не compact.
- Приложения подключают `dist/styles.css`, собранный в репозитории из
  `tokens.css` (`ANGULAR.md`). Темы, светлость и плотность в нём адресуются
  атрибутами `data-ds-*` и работают при любой вложенности скоупов.
- `dist/tokens.css` несёт только цвет/бренд и корневые токены (без плотности, без
  `--ds-type-*`); приложения по-прежнему подключают `dist/styles.css`.
- `DsFilterMenu`: значение числового фильтра — число, а не строка. `number` отдаёт
  `number | null`, `number-range` — `{from, to}` из `number | null`, `date` и
  `date-range` — `'YYYY-MM-DD' | null`; стёртое поле — `null`, а не `''`. Тип
  описан как `DsFilterValue` в `.d.ts`. Старые строковые значения на входе
  читаются по-прежнему. Потребители проверены: сравнения со строкой нет.

### Fixed

- Логотип не отображался в каталоге (`BrandLogoMark`, `BrandLogoLockup`, шапки
  `DsHeader`, `Monitoring`, `Admin`, `AppShell`), как и маркеры трека в
  `MapTrack`: превью рендерится в рамке и не загружает файлы по относительным
  путям. Картинки встроены в превью как `data:` URI; `check-delivery.js` теперь
  ловит картинку по пути в превью (`preview-fetch`).
- `DsTabs` и `DsMenu` (№7). Шапка (`tone="onHeader"`) — навигация, а не вкладки:
  кнопки с `aria-current="page"` в одном `<nav>` шапки (вложенный `nav` убран).
  Вкладки в контенте — `role="tablist"` с одним входом через Tab, ← → Home End
  переводят фокус и выбирают вкладку; связь с панелью — `idBase` + новый
  `DsTabPanel`. `DsMenu` — паттерн menu button: Enter / Space / ↓ открывают и
  ставят фокус на первый пункт, ↑ — на последний, ↑ ↓ Home End внутри, Tab
  закрывает, Escape и выбор пункта возвращают фокус на триггер.
- Escape по слоям: один общий стек (`useDsLayer`). Меню в диалоге закрывается
  само, диалог остаётся; диалог с `dismissable={false}` поглощает Escape.
  `DsFilterMenu` — поповер-диалог: фокус в первое поле, Escape возвращает фокус.
- `DsDialog` (№9): имя — видимый заголовок через `useId` + `aria-labelledby`,
  строкой или JSX; описание — `aria-describedby`; без заголовка — обязательный
  `aria-label` (иначе ошибка в консоли).
- Интерактивные строки (`DsObjectRow`, `DsTreeRow`, `DsListRow`, `DsTable`):
  основная зона, раскрытие, чекбокс и действия — соседние элементы, а не
  вложенные; обработчик клавиш на родителе убран. Раньше Space или Enter на
  чекбоксе объекта открывали объект, на чекбоксе группы — сворачивали группу,
  а `DsListRow` с `actions` давал кнопку в кнопке. Строку `DsTable` теперь можно
  открыть с клавиатуры — кнопкой в опорной колонке (`rowAction`, по умолчанию
  первая); клик мышью по строке по-прежнему открывает её, кроме кликов по
  контролам. `DsTreeRow` с `onClick` и `onToggle` получает отдельную кнопку-шеврон
  (`aria-expanded`, `expandLabel` / `collapseLabel`).
- Массовый выбор `DsTable`: состояние «выбрать все» считается по пересечению ID
  видимых и выбранных строк (`dsVisibleSelection`), а не по количеству —
  выбранные на другой странице больше не включают его на текущей. Выбор всей
  выборки — отдельное состояние: `totalCount`, `allSelected`, `onSelectAll`,
  `onClearSelection` («Выбраны все 20 на странице. Выбрать все 1 240»).
- Нажатие кнопок: `DsButton`, `DsIconButton`, `DsFab` показывают нажатие 16% от
  мыши, touch, пера, Space и Enter (раньше — только мышь у `DsButton`, у двух
  других — никогда); hover — только от мыши; отключённая кнопка не реагирует.
  Общее правило — `usePress`. Обработчики потребителя (`onKeyDown` и т. п.)
  больше не перетирают внутренние, а вызываются вместе с ними.
- Каталог: в темах `DEFAULT · тёмная` и `RED2 · тёмная` превью лежали на светлом
  бежевом столе. Каталог определяет светлость темы только по имени
  (`dark` / `night`), русское «тёмная» он не узнавал. Темы переименованы в
  `DEFAULT · light`, `RED2 · light`, `DEFAULT · dark`, `RED2 · dark` — это и
  значения `data-ds-appearance`; имя стережёт `lint/test/run.js`.
- Контраст контролов (WCAG 1.4.11): пустой чекбокс и радио (`DsCheck`) и трек
  выключенного `DsSwitch` рисуются новым `--ds-border-control` — ≥ 3:1 к
  `ds-surface`, `ds-bg`, `ds-surface-hover` и `ds-surface-selected` во всех
  четырёх наборах (было 1,52:1). `--ds-border-field` по решению владельца
  остаётся у полей и `secondary`, где есть второй признак.
- Действие в `DsToast` было нечитаемо на инверсной поверхности (1,22–1,92:1):
  теперь `--ds-fg-action-on-inverse` (≥ 7,26:1) и подчёркивание — в RED2 бренд
  почти нейтрален, цвет один действие не отличает.
- `DsObjectRow`: состояние объекта не доходило до скринридера — глиф был
  `aria-hidden`, а в имя строки попадали инициалы аватара. Имя строки — `name`,
  описание (`aria-describedby`) — состояние, свежесть, сигнал, связь, сервис,
  детали, непрочитанное. Словарь состояний один — `dsFleetState` в
  `DsStateIcon`; подписи свежести по умолчанию переведены на русский, как
  остальные подписи строки. Новый проп `stateLabel` для локализации.
- `DsFilterMenu`: `0`, отрицательные числа и диапазон от нуля отображались как
  пустое поле (подстановка через `||`). Теперь пусто — только `null` / `undefined`.
  Пустой диапазон старого вида `{from: '', to: ''}` больше не помечает фильтр
  активным.
- `lint/scripts/check-names.js`: прямой запуск не распознавался на Windows и в
  пути с пробелом или кириллицей — CLI молча завершался с кодом 0, ничего не
  проверив. Прямой запуск определяет `isDirectRun` по путям файловой системы.
- `lint/tokens.allowed.json` разошёлся с `tokens.json` (не было `--ds-map-ground`,
  `--ds-map-point`); пересобран.
- Поставка после миграции: `overview.html` ссылался на несуществующие
  `styles.css`, `_ds_bundle.js` и 38 страниц `guidelines/v2-*.html`; шесть
  preview ссылались на старые имена страниц. Ссылки ведут на
  `components/<Имя>/preview.html`, подключения — на `tokens.css`,
  `tokens/scoped.css`, `components/bundle.*`. Упоминания `v2-` в действующих
  файлах заменены.
- `docs/_ds_bundle.js` и `docs/_ds_manifest.json` со старыми именами `V2*`
  выведены из поставки. Хранилище артефакта не удаляет файлы, поэтому оба
  оставлены пустыми заглушками; их ничто не подключает.

### Added

- Строки интерфейса: `DsStringsProvider`, `useDsStrings`, `dsStringsRu`
  (по умолчанию), `dsStringsEn`. Около 90 строк из 20 компонентов вынесены в
  словарь; русское склонение числительных («1 объект», «3 объекта»).
- Токены `--ds-gap-sm-plus`, `--ds-pad-sm`, `--ds-fresh-fg` (№13). Старые
  `--ds-gap`, `--ds-pad`, `--ds-fresh-on` — алиасы до 3.0.0; правило
  `aurora/no-deprecated-token` (предупреждение). Компоненты переведены на новые имена.
- `DsTabPanel`, `dsTabIds`.
- Токены `--ds-border-control`, `--ds-border-control-hover`,
  `--ds-fg-action-on-inverse`.
- Проверка контраста токенов во всех наборах (`lint/lib/contrast.js`,
  `lint/test/run.js`) и тест `tests/a11y-tokens.test.js` на собранном бандле.
- `tokens/scoped.css` — цветовые наборы на `data-ds-theme` / `data-ds-appearance`
  для страниц вне каталога (`overview.html`, выгруженная поставка): в `tokens.css`
  артефакта наборы адресованы атрибутом рамки. Собирается
  `lint/scripts/build-scoped-tokens.js`; расхождение ловит `lint/test/run.js`.
- `lint/scripts/check-delivery.js` — проверка поставки: старые идентификаторы
  в коде и разметке и битые локальные ссылки. Исключения поимённо, с причиной.
- `tests/DsFilterMenu.test.js` — поведенческий тест на собранном бандле
  (нужен `jsdom`).

- `NAMING.md` — регламент имён токенов, с проверкой `lint/scripts/check-names.js`.
- `LINT.md` и `lint/` — правила stylelint системы.
- `ADOPTION.md` — порядок внедрения системы в проект.
- Шрифты Inter Tight и JetBrains Mono лежат в пакете (латиница и кириллица, OFL 1.1) и подключены в
  `dist/styles.css`: интерфейс не обращается к Google Fonts.

## [1.1.0] — 2026-09-17

### Added
- `templates/angular/` — the Angular consumption layer: `AuroraThemeService` (the three
  scopes on `<body>`, appearance and density persisted), `[auroraScope]` for
  per-subtree overrides, a typed ECharts bridge with a scope watcher,
  `_aurora.scss` mixins, and an `ng-package.json` for building it as a library.
- `ANGULAR.md` — installing the stylesheet in an Angular workspace.

### Changed
- `react` is now an optional peer dependency: the React components are the
  appearance specification, not shipped product code.

### Fixed
- The 15 component cards resolved `styles.css` and `_ds_bundle.js` one level above
  the repository root, so each card opened blank.

## [1.0.0] — 2026-09-17

First tagged release. Extracted from the design tool into this repository.

### Added
- `styles.css` — the single stylesheet: 12 token files plus the self-hosted
  Material Symbols face.
- Two brand themes (`DEFAULT`, `RED2`) × light/dark × cozy/compact, all driven by
  `data-ds-theme` / `data-ds-appearance` / `data-ds-density`.
- 44 React components across `primitives`, `buttons`, `forms`, `data`, `feedback`,
  `charts`, `layout`, `navigation` — each with a `.d.ts` contract.
- `components/charts/echartsTheme.js` — the token → `EChartsOption` bridge.
- Guideline cards, the two reference screens (`ui_kits/`) and the empty shell
  (`copy-a-screen/`).
- `readme.md` (the system), `MIGRATION.md` (old Angular name → system name),
  `SKILL.md`, `REVIEW.md`.

### Removed
- The v1 legacy recreation (`--color-*` tokens, `Button`/`FormField`/`Card`, the two
  portal recreations) and the three `templates/` folders — September 2026.
