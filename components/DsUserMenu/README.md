## Правила применения

- Кнопка с именем и стрелкой всегда открывает меню; отдельно статичная плашка не используется.
- Кнопка — часть `DsUserMenu`: имя, необязательный аватар и стрелка раскрытия.
- Высота — `ds-control-h-sm`, цвета — `ds-header-chip-*`; оформление следует теме и плотности.
- Размещайте меню в `actions` или слоте `actions` компонента `DsAppHeader`.
- Enter / Space и стрелки открывают меню; стрелки перемещают фокус по пунктам,
  Escape закрывает меню и возвращает фокус на кнопку.

## Пример кода

```jsx
import { useState } from 'react';
import { DsAppHeader, DsUserMenu } from '@primasoftllc/design-system';

export function UserHeader() {
  const [message, setMessage] = useState('');
  return (
    <div>
      <DsAppHeader
        product="Aurora"
        actions={
          <DsUserMenu
            name="Анна Иванова"
            items={[{ id: 'profile', label: 'Профиль' }, { id: 'settings', label: 'Настройки' }]}
            onSelect={item => setMessage('Выбрано: ' + item.label)}
          />
        }
      />
      <p role="status">{message}</p>
    </div>
  );
}
```
