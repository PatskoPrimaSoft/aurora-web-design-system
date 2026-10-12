## Правила применения

- Размещайте отдельную легенду вне области графика, например в подвале панели.

- Клик скрывает серию — тот же жест, что у легенды ECharts.
- Внутри `DsChart` легенда уже есть и появляется при двух и более сериях.
- Передавайте актуальный список скрытых серий в `hidden` и обновляйте его через `onToggle`.

## Пример кода

```jsx
import { useState } from 'react';
import { DsChartLegend } from '@primasoftllc/design-system';

export function SeriesLegend() {
  const [hidden, setHidden] = useState([]);
  return (
    <DsChartLegend
      series={[{ name: 'Скорость', unit: 'км/ч' }, { name: 'Топливо', unit: 'л' }]}
      hidden={hidden}
      onToggle={name => setHidden(current =>
        current.includes(name) ? current.filter(value => value !== name) : [...current, name]
      )}
    />
  );
}
```
