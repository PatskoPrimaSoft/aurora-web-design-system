# Светлый и тёмный режим

## Пример кода

Минимальное подключение тёмного режима к готовому компоненту.

```jsx
import {DsLozenge} from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

export function ObjectStatus() {
  return (
    <section data-ds-theme="DEFAULT" data-ds-appearance="dark"
      style={{background: 'var(--ds-bg)', color: 'var(--ds-fg)', padding: 24}}>
      <DsLozenge tone="success">На связи</DsLozenge>
    </section>
  );
}
```

<details>
<summary>Полный код настройки объекта</summary>

Код воспроизводит первый пример: изменение флажка и подтверждение сохранения.

```jsx
import {useState} from 'react';
import {DsPanel, DsButton, DsCheckbox, DsLozenge} from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

export function ObjectSettings() {
  const [selected, setSelected] = useState('checked');
  const [saved, setSaved] = useState(false);

  return (
    <section data-ds-theme="DEFAULT" data-ds-appearance="dark"
      style={{background: 'var(--ds-bg)', color: 'var(--ds-fg)', padding: 24}}>
      <DsPanel title="Настройки объекта" headingLevel="h3">
        <div style={{display: 'grid', gap: 16}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
            <p style={{margin: 0, flex: 1}}>МАЗ 5440 · Минск — Брест</p>
            <DsLozenge tone="success">На связи</DsLozenge>
          </div>
          <DsCheckbox label="Показывать трек" state={selected}
            onChange={value => {setSelected(value); setSaved(false);}} />
          <div><DsButton onClick={() => setSaved(true)}>Сохранить изменения</DsButton></div>
          <p role="status" style={{margin: 0, font: 'var(--ds-type-caption)', color: 'var(--ds-fg-muted)'}}>
            {saved ? 'Изменения сохранены.' : 'Настройка применяется к выбранному объекту.'}
          </p>
        </div>
      </DsPanel>
    </section>
  );
}
```

Пример подтверждает сохранение локально. В приложении показывайте успех
после успешного ответа сервера.

</details>

## Дальше

- [Нейтральные цвета](../DsNeutrals/README.md) — выбор цветов текста, поверхностей и границ.
- [Цветовые темы](../DsBrandThemes/README.md) — бренд, акцент и смысл статусов.
- [Плотность интерфейса](../DsDensity/README.md) — размеры и отступы компонентов.
- [Цвета и оформление графиков](../DsCharts/README.md) — оформление данных в обоих режимах.
