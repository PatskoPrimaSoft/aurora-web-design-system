# Плотность интерфейса

## Пример кода

Компактная область с готовыми компонентами. Поле и кнопка наследуют
плотность контейнера; промежуток между ними задаётся токеном.

```jsx
import {DsField, DsButton} from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

export function ObjectSearch() {
  return (
    <form data-ds-density="compact" onSubmit={event => event.preventDefault()}
      style={{display: 'grid', gap: 'var(--ds-gap-md)'}}>
      <DsField label="Поиск объекта" name="object" />
      <div><DsButton type="reset" tone="secondary">Сбросить</DsButton></div>
    </form>
  );
}
```

<details>
<summary>Полный код списка с поиском и сортировкой</summary>

Код воспроизводит список из сравнения. Плотность контейнера можно менять
между `cozy` и `compact` без изменения компонентов.

```jsx
import {useState} from 'react';
import {DsPanel, DsField, DsButton, DsTable} from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

const rows = [
  {id: 1, name: 'МАЗ 5440', speed: 62},
  {id: 2, name: 'Volvo FH16', speed: 0},
  {id: 3, name: 'ГАЗ Next', speed: 41},
  {id: 4, name: 'Renault T', speed: 0},
];
const columns = [
  {key: 'name', label: 'Объект', strong: true, sortable: true},
  {key: 'speed', label: 'Скорость, км/ч', mono: true, align: 'right', sortable: true},
];

export function ObjectList({density = 'cozy'}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({key: 'name', dir: 'asc'});
  const visible = rows
    .filter(row => row.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (sort.key === 'name'
      ? a.name.localeCompare(b.name) : a.speed - b.speed)
      * (sort.dir === 'asc' ? 1 : -1));

  return (
    <section data-ds-density={density}
      style={{background: 'var(--ds-bg)', color: 'var(--ds-fg)', padding: 24}}>
      <DsPanel title="Объекты" headingLevel="h3"
        bodyStyle={{gap: 'var(--ds-gap-md)'}}
        actions={<DsButton tone="secondary" onClick={() => setQuery('')}>Сбросить</DsButton>}>
        <DsField label="Поиск объекта" icon="search" placeholder="Название объекта"
          value={query} onChange={event => setQuery(event.target.value)} />
        <DsTable columns={columns} rows={visible} sortKey={sort.key} sortDir={sort.dir}
          onSort={(key, dir) => setSort({key, dir})}
          empty="Объекты не найдены" ariaLabel="Объекты и скорость" />
      </DsPanel>
    </section>
  );
}
```

</details>

## Дальше

- [Типографика](../DsType/README.md) — роли текста и читаемость данных.
- [Адаптивность и брейкпоинты](../DsBreakpoints/README.md) — размещение на узком экране.
- [Таблица](../DsTable/README.md) — сортировка, выбор строк и другие сценарии.
- [Светлый и тёмный режим](../DsAppearance/README.md) — оформление независимо от плотности.
