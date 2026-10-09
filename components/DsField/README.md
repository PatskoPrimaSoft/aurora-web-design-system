## Правила применения

- По умолчанию подпись находится над полем. Не заменяйте её placeholder: подсказка внутри исчезает после ввода. `labelMode="notch"` предназначен для соседства с ещё не перенесёнными формами.
- Выберите `as="input"`, `select` или `textarea`. Тип обычного ввода задаёт `type`; варианты выбора — `options`, число строк textarea — `rows`.
- Используйте `value` с `onChange` для управляемого поля или `defaultValue` для начального значения неуправляемого. Не передавайте оба одновременно.
- `error` заменяет `hint`, выделяет рамку и задаёт `aria-invalid`. Пояснение связано с полем через `aria-describedby`. Проверку значения и момент показа ошибки определяет форма.
- `required` включает нативное обязательное заполнение и добавляет отметку к обычной подписи. Для собственного сценария проверки форма может использовать `noValidate`.
- Единицы измерения передавайте через `suffix`. Для select справа показывается стрелка, suffix не выводится.
- `mono` подходит для идентификаторов и числовых значений, которые нужно сравнивать посимвольно.
- Высота поля зависит от токенов плотности; textarea растёт по количеству строк и допускает изменение высоты пользователем. Внешние интервалы между полями задаёт родитель.
- Доступное поле входит в последовательность Tab. Select и textarea сохраняют нативное клавиатурное поведение; `disabled` исключает поле из последовательности Tab.
- Системная оболочка рисует фокус вокруг всего поля. Для связанного label и ссылок из других элементов можно задать стабильный `id`.

## Пример кода

```jsx
import { useState } from 'react';
import { DsField, DsButton } from '@primasoftllc/design-system';

function ObjectNameForm() {
  const [name, setName] = useState('MAZ 5440');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  function submit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Введите название объекта.');
      setSaved('');
      return;
    }
    setError('');
    setSaved(`Сохранено: ${name.trim()}`);
  }

  return (
    <form onSubmit={submit} noValidate>
      <DsField
        id="object-name"
        label="Название объекта"
        value={name}
        onChange={event => {
          setName(event.target.value);
          setError('');
          setSaved('');
        }}
        required
        error={error}
      />
      <DsButton type="submit">Сохранить</DsButton>
      <p role="status">{error || saved}</p>
    </form>
  );
}
```
