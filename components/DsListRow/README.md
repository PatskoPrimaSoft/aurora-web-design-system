## Правила применения

- `active` отмечает открытый для просмотра объект подложкой и полосой слева. `selected` отмечает участие в множественном выборе той же подложкой, без полосы. Состояния независимы и могут сочетаться: нажатие строки меняет просмотр, чекбокса — только выбор. Этими состояниями управляет родитель.
- Для действия на текущем экране передайте `onClick`: основная область станет кнопкой с поддержкой Enter и Space. Для перехода передайте `href`: получится нативная ссылка. `as="div"` отключает оба варианта.
- Дополнительные кнопки помещайте в `actions`: они находятся рядом с основной кнопкой и не открывают строку. Каждому действию без текста задайте доступное имя с названием объекта.
- В одном списке задавайте одинаковый `actionsWidth`, достаточный для набора кнопок, включая строки без действий: правые значения сохранят общее выравнивание. Кнопки остаются различимыми без наведения; их имена видны в подсказках при наведении и фокусе.
- Текстовое пояснение использует обычный шрифт. Для подзаголовка из номера или времени включите `subtitleMono`.
- Для множественного выбора разместите DsCheckbox рядом со строкой. `selected` сам по себе не создаёт чекбокс и не объявляет состояние выбора вспомогательным технологиям.
- `state` имеет приоритет над `icon`; `course` задаёт направление движущегося объекта. Добавляйте текстовое пояснение статуса, если контекст не объясняет символ.
- Название и подзаголовок сокращаются при нехватке места. Полное название остаётся в доступном имени и появляется в подсказке при наведении на него или фокусе основной области; Escape закрывает подсказку. Значение справа оставляйте коротким; важные сведения из подзаголовка должны быть доступны в подробностях объекта.
- `badge` предназначен для короткой неинтерактивной метки DsLozenge. `actions` и `badge` также можно передать дочерними элементами со `slot="actions"` и `slot="badge"`.

## Пример кода

```jsx
import { useState } from 'react';
import { DsCheckbox, DsIconButton, DsListRow } from '@primasoftllc/design-system';

export function ObjectList() {
  const [active, setActive] = useState('maz');
  const [selected, setSelected] = useState(['volvo']);
  const [message, setMessage] = useState('');
  const objects = [
    { id: 'maz', title: 'MAZ 5440', subtitle: 'AB 1234-7 · Движется', state: 'moving', course: 135, value: '62 км/ч' },
    { id: 'volvo', title: 'Volvo FH16', subtitle: 'AC 8871-2 · Стоянка', state: 'parked', value: '0 км/ч' },
  ];

  return (
    <div>
      {objects.map(({ id, ...object }) => (
        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-gap-sm)' }}>
          <DsCheckbox state={selected.includes(id) ? 'checked' : 'unchecked'}
            ariaLabel={`Выбрать: ${object.title}`}
            onChange={next => setSelected(ids => next === 'checked' ? [...ids, id] : ids.filter(value => value !== id))} />
          <DsListRow {...object} active={active === id} selected={selected.includes(id)}
            onClick={() => setActive(id)} actionsWidth={32}
            actions={<DsIconButton icon="info" size="sm"
              label={`Сведения: ${object.title}`}
              onClick={() => setMessage(`Сведения об объекте ${object.title}`)} />}
          />
        </div>
      ))}
      <p role="status">{message}</p>
    </div>
  );
}
```
