# Адаптивность и брейкпоинты

Состав регионов, распределение ширины и прокрутка —
в [«Сетке и компоновке»](../DsLayout/preview.html). Здесь описано,
как перестраивать выбранную компоновку при изменении доступного места.

## Пример кода

Стили для собственной компоновки: список и сведения идут последовательно,
а с ширины окна 960 px располагаются рядом. Классы `.object-list` и
`.object-details` обозначают эти два блока. Готовые кнопки и другие компоненты
сохраняют своё оформление; расположение блоков задаёт приложение.

```css
@import '@primasoftllc/design-system/styles.css';

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--ds-gap-md);
}

.object-list,
.object-details {
  min-width: 0;
  overflow-wrap: anywhere;
}

@media (min-width: 960px) {
  .workspace {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

Порог относится к ширине окна. Для блока внутри панели используйте
container queries — подробности находятся в справочнике выше.

<details>
<summary>Полный код интерактивного примера</summary>

Переключатель вручную показывает обе компоновки. Кнопка «Обновить» подтверждает
действие локально; в приложении показывайте результат после ответа сервера.
Если внутри примера мало места для двух колонок, блоки остаются друг под другом.
Вместо переключателя можно использовать media query из примера выше,
удалив правило `.workspace[data-layout="wide"]`.

```jsx
import React from 'react';
import {DsButton} from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';
import './layout-example.css';

export function LayoutExample(){
  const [layout,setLayout]=React.useState('narrow');
  const [selected,setSelected]=React.useState('МАЗ 5440');
  const [message,setMessage]=React.useState('');
  return <>
    <div className="layout-options" role="group" aria-label="Компоновка примера">
      {[['narrow','Одна колонка'],['wide','Две колонки']].map(([value,label])=><DsButton key={value} tone={layout===value?'subtle':'secondary'} aria-pressed={layout===value} onClick={()=>setLayout(value)}>{label}</DsButton>)}
    </div>
    <div className="scene" id="responsive-example" data-layout={layout}>
      <div className="workspace" data-layout={layout}>
        <div className="object-list"><h3>Объекты</h3><div role="group" aria-label="Выбор объекта">
          {['МАЗ 5440','Volvo FH16'].map(name=><DsButton key={name} tone={selected===name?'subtle':'secondary'} aria-pressed={selected===name} fullWidth onClick={()=>{setSelected(name);setMessage('');}}>{name}</DsButton>)}
        </div></div>
        <div className="object-details"><h3>{selected}</h3><p>{selected==='МАЗ 5440'?'Маршрут Минск — Брест.':'Маршрут Минск — Гродно.'}</p>
          <div><DsButton tone="secondary" onClick={()=>setMessage('Данные '+selected+' обновлены.')}>Обновить</DsButton></div>
          <p role="status" className="caption">{message||'Последнее сообщение — 14:32'}</p>
        </div>
      </div>
    </div>
  </>;
}
```

Содержимое `layout-example.css`:

```css
.layout-options { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.scene {
  container-type: inline-size;
  padding: 24px;
  background: var(--ds-bg);
  color: var(--ds-fg);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
}
.scene[data-layout="narrow"] { max-width: 390px; box-sizing: border-box; }
.workspace { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--ds-gap-md); }
.workspace[data-layout="wide"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
@container (max-width: 279px) {
  .workspace[data-layout="wide"] { grid-template-columns: minmax(0, 1fr); }
}
.object-list, .object-details {
  box-sizing: border-box;
  min-width: 0;
  overflow-wrap: anywhere;
  padding: var(--ds-pad-md);
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
}
.object-list > div { display: grid; gap: var(--ds-gap-sm); }
.object-details { display: grid; align-content: start; gap: var(--ds-gap-md); }
.object-list h3, .object-details h3 { font: var(--ds-type-section); color: var(--ds-fg-strong); margin: 0 0 12px; }
.object-details h3, .object-details p { margin: 0; }
.object-details p { font: var(--ds-type-body); }
.object-details .caption { font: var(--ds-type-caption); color: var(--ds-fg-muted); }
@media (max-width: 640px) { .scene { padding: 16px; } }
```

</details>

## Дальше

- [«Плотность интерфейса»](../DsDensity/README.md) — размеры и отступы независимо от ширины окна.
- [Типографика](../DsType/README.md) — читаемость и длинные подписи.
- [Каркас страницы](../DsPageLayout/README.md) — готовая компоновка с боковыми регионами.
- [Решения по миграции](../DsBreakpointsDecisions/README.md) — состояние переноса приложения на общие диапазоны.
