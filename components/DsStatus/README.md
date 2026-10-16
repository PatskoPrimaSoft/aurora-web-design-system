# Цвета статусов

## Пример кода

В готовом компоненте выбирайте смысл через `tone` и добавляйте подпись.
Цвета подложки, текста и иконки назначает сам компонент.

```jsx
import { DsLozenge, DsBanner } from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

export function ReportStatus() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <DsLozenge tone="success">Готов</DsLozenge>
      <DsBanner tone="success" title="Отчёт сформирован" headingLevel="h3">
        Данные за 12 октября доступны в разделе отчётов.
      </DsBanner>
    </div>
  );
}
```

## Дальше

- [DsLozenge](../DsLozenge/README.md) — короткая неинтерактивная плашка статуса.
- [DsBanner](../DsBanner/README.md) — постоянное сообщение внутри страницы.
- [DsToast](../DsToast/README.md) — результат действия, срочность и время показа.
- [DsButton](../DsButton/README.md) — варианты кнопок, в том числе для опасных действий.
- [Нейтральные цвета](../DsNeutrals/README.md) — обычный текст и поверхности.
- [Оформление интерфейса](../DsAppearance/README.md) — светлый и тёмный режимы.
