# Compatible Angular Entrypoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить готовый Angular-вход без ECharts и отдельный вход графиков, сохранив старое подключение.

**Architecture:** Одна реализация в `ng-ui-kit/src`, частичная Angular-компиляция и два ESM-выхода в `dist/angular`. Старые source-пути превращаются в re-export-адаптеры к тем же файлам, которые использует новый экспорт пакета.

**Tech Stack:** Node 22, Angular compiler/core/common 19.0.x, TypeScript 5.6.x, esbuild, Angular CLI 19.0.x для тестовых приложений, Playwright из этапа 1.

**Spec:** [Спецификация](../specs/2026-10-02-repository-first-design.md), §§6–8; [общий план](2026-10-02-repository-first.md). Требуется завершённый [этап 1](2026-10-02-repository-first-01-build.md).

## Global Constraints

- «Минимальная поддерживаемая версия Angular остаётся 19».
- «Существующий контракт возврата провайдеров сохраняется» — `provideAurora(...): Provider[]`.
- «Старый путь `components/src/templates/angular/index.ts`, используемый через `tsconfig.paths`, продолжает поставляться со старым набором экспортов, включая графики».
- «Обе формы подключения используют одну реализацию, без самостоятельных копий сервиса и идентификаторов внедрения зависимостей».
- «Публикация пакета, перенос приложений-потребителей и редизайн интерфейса не входят в реализацию».
- Сохраняются ключи `ds-appearance`/`ds-density`, приоритет persisted → config → defaults и три независимых атрибута.
- Прежние optional peerDependencies сохраняются; Angular/ECharts не устанавливаются каждому CSS-потребителю пакета.
- Все команды — через mise; версии новых devDependencies фиксируются точно в lock. Код комментариев русский, коммиты английский.
- Корневой `sideEffects:false` не добавлять: существующий ECharts global bridge зависит от выполнения side-effect-модуля.

## Review Focus

1. Старый tsconfig alias с тем же именем, что новый export, не вызывает self-import recursion — задачи 1, 3.
2. Одновременный импорт старого source path и нового core сохраняет identity класса и InjectionToken — задачи 1, 3.
3. Core должен собираться, когда ECharts не резолвится вообще, а не просто удалён из bundle — задача 3.
4. localStorage бросает, хранит неизвестную строку либо корректный dark вопреки config light — задача 2.
5. Смена scope на промежуточном предке графика обновляет option, unsubscribe прекращает реакции — задача 3.

## Карта файлов

| Файлы | Роль |
|---|---|
| `ng-ui-kit/src/{core,echarts}.ts` | Два явно разделённых entrypoint |
| `ng-ui-kit/src/{aurora-tokens,aurora-theme.service,aurora-scope.directive,aurora-echarts}.ts` | Единственные реализации, перенесённые из старого пути |
| `ng-ui-kit/tsconfig.lib.json`, `ng-ui-kit/tools/build-angular.mjs` | Partial compilation и упаковка |
| `dist/angular/{core,echarts}.mjs`, `dist/angular/{core,echarts}.d.mts`, `dist/angular/esm/` | Генерируемый JS и declarations |
| `components/src/templates/angular/*.ts` | Совместимые re-export-файлы по прежним путям |
| `ng-ui-kit/tests/consumers/angular-{base,charts,legacy}/` | Минимальные реальные приложения, package/lock и конфигурация CLI |
| `ng-ui-kit/tools/check-angular.mjs`, `ng-ui-kit/tests/browser/angular.spec.js` | Установка tarball в изолированный consumer и browser assertions |

### Task 1: Partial compilation и совместимые пути

**Files:** Create `ng-ui-kit/src/core.ts`, `ng-ui-kit/src/echarts.ts`, `ng-ui-kit/tsconfig.lib.json`, `ng-ui-kit/tools/build-angular.mjs`, `ng-ui-kit/tests/angular-package.test.js`; move четыре реализации в `ng-ui-kit/src/`; modify все пять старых `.ts`-путей, `package.json`, `package-lock.json`, `tools/build.js`, `tests/package.test.js`, `tools/check-pack.js`.

**Interfaces:** `buildAngular({root}):Promise<void>` создаёт указанные ниже exports; core экспортирует прежние types/service/directive/config, charts — `AuroraChartChrome`, `auroraChartChrome`, `auroraWatchScopes`.

- [ ] Добавить devDependencies командой `mise exec -- npm install --save-dev --save-exact @angular/core@19.0 @angular/common@19.0 @angular/compiler@19.0 @angular/compiler-cli@19.0 @angular/platform-browser@19.0 @angular/platform-browser-dynamic@19.0 typescript@5.6 rxjs@7 echarts@5.5 zone.js@0.15`; все Angular-пакеты выбрать с одинаковым patch. Не менять peer range продукта. Проверить Node/TypeScript по официальной таблице совместимости.
- [ ] Добавить RED-проверку tarball export и содержимого outputs; заменить существующий assert о том, что `./angular` отсутствует.

```js
assert.deepEqual(pkg.exports['./angular'], {
  types:'./dist/angular/core.d.mts', default:'./dist/angular/core.mjs',
});
assert.deepEqual(pkg.exports['./angular/echarts'], {
  types:'./dist/angular/echarts.d.mts', default:'./dist/angular/echarts.mjs',
});
assert.doesNotMatch(read('dist/angular/core.mjs'), /from\s*['"]echarts/);
assert.match(read('dist/angular/core.mjs'), /ɵɵngDeclareInjectable/);
```

- [ ] RED: `mise exec -- node ng-ui-kit/tests/angular-package.test.js`.
- [ ] Перенести реализации без изменения поведения. `core.ts` реэкспортирует только tokens/service/directive; `echarts.ts` — только aurora-echarts. В новом `aurora-echarts.ts` импортировать `dsEChartsTheme` из существующего публичного `/echarts-theme`, не через старый относительный путь.

```json
{
  "compilerOptions": {
    "target":"ES2022", "module":"ES2022", "moduleResolution":"bundler",
    "rootDir":"src", "outDir":"../dist/angular/esm",
    "declaration":true, "strict":true, "experimentalDecorators":true,
    "skipLibCheck":false, "lib":["ES2022","DOM"]
  },
  "angularCompilerOptions":{"compilationMode":"partial","strictTemplates":true},
  "include":["src/**/*.ts"]
}
```

- [ ] `buildAngular` вызывает локальный compiler-cli через `process.execPath`, проверяет exit status; esbuild создаёт `core.mjs` и `echarts.mjs` из скомпилированных entrypoints с `format:'esm', platform:'neutral', packages:'external'`. Angular и ECharts не встраиваются. Partial declarations не линковать при сборке библиотеки: это сделает приложение.
- [ ] Создать рядом `core.d.mts` → `export * from './esm/core.js';` и `echarts.d.mts` → `export * from './esm/echarts.js';`. Генерируемые esm-файлы и `.d.ts` входят в пакет. Проверять все относительные ссылки declarations, включая `.mjs` ECharts bridge.
- [ ] Старый индекс и старые именованные файлы должны ссылаться относительным путём на один и тот же compiled entry. Нельзя писать self-import `@primasoftllc/design-system/angular` в старом индексе: именно это имя tsconfig alias направляет обратно на него.

```ts
// components/src/templates/angular/index.ts
export * from '../../../../dist/angular/core.mjs';
export * from '../../../../dist/angular/echarts.mjs';
// aurora-theme.service.ts — перечислить только исходные exports этого файла.
export {AURORA_CONFIG, provideAurora, AuroraThemeService}
  from '../../../../dist/angular/core.mjs';
```

- [ ] Проверить TypeScript-адаптеры каждого старого файла на сохранение прежних экспортов. `ng-ui-kit/src` не попадает в npm-пакет; `dist/angular` и старые shims попадают. `templates/angular/_aurora.scss` остаётся по прежнему пути. Старый `ng-package.json` заменяется ссылкой в документации на реальную сборку, не используется молча с неверными assets.
- [ ] GREEN: `mise exec -- node ng-ui-kit/tools/build-angular.mjs`, `mise exec -- node ng-ui-kit/tests/angular-package.test.js`, `mise exec -- node tests/package.test.js`, `mise exec -- npm run check:pack`.
- [ ] Коммит: `feat: publish compatible Angular core and chart entrypoints`.

### Task 2: Инициализация через provideAurora без изменения Provider[]

**Files:** Modify `ng-ui-kit/src/aurora-theme.service.ts`; create `ng-ui-kit/tests/angular-theme.test.js`, `ng-ui-kit/tests/fixtures/angular-theme-host.ts`; modify `tools/verify.mjs` для регистрации теста.

**Interfaces:** `provideAurora(config?:Partial<AuroraScopes>):Provider[]`; сигналы, методы сервиса и localStorage-контракт прежние.

- [ ] До изменения сервиса создать Angular TestBed/fixture, которая регистрирует provider, запускает `ApplicationInitStatus.runInitializers()` и ожидает body attributes, не вызывая `inject(AuroraThemeService)` из компонента. Наборы: config RED2; persisted dark/compact; invalid persisted; storage throw; service injected дополнительно после bootstrap. Runner загружает zone.js/testing, compiler и browser-dynamic testing platform в jsdom, компилирует fixture через TypeScript/esbuild и выводит ошибки процесса; assertions — Node assert, без введения Jest/Vitest ради одной задачи.

```ts
TestBed.configureTestingModule({providers:[...provideAurora({theme:'RED2'})]});
const init = TestBed.inject(ApplicationInitStatus);
init.runInitializers();
await init.donePromise;
assert.equal(document.body.getAttribute('data-ds-theme'), 'RED2');
// До этой проверки сервис не получали вручную.
```

- [ ] RED: `mise exec -- node ng-ui-kit/tests/angular-theme.test.js` на текущем provideAurora — отсутствует атрибут.
- [ ] Сохранить `Provider[]` через supported `APP_INITIALIZER` multi-provider. `provideAppInitializer` возвращает `EnvironmentProviders`, поэтому его прямая подстановка ломает исходный тип. Использование совместимого токена локализовать в одной функции, не менять публичный контракт.

```ts
export function provideAurora(config: Partial<AuroraScopes> = {}): Provider[] {
  return [
    {provide:AURORA_CONFIG, useValue:config},
    {provide:APP_INITIALIZER, multi:true,
      deps:[AuroraThemeService], useFactory:(_service: AuroraThemeService) => () => undefined},
  ];
}
```

- [ ] В сервисе вынести существующую запись трёх атрибутов и двух storage keys в `private applyScopes():void`; вызвать синхронно в constructor и из существующего effect. Если `doc.body` отсутствует, не падать; реактивная ветка продолжает применять при доступном body. Не записывать тему в storage, не переписывать `theme-*` класс.
- [ ] Проверить, что невалидная запись падает назад на config, а валидная persisted побеждает config; повторное ручное внедрение возвращает тот же сервис. Все storage исключения перехватываются, изменения сигналов продолжают работать. В тестах освобождать TestBed/effects и восстанавливать document/localStorage.
- [ ] GREEN: `mise exec -- node ng-ui-kit/tests/angular-theme.test.js`, `mise exec -- node ng-ui-kit/tests/angular-package.test.js`; одна повторная сборка библиотеки до чтения compiled entry.
- [ ] Коммит: `fix: initialize Aurora scopes from its provider`.

### Task 3: Настоящие потребители tarball и identity контракт

**Files:** Create `ng-ui-kit/tests/consumers/angular-base/{package.json,package-lock.json,angular.json,tsconfig.json,src/main.ts,src/index.html}`, аналогичные перечисленные файлы в `angular-charts` и `angular-legacy`; create `ng-ui-kit/tools/check-angular.mjs`, `ng-ui-kit/tests/browser/angular.spec.js`; modify `.github/workflows/ci.yml`, `package.json`, `tools/verify.mjs`.

**Interfaces:** `checkAngular({root,tarball,workRoot}):Promise<{baseUrl,chartsUrl,legacyUrl,close}>`; build fixtures используются browser tests и `npm run check:angular`.

- [ ] Каждый fixture имеет собственный lock и минимальный CLI 19.0 build (`@angular-devkit/build-angular:application`, production AOT). Base lock содержит только Angular/core/common/platform-browser/compiler, RxJS, zone.js, CLI/build toolchain; ECharts есть только charts/legacy. Сам пакет системы добавляется из нового tarball после установки fixture lock, не скачивается из registry. Подготовка CI устанавливает locks до offline verify. В ходе verify никакой установки с сети.
- [ ] `checkAngular` создаёт каталоги вне дерева проекта в системном temp, копирует package/lock/source fixture, запускает `npm ci --offline`, устанавливает созданный tarball через `npm install --offline --ignore-scripts --no-audit --no-fund <tgz>`. Не использовать junction всей root node_modules: она скрыла бы отсутствие ECharts.
- [ ] Base fixture не имеет `tsconfig.paths`; импортирует core entry, `provideAurora({theme:'RED2'})`, директиву. Не внедряет сервис ради старта. DOM содержит кнопку переключения через сервис только для последующей проверки после assertions стартового состояния.

```ts
import {provideAurora, AuroraScopeDirective} from '@primasoftllc/design-system/angular';
// Standalone Root использует <section auroraScope density="compact">.
bootstrapApplication(Root, {providers:[...provideAurora({theme:'RED2'})]});
```

- [ ] Legacy fixture оставляет исходный `paths` и импортирует весь прежний набор, включая charts. Для проверки identity напрямую импортировать новый compiled файл по относительному пути из installed package; не через затенённый alias. Проверить `LegacyThemeService === NewThemeService` и `LegacyConfig === NewConfig`, а также один экземпляр из DI.
- [ ] Charts fixture использует оба новых входа; проверяет `auroraWatchScopes` при изменении theme/appearance промежуточной панели, формирует option через `auroraChartChrome`. После вызова unsubscribe следующий mutation не вызывает callback. Проверить `.read` и default export прежнего `/echarts-theme`, регистрацию global script в отдельной fixture.
- [ ] RED: `mise exec -- npm run check:angular` до правильных exports/shims должен выявить резолюцию, типы или identity, а не случайно пройти через исходники workspace.
- [ ] Browser assertions проверяют начальные атрибуты, компактность локального section, пользовательские persisted values и функции charts. Для base дополнительно:

```js
const requireFromBase = createRequire(join(baseRoot,'package.json'));
assert.throws(() => requireFromBase.resolve('echarts'), /MODULE_NOT_FOUND/);
await expect(page.locator('body')).toHaveAttribute('data-ds-theme','RED2');
await expect(page.locator('[auroraScope]')).toHaveAttribute('data-ds-density','compact');
```

- [ ] Проверить оптимизированную production-сборку charts: вызов `dsEChartsTheme` не падает из-за удалённого side-effect import. Ошибки compiler/HTTP/console печатать с именем fixture и сохранять build log; temp cleanup выполняется только для созданного каталога после проверки resolved path.
- [ ] GREEN: `mise exec -- npm run check:angular`, `mise exec -- npx playwright test ng-ui-kit/tests/browser/angular.spec.js`, затем `mise exec -- npm run verify`.
- [ ] Коммит: `test: validate legacy and new Angular consumers from the package`.

### Task 4: Одна инструкция подключения и закрытие этапа

**Files:** Modify `getting-started.md`, `ANGULAR.md`, `templates/angular/README.md`, `templates/angular/ng-package.json`, `README.md`, `ADOPTION.md`, `CHANGELOG.md`; create `ng-ui-kit/tests/angular-doc-examples.test.js`.

**Interfaces:** пользовательские imports документируются на новых exports; старый alias описан только в разделе перехода, а не как обязательный старт.

- [ ] Переписать основную последовательность getting-started: доступ → установка → CSS → `provideAurora` → optional charts → линтер → проверка. Убрать обязательные `paths`, ECharts и ручное внедрение сервиса из сценария без графиков.

```ts
import {provideAurora} from '@primasoftllc/design-system/angular';
export const appConfig: ApplicationConfig = {
  providers:[...provideAurora({theme:'DEFAULT'})],
};
```

- [ ] Добавить раздел перехода: удалить только алиас `@primasoftllc/design-system/angular`; перенести imports функций графиков на `/angular/echarts`; imports сервиса оставить. Указать, что существующий alias продолжает работать без перехода.
- [ ] `ANGULAR.md` оставляет специфику scoping/FRONT_BRAND/графиков и ссылку на getting-started. `templates/angular/README.md` объясняет назначение совместимых shims и `_aurora.scss`; устаревший ng-packagr-конфиг убрать из рекомендуемой инструкции и сделать валидным либо явно архивным, не оставлять сломанную команду.
- [ ] Документированный код включить в fixture base как отдельный `src/docs-example.ts`; `angular-doc-examples.test.js` сравнивает imports/provider fragment Markdown с компилируемым примером. Это одна meaningful проверка инструкции, а не набор тестов формулировок текста.
- [ ] Выполнить `mise exec -- node ng-ui-kit/tests/angular-doc-examples.test.js` и `mise exec -- npm run verify`; убедиться, что чистое CSS-приложение по-прежнему устанавливает пакет без Angular и ECharts. Обычные текстовые исправления не требуют дополнительных UI-тестов.
- [ ] Коммит: `docs: simplify Angular setup and document compatible migration`.

## Технические решения, проверенные по первичным источникам

- [Angular Package Format](https://angular.dev/tools/libraries/angular-package-format): библиотека компилируется partial, application linker работает у потребителя; exports включают declarations.
- [Angular 19 compatibility](https://v19.angular.dev/reference/versions): Angular 19.0 поддерживает Node 22 и TypeScript от 5.5 до 5.7, не включая 5.7; выбран 5.6.
- [APP_INITIALIZER](https://v19.angular.dev/api/core/APP_INITIALIZER) поддерживает multi-provider при bootstrap; deprecated статус принимается ради прежнего `Provider[]`.
- [provideAppInitializer](https://v19.angular.dev/api/core/provideAppInitializer) возвращает `EnvironmentProviders`; этот тип нельзя незаметно выдать за старый публичный `Provider[]`.

После успешного этапа перейти к плану 3. Публикацию, версию и обновление реальных
приложений этот план не выполняет.
