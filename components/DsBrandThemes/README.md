# Цветовые темы

## Пример кода

Минимальное подключение темы к готовому компоненту. Атрибуты контейнера
задают бренд и оформление для всех компонентов внутри.

```jsx
import { DsLozenge } from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

export function ThemedStatus() {
  return (
    <section data-ds-theme="RED2" data-ds-appearance="dark">
      <DsLozenge tone="success">На связи</DsLozenge>
    </section>
  );
}
```

<details>
<summary>Полный код примера с настройками объекта</summary>

Код воспроизводит вводную демонстрацию: изменение настройки и подтверждение сохранения.

```jsx
import { useState } from 'react';
import { DsPanel, DsButton, DsCheckbox, DsLozenge } from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

export function ObjectSettings() {
  const [selected, setSelected] = useState('checked');
  const [saved, setSaved] = useState(false);

  return (
    <section data-ds-theme="RED2" data-ds-appearance="dark">
      <DsPanel title="Настройки объекта" headingLevel="h3">
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <p>МАЗ 5440 · Минск — Брест</p>
            <DsLozenge tone="success">На связи</DsLozenge>
          </div>
          <p>
            <span style={{ background: 'var(--ds-accent)', color: 'var(--ds-accent-on)',
              borderRadius: 'var(--ds-radius-pill)', padding: '2px 8px', marginRight: 8 }}>3</span>
            новых события
          </p>
          <DsCheckbox label="Показывать трек" state={selected} onChange={setSelected} />
          <div><DsButton onClick={() => setSaved(true)}>Сохранить изменения</DsButton></div>
          <p role="status">{saved ? 'Изменения сохранены.' : 'Измените настройку и сохраните.'}</p>
        </div>
      </DsPanel>
    </section>
  );
}
```

Кнопка подтверждает действие внутри демонстрации. В приложении обновляйте
сообщение после успешного ответа на запрос сохранения.
Счётчик — собственная разметка: заливка и текст используют парные роли акцента.

</details>

## Дальше

- [Нейтральные цвета](../DsNeutrals/README.md) — текст, поверхности и границы.
- [Цвета статусов](../DsStatus/README.md) — выбор цвета по смыслу сообщения.
- [Как выбрать цвета темы](../DsBrandPick/README.md) — подготовка новой палитры.
- [Типографика](../DsType/README.md) — текстовые роли и иерархия.
