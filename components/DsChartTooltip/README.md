## Правила применения

- Заголовок обозначает положение по оси, обычно время; каждая строка соответствует видимой серии.

- Экспортирован отдельно, чтобы наведение на карте показывало ту же подсказку.
- Единица — отдельный от числа элемент.
- Цвет серии передавайте через токен `ds-series-*`, соответствующий графику.

## Пример кода

```jsx
import { DsChartTooltip } from '@primasoftllc/design-system';

export function PointValues() {
  return (
    <DsChartTooltip
      label="14:00"
      rows={[
        { name: 'Скорость', value: '72', unit: 'км/ч', color: 'var(--ds-series-1)' },
        { name: 'Топливо', value: '131', unit: 'л', color: 'var(--ds-series-2)' },
      ]}
    />
  );
}
```
