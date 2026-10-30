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
| `src/components/icon/` | Иконка и документация её API |
| `docs/development.md` | Правила разработки Angular-компонентов |
| `tools/` | Сборка библиотеки и проверки установленного пакета |
| `tests/` | Проверки API, темы, документации и браузерного поведения |
| `tests/consumers/` | Независимые приложения-потребители и общие примеры |
| `tsconfig.lib.json` | Конфигурация partial compilation |

## Команды

`npm run dev` запускает существующий сайт дизайн-системы с React-примерами.
Новый Angular-сайт находится в `documentation-site/`: `npm run dev:site-angular`
запускает его на http://127.0.0.1:4200, `npm run build:site-angular` собирает отдельно.
Команды подготавливают стили и Angular-библиотеку; dev-режим отслеживает их исходники.
Сайт использует публичный вход `@primasoftllc/design-system/angular`.
Страница `/components/icon` содержит примеры, правила применения, API и токены.
Пример иконки включён в Angular 19 и 20 consumers; запуск проверок подтверждает
его работу из tarball. Примеры сайта не входят в библиотеку и не заменяют эти проверки.

[Устройство и команды сайта](../documentation-site/README.md).
[Согласованное направление](../docs/plans/angular-ui-kit-vision.md).
Существующие команды старого сайта и публикации сохранены.

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
- [Добавление компонентов](docs/adding-components.md)
- [Кнопка DsButtonComponent](src/components/button/README.md)
- [Иконка DsIconComponent](src/components/icon/README.md)
- [FAB DsFabComponent](src/components/fab/README.md)
- [Checkbox DsCheckboxComponent](src/components/checkbox/README.md)
- [Spinner DsSpinnerComponent](src/components/spinner/README.md)
- [Подключение к приложению](../design-system/docs/usage.md)
- [Разработка дизайн-системы](../CONTRIBUTING.md)

На новом сайте доступны Icon, Button, FAB, Checkbox и Spinner по маршрутам
`/components/icon`, `/components/button`, `/components/fab`, `/components/checkbox`,
`/components/spinner`. Точечные проверки Spinner, Button и FAB на сайте и
в потребителях Angular 19/20 прошли; полный verify не запускался.
Button и FAB используют DsIconComponent и DsSpinnerComponent внутри; Checkbox поддерживает CVA и отдельные
checked/indeterminate. Angular-вход использует стандартный `@angular/forms`
той же версии, что `@angular/core`. Точечные проверки компонентов и потребителей
Angular 19/20 прошли; полный verify текущего этапа не запускался.
