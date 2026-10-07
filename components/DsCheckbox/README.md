## Правила применения

Символ — 18 × 18 px. Область нажатия следует плотности; в таблице — 24 × 24 px.

Задавайте `state` и обновляйте его через `onChange(nextState)`. Нажатие на частично выбранный чекбокс выбирает всё. Для радио используйте `unchecked` или `checked` и общий `name` внутри группы.

`label` — видимая подпись, `description` — пояснение под ней. Без подписи задайте `ariaLabel`. Space переключает чекбокс, стрелки меняют выбор в группе радио. Enter выбор не переключает.

## Пример кода

```jsx
import { useState } from 'react';
import { DsCheckbox } from '@primasoftllc/design-system';

export function Example() {
  const [state, setState] = useState('checked');

  return (
    <DsCheckbox
      label="Отправка команд"
      state={state}
      onChange={setState}
    />
  );
}
```
