# Angular UI kit

Исходники, документация, инструменты сборки и проверки Angular UI kit находятся
в этой директории. Библиотека собирается Angular 19.2.25 и проверяется в приложениях
Angular 19.2.25 и 20.3.34.

## Структура

| Путь | Назначение |
| --- | --- |
| `src/` | Компоненты, сервис темы, директива скоупа и интеграция ECharts |
| `src/core.ts`, `src/echarts.ts` | Публичные экспорты |
| `src/components/button/` | Кнопка и документация её API |
| `docs/development.md` | Правила разработки Angular-компонентов |
| `tools/` | Сборка библиотеки и проверки установленного пакета |
| `tests/` | Проверки API, темы, документации и браузерного поведения |
| `tests/consumers/` | Независимые приложения-потребители и общие примеры |
| `tsconfig.lib.json` | Конфигурация partial compilation |

## Команды

Выполняются из корня репозитория:

```sh
mise exec -- npm run build
mise exec -- npm run check:angular
mise exec -- npm run verify
```

Для подготовки кеша перед проверками потребителей:

```sh
mise exec -- npm ci --prefix ng-ui-kit/tests/consumers/angular-19
mise exec -- npm ci --prefix ng-ui-kit/tests/consumers/angular-base
mise exec -- npm ci --prefix ng-ui-kit/tests/consumers/angular-charts
mise exec -- npm ci --prefix ng-ui-kit/tests/consumers/angular-legacy
```

## Подключение и общие ресурсы

Пакет и импорты сохраняются: `@primasoftllc/design-system/angular` и
`@primasoftllc/design-system/angular/echarts`. Результат сборки находится
в `dist/angular/` в корне репозитория.

Токены, стили, шрифты, npm-зависимости и CI общие для дизайн-системы.
Прежние пути `components/src/templates/angular/` и `templates/angular/`
сохранены для совместимости поставки; новые компоненты создаются здесь.

- [Правила разработки](docs/development.md)
- [Кнопка DsButtonComponent](src/components/button/README.md)
- [Подключение к приложению](../design-system/docs/usage.md)
- [Разработка дизайн-системы](../CONTRIBUTING.md)
