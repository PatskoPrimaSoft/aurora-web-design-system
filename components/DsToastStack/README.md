## Правила применения

- Используйте один стек для текущей области интерфейса. Передавайте в него `DsToast`; список уведомлений и их удаление по `onClose` хранит приложение.
- Каждый тост получает стабильный уникальный `key`. Новое уведомление — новый ключ; индекс массива для этого не подходит. Порядок соответствует `children`: при добавлении в конец новое сообщение появляется внизу.
- Не накапливайте сообщения поверх содержимого страницы. Ограничение очереди задаёт приложение; стек сам не ограничивает её длину.
- Стек учитывает ширину окна и безопасные отступы экрана. При удалении тоста остальные плавно занимают его место; reduced motion отключает анимацию. Уходящий тост исключается из фокуса, его таймер останавливается.
- В модальном сценарии размещайте стек внутри `DsDialog`, чтобы действия уведомлений оставались доступны клавишей Tab. После закрытия сообщения с фокусом возвращайте фокус к подходящему элементу интерфейса.
- Стек не объявляет сообщения сам: срочность объявления и автозакрытие задаются на `DsToast`. Не дублируйте его объявления внешним `aria-live`.

## Пример кода

```jsx
import { useRef, useState } from 'react';
import { DsButton, DsToast, DsToastStack } from '@primasoftllc/design-system';

function Notifications() {
  const [items, setItems] = useState([]);
  const serial = useRef(0);
  const trigger = useRef(null);

  function dismiss(id) {
    setItems(list => list.filter(item => item.id !== id));
    trigger.current?.focus();
  }

  return <>
    <DsButton onClick={event => {
      trigger.current = event.currentTarget;
      const item = { id: ++serial.current, text: 'Настройки сохранены.' };
      setItems(list => [...list, item]);
    }}>Показать уведомление</DsButton>
    <DsToastStack position="bottom-right">
      {items.map(item => <DsToast key={item.id} tone="success"
        onClose={() => dismiss(item.id)}>{item.text}</DsToast>)}
    </DsToastStack>
  </>;
}
```
