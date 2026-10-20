# Angular 19 и первая кнопка — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Собирать библиотеку Angular 19.2 и поставлять DsButtonComponent для Angular 19 и 20.
**Architecture:** Существующий partial-компилятор и публичный `/angular`; отдельный consumer Angular 19 с общей демонстрацией кнопки для обеих версий.
**Tech Stack:** Angular 19.2.25, CLI 19.2.27, TypeScript 5.8.3; consumer Angular 20.3.34; Playwright.
**Spec:** [Правила UI kit](../../../ng-ui-kit/docs/development.md).

## Global Constraints

- Нативный `button[dsButton]`, OnPush, standalone, signal inputs; общий CSS токенов.
- Сохранить текущие Angular 20 сценарии, React API и совместимые импорты.
- Не публиковать и не коммитить без запроса пользователя.

## Review Focus

- Loading блокирует обработчик приложения и submit, сохраняя фокус и геометрию.
- Нативный disabled и динамические inputs работают после повторного включения.
- Длинные подписи и иконки не выходят за ширину 390 px.
- Touch не оставляет наведение; Space/Enter и отмена указателя сбрасывают нажатие.
- Одинаковые токены при смене локального скоупа, без React в Angular bundle.

## Task 1: Совместимость сборки

Files: package.json/lock, ng-ui-kit/tests/consumers/angular-19, ng-ui-kit/tools/check-angular.mjs, CI, CONTRIBUTING.md.
Interface: checkAngular возвращает angular19Url наряду с baseUrl/chartsUrl/legacyUrl.

- [x] Добавить независимый consumer 19.2.25; проверить отказ установки текущего tarball по peer range.
- [x] Перевести root compiler на 19.2.25 и TS 5.8.3, peer range расширить до ^19.2.25 || >=20.3.34.
- [x] Подготовить cache в CI; проверить build и check:angular во всех consumers.

## Task 2: Кнопка

Files: ng-ui-kit/src/components/button/button.component.ts, button.component.css, core.ts;
ng-ui-kit/tests/consumers/angular-base/src/button-demo.ts, ng-ui-kit/tools/check-angular-button.mjs.
Interface: DsButtonComponent: tone, size, icon, iconRight, disabled, loading, fullWidth, type.

- [x] Добавить общий Angular demo и браузерные проверки: импорт должен упасть до реализации.
- [x] Реализовать нативную кнопку и capture-блокировку click при loading; стили через токены.
- [x] Проверить форму, обработчик приложения, фокус, геометрию, семь тонов, три размера,
  четыре скоупа, 390/1280 px, клавиатуру, AXE и смену inputs в Angular 19 и 20.

## Task 3: Поставка и документация

Files: ng-ui-kit/docs/development.md, docs/usage.md, README.md, CHANGELOG.md, AGENTS.md.

- [x] Описать фактические версии, API и компилируемый пример; убрать будущий статус кнопки.
- [x] Выполнить npm run verify и независимое ревью изменений; исправить существенные находки.

## Выполнение

Работа продолжается в текущем checkout с подготовленными документами; перенос их в
другой worktree не требуется. Исполнение последовательное, с тестами до реализации.

- Task 1: complete. `.tmp/angular19-red.log` — ERESOLVE по Angular peer;
  `.tmp/angular19-green.log` — четыре AOT/tarball consumers и браузерные контракты прошли.
- Task 2: RED public export — `.tmp/angular-button-red.log`.
  AOT потребителя выявил несовместимый TemplateLiteral в CSS partial metadata;
  сборка esbuild сохраняет StringLiteral через supported.template-literal=false.
- Ruling: новая матрица проверяет core/button на Angular 19 и 20; существующие
  charts/legacy остаются на Angular 20. Это явно отражено в правилах UI kit.
- Task 2: complete. Angular consumer test в полном verify прошёл за 4.6 минуты:
  четыре production AOT сборки, формы/loading/keyboard/scopes/AXE в обеих версиях.
- Независимое ревью: блокирующих ошибок реализации нет; по замечаниям расширены
  тесты цветов, рамок, hover/press, disabled, reset, fieldset, внешней формы и длинной
  подписи с двумя иконками. Расширенный набор прошёл в полном verify.
- Итог проверки 2026-10-20: все этапы до browser прошли. Первый полный запуск
  завершился с exit 1: 198/202 browser tests прошли, два migration test превысили
  таймаут во время длительных пауз среды; Panel и SortingMenu получили
  ERR_NETWORK_IO_SUSPENDED. Все четыре теста повторены без изменения кода и
  таймаутов: 4/4 passed за 6.5 минуты (`.tmp/angular-ui-kit-recheck.log`, exit 0).
  Оставшиеся этапы verify выполнены отдельно: tarball consumer check — exit 0
  (`.tmp/angular-ui-kit-pack.log`), Chromium/Firefox/WebKit — 12/12 passed,
  exit 0 (`.tmp/angular-ui-kit-compat.log`). Полного единого запуска с exit 0 нет;
  проверки всех этапов выполнены, воспроизводимых падений не осталось.
