# Версии и публикация

Репозиторий — `github.com/PrimaSoftLLC/aurora-web-design-system` (публичный), пакет — `@primasoftllc/design-system` в
GitHub Packages. Исходники и правки живут в репозитории; правила разработки — [CONTRIBUTING.md](../CONTRIBUTING.md).

## Выпуск версии

Версия в `package.json` — разрабатываемая. `/aurora-release` оформляет раздел
CHANGELOG, переводит `master` fast-forward на релизный коммит, затем поднимает
версию `develop` без Git-тега и открывает новый `[Unreleased]`. Push делает человек.

`/aurora-release` в develop ([AGENTS.md](../AGENTS.md), раздел «Релиз»). Push в master запускает `.github/workflows/ci.yml`:
проверки, `npm publish`, тег `v<version>`, GitHub Release из раздела CHANGELOG. Секреты не нужны — `GITHUB_TOKEN`.
Руками теги не ставятся и `npm publish` не запускается.
CI публикует проверенную staging-директорию командой
`npm publish ./.tmp/package --ignore-scripts`: повторная сборка при публикации не нужна.
Для локального tarball используется `npm run pack`; упаковка самого корня запрещена.

### Каталог на GitHub Pages

Опубликованный каталог: https://primasoftllc.github.io/aurora-web-design-system/.
Источник в Settings → Pages → Build and deployment — **GitHub Actions**.
Workflow `.github/workflows/pages.yml` собирает `site/` из тега `vX.Y.Z`,
проверяет совпадение с `package.json` и публикует каталог с учётом пути репозитория.
Обычные push в develop и pull request сайт не обновляют.

Релизный CI после создания тега вызывает этот workflow напрямую: события,
созданные через `GITHUB_TOKEN`, не запускают новый workflow на push тега.
Отдельный триггер `push.tags: v*` поддерживает теги, отправленные человеком;
правило проекта о создании релизных тегов только через CI сохраняется.
Для повторной публикации существующей версии используйте Actions → GitHub Pages →
Run workflow, укажите тег в поле `tag`. Это не публикует npm-пакет повторно.
Environment `github-pages` должен разрешать master, develop (ручной повторный запуск)
и теги `v*`. Теги версий не перемещаются: следующая публикация получает новый тег.

### Порядок подготовки релиза

Этот проект — npm-пакет: Docker-образ и Maven не участвуют в релизе.
Подготовка настроек релиза сама по себе не разрешает выпуск версии.

1. Выполнить `git fetch origin`. Рабочее дерево должно быть чистым, текущая ветка —
   `develop`, она не должна отставать от `origin/develop`. Проверить
   `git merge-base --is-ancestor origin/master develop`: ожидается код 0.
   При нарушении остановиться и показать состояние; ветки автоматически не чинить.
2. Прочитать разрабатываемую версию из package.json; сверить package-lock.json
   и `packages[""].version` в нём. Проверить отсутствие `v<version>` локально
   (`git tag -l v<version>`) и на сервере
   (`git ls-remote --tags origin refs/tags/v<version>`). Ошибка сети не означает отсутствие тега.
3. Согласовать выпускаемую и следующую версии по правилам ниже. Обычно выпускаемая
   уже записана в package.json; её не повышают перед релизом. Если пользователь
   явно назвал большую версию для legacy-проекта, оставшегося на выпущенной версии,
   выполнить `mise exec -- npm version <version> --no-git-tag-version` в рамках
   релизного коммита. Меньшая или уже выпущенная версия — причина остановиться.
   Следующая версия задаётся пользователем, иначе увеличивается PATCH.
   Ломающие изменения требуют MAJOR; этот выбор проверяется по составу изменений.
4. Выполнить `mise exec -- npm run verify` полностью. Красные проверки останавливают
   выпуск. Подготовка браузера и Angular-кешей описана в [CONTRIBUTING.md](../CONTRIBUTING.md#checks).
5. Переименовать `## [Unreleased]` в `## [<version>] — YYYY-MM-DD`.
   Если раздела нет, составить черновик из `git log --no-merges origin/master..develop`
   и согласовать текст. Проверить `mise exec -- node tools/release-check.mjs`:
   версии совпадают, раздел выпуска существует и не пуст.
6. Создать `chore: release <version>`. В коммите только CHANGELOG, плюс package.json
   и package-lock.json для legacy-исключения. Версии в README и других файлах
   не править заодно. Для многострочного сообщения использовать `git commit -F <файл>`.
7. Показать пользователю версии, раздел CHANGELOG, `git log --oneline origin/master..develop`,
   результат проверок и последствия push: публикация пакета, тег и GitHub Release.
   Перед переходом к выпуску получить явное подтверждение сводки.
8. Выполнить `git switch master` и `git merge --ff-only develop`. Если локального
   master нет, создать его от origin/master. При невозможности fast-forward остановиться:
   не использовать force или merge-коммит. Защиту веток не обходить; если требуется PR,
   использовать принятый процесс и проверить точный SHA выпуска.
9. Вернуться в develop, выполнить
   `mise exec -- npm version <next> --no-git-tag-version`, сверить обе версии в lock-файле,
   добавить новый пустой `## [Unreleased]` перед разделом выпуска.
   Создать `chore: start <next>` из package.json, package-lock.json и CHANGELOG.
10. Передать человеку команду `git push origin develop master`. Это отдельная последняя
    команда, без цепочки с commit или merge. Агент в этом проекте релизный push не выполняет:
    это локальное ограничение AGENTS.md, сохраняемое поверх общего навыка aurora-release.
11. После ручного push проверить `git ls-remote origin refs/heads/master refs/heads/develop`:
    master должен указывать на релизный коммит, develop — на `chore: start`.
    Проверить `gh run list --workflow ci.yml --limit 3` и результат CI для релизного SHA.

### Контроль публикации в CI

- PR в develop/master и push в develop выполняют verify, без публикации.
- Push в master и ручной запуск на master сначала проверяют тег выпуска,
  согласованность package.json/package-lock.json и непустой раздел CHANGELOG.
- Ошибка проверки удалённого тега, авторизации или сети останавливает публикацию.
  Только явный E404 от реестра означает отсутствие пакета.
- Если пакет уже существует, CI пропускает npm publish и продолжает создание тега
  и GitHub Release. Готовый тег версии запрещает повторный выпуск.
- Версия берётся из package.json; тег является результатом CI, а не источником версии.

## Восстановление после частичного релиза

Публикация в `npm publish`, тег и `gh release` идут одним шагом; если `npm publish` прошёл, а
дальше упало (сеть, права), повторный запуск workflow на том же релизном SHA сам всё доводит: гейт смотрит только на тег
(его ещё нет), а шаг публикации видит версию в реестре и пропускает `npm publish`, идёт сразу
ставить тег и релиз (`.github/workflows/ci.yml`). Донастраивать вручную ничего не нужно.

Если упал только `gh release create` — тег `v<version>` уже запушен, поэтому повторный push
в master теперь остановится на гейте («уже выпущена»). Единственное ручное вмешательство,
которое здесь допустимо: человек выполняет `gh release create v<version> --title v<version>
--notes-file <файл с разделом CHANGELOG>` из commit'а релиза сам, без повторного прогона CI.

## Доступ потребителей

Локальный доступ и настройка CI приложения описаны в [руководстве по использованию](../design-system/docs/usage.md).

## Лицензия

Перед публикацией `npm run verify` собирает пакет и каталог, проверяет исходный
Git-эталон в установленном Playwright Chromium и устанавливает tarball в пустой
offline-каталог. `site/`, исходники каталога и инструменты браузерных тестов не
поставляются потребителю. `prepack` создаёт совместимые файлы из исходников.

`UNLICENSED` — внутренний пакет. Шрифты — SIL OFL 1.1 (`design-system/assets/fonts/*/OFL.txt`).

## Versioning

Semantic versioning, `MAJOR.MINOR.PATCH`, released as a git tag `vX.Y.Z`.
The public surface is: **token names and their roles**, **component names and
props**, the three scope attributes, and the package entry points. Guideline cards
and reference screens are documentation — they never drive the number alone.

### MAJOR — a consumer must edit code

- A token is removed or renamed (`--ds-*`), or its *role* changes so an existing
  use now reads wrong (e.g. an ink token becoming a fill).
- A component is removed or renamed; a prop is removed or renamed; a prop's type
  narrows; a default changes what is already on screen.
- A value of `data-ds-theme` / `-appearance` / `-density` is dropped.
- An entry point moves.
- The minimum React version rises.

### MINOR — new surface, nothing breaks

- A new token, component, prop (with a backwards-compatible default), tenant theme
  block, icon in the vocabulary, or guideline card.
- A deprecation: the old name keeps working as an alias and is marked
  `@deprecated` in the `.d.ts` with the replacement named. **Every removal must
  ship one minor as an alias first** — a rename is never a single release.

### PATCH — same surface, better behaviour

- A colour, size or duration corrected inside an existing token role.
- A bug fix, an accessibility fix, a contrast fix that keeps the API.
- Docs, cards, reference screens, `design-system/docs/migration.md`.

### Rules

1. **Tokens are the contract, not the hexes.** Retuning a ramp is a patch; renaming
   a step is a major.
2. **Pre-1.0 does not apply** — the system shipped internally, so start at 1.0.0.
3. One tag, one CHANGELOG entry, one line per change, written for the consumer
   ("`DsChip` gains `count`"), not for the author ("refactored chip").
4. A theme added for a new tenant is a minor, even though it is only a CSS block:
   consumers list themes in their own settings UI.
5. Generated files (`dist/`, `site/`, compatible token CSS/JSON and component bundles)
   come from repository sources via `npm run build`. Do not edit generated copies;
   describe the consumer-facing change in the changelog.
