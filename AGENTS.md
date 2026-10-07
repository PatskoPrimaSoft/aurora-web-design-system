# aurora-web-design-system: правила для агентов

Пакет `@primasoftllc/design-system` в GitHub Packages. Репозиторий — источник
дизайн-системы: токены, компоненты, превью и документация редактируются здесь.
Утверждённая миграция: `docs/superpowers/plans/2026-10-02-repository-first.md`.

## Команды и разработка

- Node 22 из `mise.toml`: `mise exec -- npm …`.
- `npm test` — линтер, UI, поставка и release guard. `npm run verify` — полная проверка,
  включая CSS-каскад в браузере и tarball глазами потребителя.
- `npm run build` создаёт результаты в `dist/`; генерируемые файлы не правятся вручную.
  Каталог создаётся в `site/`; `npm run dev` открывает его на `127.0.0.1:5173`
  и обновляет страницы при правках, явно показывает ошибки сборки.
  Токены редактируются в `tokens/source.json`, компоненты — в `components/src`,
  примеры — в `components/*/preview.html`, общие стили — в `styles/`.
- Сохранять публичные имена, пути, CSS-переменные и поведение. Для изменения props
  обновлять реализацию, `.d.ts` и метаданные карточки вместе.
- Цвета только через токены, размеры в px; внешние отступы задаёт родитель.
- Проверять DEFAULT/light/cozy, DEFAULT/dark/compact, RED2/light/cozy,
  RED2/dark/compact, клавиатуру и доступность затронутых примеров.
- В `CHANGELOG.md` добавлять изменения под `## [Unreleased]` для потребителя.

## Страницы компонентов

- При создании или переработке страницы следовать [единому стандарту](docs/component-pages.md).
- Эталон — `DsCheckbox`; подключение общего шаблона — `layout="component"` в `@dsCard`.
- Порядок: назначение → живые примеры → правила применения → пример кода → параметры → токены. Пустые блоки и повторные описания состояний не добавлять.

## Релиз

- Ветки: `master` (релизы), `develop`, фичи от develop. Коммиты на английском.
- Версия в `package.json` — разрабатываемая. Релиз — `/aurora-release`: CHANGELOG
  `## [Unreleased]` → `## [X.Y.Z] — YYYY-MM-DD`, fast-forward master, затем develop
  переводится на следующую версию (`npm version <next> --no-git-tag-version`)
  с новым `## [Unreleased]`. Push делает человек.
- Push в master публикует пакет, ставит тег `v<version>` и GitHub Release через
  `.github/workflows/ci.yml`. Агент не выполняет `npm publish`, релизный `git push`,
  `git tag v*` или `npm version` с созданием тега.
- Версии и порядок выпуска — [docs/release.md](docs/release.md); ломающее изменение → MAJOR.
- `tools/guard-command.mjs` проверяет команды без выполнения payload. Codex подключает
  его через `.codex/hooks.json`; пользователь подтверждает доверие через `/hooks`.
  Проверка CLI не доказывает активацию в хосте. До подтверждения старый Claude-хук сохраняется.
