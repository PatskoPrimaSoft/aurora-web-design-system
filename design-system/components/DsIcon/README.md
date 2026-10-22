## Правила применения

Выбор символов, словарь, размеры по назначению, цвет и доступность —
в [«Иконографике»](../DsIconography/preview.html). Здесь описано использование
React-компонента DsIcon; это не Angular API.

- `name` выбирает глиф Material Symbols Outlined.
- `size` задаёт размер глифа и его области; именованные значения учитывают плотность.
- `label` делает иконку смысловой и задаёт доступное имя; без него иконка декоративная.
- `rotate` задаёт поворот по часовой стрелке в градусах, `style` — дополнительные стили.
- Цвет наследуется от родителя. Для действий используйте [DsIconButton](../DsIconButton/README.md).

## Пример кода

```jsx
import { useState } from 'react';
import { DsButton, DsIcon } from '@primasoftllc/design-system';

export function HeadingExample() {
  const [course, setCourse] = useState(45);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <DsIcon name="navigation" rotate={course} />
      <span>Курс: {course}°</span>
      <DsButton tone="secondary" onClick={() => setCourse((course + 45) % 360)}>
        Повернуть на 45°
      </DsButton>
    </div>
  );
}
```
