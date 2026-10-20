# Совместимые Angular-адаптеры

Основное подключение — [руководство по использованию](../../docs/usage.md).
Пакет предоставляет скомпилированные входы `/angular` и `/angular/echarts`.
Исходники библиотеки находятся в `ng-ui-kit/src/`; файлы
`components/src/templates/angular/*.ts` сохранены как адаптеры прежних путей.
Они реэкспортируют скомпилированную реализацию: сервис и InjectionToken не дублируются.

| Путь | Назначение |
|---|---|
| `/angular` | `provideAurora`, сервис, директива и типы трёх скоупов |
| `/angular/echarts` | хром графика и наблюдение за скоупами; требует ECharts |
| `components/src/templates/angular/index.ts` | совместимый вход старого `tsconfig.paths` |
| `templates/angular/_aurora.scss` | необязательные миксины над CSS-токенами |
| `templates/angular/ng-package.json` | архив прежнего эксперимента; не используется сборкой |

Новый проект подключается без алиаса и ручной компиляции исходников пакета.
Старый алиас сохранён; для application-builder включите его `index.ts` в
`tsconfig.files`, как показано в разделе перехода getting-started.

`ng-package.json` оставлен для истории конфигурации. Отдельная сборка ng-packagr
не является способом установки или выпуска этого пакета. Рабочая сборка из корня:
`mise exec -- npm run build`; Angular компилируется через `ng-ui-kit/tools/build-angular.mjs`.

Стили подключаются из `dist/styles.css`, а правила скоупов, `FRONT_BRAND`,
`theme-*` и отписка графиков описаны в [руководстве по использованию](../../docs/usage.md).
