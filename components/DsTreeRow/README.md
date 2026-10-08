## Правила применения

- Используйте строку для заголовка ветки. Объекты внутри ветки отображайте через DsListRow или собственное содержимое. Вложенность и видимость дочерних строк задаёт родитель.
- `level` задаёт отступ с шагом 20 px: например, пользователь — 0, группа — 1. Компонент не создаёт дерево с навигацией стрелками; действия доступны через Tab, Enter и Space.
- `expanded` и `onToggle` управляют раскрытием. Если задан только `onToggle`, вся основная область раскрывает ветку. При добавлении `onClick` название открывает объект, а отдельная кнопка шеврона раскрывает ветку.
- При отсутствии onToggle шеврон скрыт, но его место сохранено для выравнивания. Для пустой ветки не передавайте обработчик раскрытия.
- active отмечает открытую для просмотра группу. Это состояние независимо от раскрытия и группового выбора; переключением управляет родитель.
- Сокращённое название доступно в подсказке по наведению и фокусу. Escape закрывает только видимую подсказку. Статическая строка с обрезанным названием также доступна через Tab.
- Чекбокс действует независимо от раскрытия и открытия. Родитель вычисляет `select`, `selected` и `total` по дочерним объектам и обновляет их выбор в `onSelectChange`. Нажатие на частично выбранный чекбокс выбирает всю группу.
- Сворачивание ветки само по себе не меняет выбор. Для пустой группы используйте `selectDisabled`, чтобы сохранить выравнивание чекбоксов.
- `avatar` или `avatarSrc` заменяют иконку. Для инициалов передавайте текстовый `title`. Дополнительную подпись `meta` делайте короткой: она занимает не больше 40% области текста и сокращается раньше названия. Вложенность передаётся отступом; названия всех уровней используют основной цвет текста.

## Пример кода

```jsx
import { useState } from 'react';
import { DsCheckbox, DsTreeRow } from '@primasoftllc/design-system';

export function VehicleGroup() {
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState([]);
  const objects = ['MAZ 5440', 'Volvo FH16'];
  const select = selected.length === 0 ? 'unchecked'
    : selected.length === objects.length ? 'checked' : 'indeterminate';

  return (
    <div>
      <DsTreeRow
        title="Грузовики"
        icon="label"
        expanded={expanded}
        onToggle={setExpanded}
        selected={selected.length}
        total={objects.length}
        select={select}
        onSelectChange={next => setSelected(next === 'checked' ? objects : [])}
      />
      {expanded && (
        <div style={{ paddingLeft: 20 }}>
          {objects.map(name => (
            <DsCheckbox
              key={name}
              label={name}
              state={selected.includes(name) ? 'checked' : 'unchecked'}
              onChange={next => setSelected(prev => next === 'checked'
                ? [...prev, name] : prev.filter(item => item !== name))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```
