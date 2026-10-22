# Иконографика

Правила выбора и словарь показаны в живых примерах выше.
Для API используйте [DsIcon](../DsIcon/README.md) и
[DsIconButton](../DsIconButton/README.md).

## Пример кода

Использование готовых React-компонентов: кнопка сама размещает иконку,
а DsIcon рядом с текстом остаётся декоративной. Angular API описывается
в разделе [UI-kit](../../../ng-ui-kit/docs/adding-components.md).

```jsx
import { useState } from 'react';
import { DsButton, DsIcon } from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

export function ObjectActions() {
  const [count, setCount] = useState(1);
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <DsButton icon="add" onClick={() => setCount(count + 1)}>Добавить объект</DsButton>
      <span role="status">Объектов: {count}</span>
      <DsIcon name="warning" />
      <span>Нет связи с объектом</span>
    </div>
  );
}
```
