# Наведение и нажатие

## Пример кода

Для готовой кнопки достаточно передать обработчик действия — состояния уже реализованы.

```jsx
import {DsButton} from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

export function SaveButton({onSave}) {
  return <DsButton onClick={onSave}>Сохранить</DsButton>;
}
```

<details>
<summary>Полный код примера с подтверждением действия</summary>

Код воспроизводит первый пример: кнопки обновляют сообщение о результате.

```jsx
import {useState} from 'react';
import {DsButton} from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

export function ObjectActions() {
  const [result, setResult] = useState('Изменения ещё не сохранены.');
  return (
    <div style={{display: 'grid', gap: 'var(--ds-gap-md)'}}>
      <p style={{margin: 0}}>Настройки объекта МАЗ 5440</p>
      <div style={{display: 'flex', gap: 'var(--ds-gap-sm)', flexWrap: 'wrap'}}>
        <DsButton onClick={() => setResult('Изменения сохранены.')}>
          Сохранить
        </DsButton>
        <DsButton tone="secondary" onClick={() => setResult('Изменения отменены.')}>
          Отмена
        </DsButton>
        <DsButton disabled>Недоступно</DsButton>
      </div>
      <p role="status" style={{margin: 0}}>{result}</p>
    </div>
  );
}
```

Подтверждение в примере локальное. В приложении сообщайте об успешном
сохранении после ответа сервера.

</details>

## Дальше

- [Кнопки](../DsButton/README.md) — выбор тона по назначению действия.
- [Фокус](../DsFocus/README.md) — управление с клавиатуры.
- [Нейтральные цвета](../DsNeutrals/README.md) — состояния поверхностей и выбор.
- [Светлый и тёмный режим](../DsAppearance/README.md) — читаемость в обоих оформлениях.
