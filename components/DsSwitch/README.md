## Правила применения

Используйте для настройки, которая применяется сразу. Для выбора, подтверждаемого кнопкой «Сохранить», используйте DsCheckbox.

Подпись `label` называет настройку и остаётся одинаковой в обоих положениях. Дополнительное пояснение задавайте через `description`. Не оставляйте переключатель без доступного имени: отдельного параметра для него нет, имя задаёт подпись.

Компонент управляемый: передавайте `checked` и обновляйте его через `onChange(event.target.checked)`. Без `onChange` используйте только статичный образец. `disabled` запрещает изменение и исключает контрол из порядка Tab.

Нажатие на переключатель или подпись меняет значение. Tab переводит фокус, Space переключает настройку; Enter значение не меняет. Размер дорожки — 36 × 20 px, он одинаковый при обеих плотностях интерфейса.

## Пример кода

```jsx
import { useState } from 'react';
import { DsSwitch } from '@primasoftllc/design-system';

export function Example() {
  const [showTracks, setShowTracks] = useState(true);

  return (
    <DsSwitch
      label="Показывать треки"
      checked={showTracks}
      onChange={(event) => setShowTracks(event.target.checked)}
    />
  );
}
```
