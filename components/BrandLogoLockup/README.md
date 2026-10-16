# Логотип бренда

## Пример кода

Готовая шапка задаёт размеры и оформление композиции. Путь к PNG замените
путём к ресурсу вашего приложения; файл должен быть доступен в его сборке.

```jsx
import { DsAppHeader } from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

export function ApplicationHeader() {
  return (
    <DsAppHeader
      product="Aurora"
      logoSrc="/assets/logo/AuroraWhite.png"
      env="DEV"
    />
  );
}
```

## Дальше

- [Шапка приложения](../DsAppHeader/README.md) — навигация и действия рядом с логотипом.
- [Цветовые темы](../DsBrandThemes/README.md) — подключение бренда.
- [Светлый и тёмный режимы](../DsAppearance/README.md) — проверка оформления.
