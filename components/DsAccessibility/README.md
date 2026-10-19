## Для разработчика

<details>
<summary>Как объявлять результат операции</summary>

Создайте область результата заранее и обновляйте её текст после успешного ответа сервера. Не переносите в неё фокус. Если компонент уже объявляет результат, не добавляйте второе объявление.

Пример локального сохранения: сообщение появляется после отправки формы. В продукте замените локальное действие запросом к серверу и обработайте ошибку.

```jsx
import {useState} from 'react';
import {DsButton, DsField} from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

export function ObjectName() {
  const [name, setName] = useState('МАЗ 5440');
  const [message, setMessage] = useState('');
  return <form style={{display: 'grid', gap: 'var(--ds-gap-md)'}}
    onSubmit={event => {
      event.preventDefault();
      setMessage('Название «' + name.trim() + '» сохранено в примере.');
    }}>
    <DsField label="Название объекта" required value={name}
      onChange={event => { setName(event.target.value); setMessage(''); }} />
    <div><DsButton type="submit" disabled={!name.trim()}>Сохранить</DsButton></div>
    <p role="status">{message}</p>
  </form>;
}
```

</details>

## Дальше

- [Фокус](../DsFocus/README.md)
- [Цвета статусов](../DsStatus/README.md)
- [Адаптивность](../DsBreakpoints/README.md)
