## Правила применения

- Используйте имена из словаря иконографики продукта. DsIcon рисует глиф Material Symbols Outlined из локального шрифта.
- Размер задавайте токеном: `ds-icon` внутри контрола, `ds-icon-lg` для отдельной иконки, `ds-icon-sm` в плотных строках, `ds-icon-xs` рядом с мелким текстом. Размеры учитывают плотность интерфейса.
- Цвет наследуется от родителя. Для брендовой заливки используйте `ds-on-brand`; статусные цвета выбирайте с учётом поверхности.
- По умолчанию иконка скрыта от скринридера. Если рядом есть текст или иконка находится в кнопке с доступным именем, отдельный `label` не нужен. Задавайте `label`, когда иконка сама передаёт факт: она получает `role="img"` и доступное имя.
- Поворот должен передавать смысл, например курс объекта. `rotate` задаётся в градусах по часовой стрелке.
- Для нажатия используйте DsIconButton: сама иконка не является интерактивным контролом. Не создавайте собственный span со шрифтовым классом в обход DsIcon.

## Пример кода

```jsx
import { useState } from 'react';
import { DsButton, DsIcon } from '@primasoftllc/design-system';

export function HeadingExample() {
  const [course, setCourse] = useState(45);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <DsIcon name="navigation" rotate={course} label={`Курс ${course}°`} />
      <DsButton tone="secondary" onClick={() => setCourse((course + 45) % 360)}>
        Повернуть на 45°
      </DsButton>
    </div>
  );
}
```
