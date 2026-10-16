# Цвета и оформление графиков

## Пример кода

Готовый компонент: две серии скорости с устойчивыми цветами, разрывом телеметрии, подписанным порогом и доступными исходными данными. Легенда управляется самим DsChart. В примере собственный CSS добавляет пунктир линии Volvo; цвет серии закреплён явно.

<details>
<summary>Показать код графика и таблицы данных</summary>

```jsx
import { DsChart } from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

const categories = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
const series = [
  { name: 'МАЗ 5440', unit: 'км/ч', color: 'var(--ds-series-1)', data: [24, 48, 62, null, 54, 76, 60] },
  { name: 'Volvo FH16', unit: 'км/ч', color: 'var(--ds-series-2)', data: [40, 56, 48, 64, 72, 60, 44] },
];

export function SpeedChart() {
  return <section className="speed-chart" data-ds-theme="DEFAULT" data-ds-appearance="light" data-ds-density="cozy">
    <style>{`.speed-chart path[stroke="var(--ds-series-2)"] { stroke-dasharray: 6 4; }`}</style>
    <p>Нажмите название объекта в легенде, чтобы скрыть его линию. МАЗ — сплошная линия, Volvo — пунктир.</p>
    <DsChart title="Скорость объектов" subtitle="Сегодня · 08:00–14:00 · км/ч"
      categories={categories} series={series} height={220} yMin={0} yMax={100}
      thresholds={[{ value: 90, label: 'Лимит 90 км/ч', tone: 'danger' }]} />
    <p>В 11:00 нет данных МАЗ — линия прерывается.</p>
    <details>
      <summary>Показать данные графика</summary>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <caption>Скорость объектов, км/ч</caption>
          <thead><tr><th scope="col">Время</th>{series.map(item => <th scope="col" key={item.name}>{item.name}</th>)}</tr></thead>
          <tbody>{categories.map((time, index) => <tr key={time}>
            <th scope="row">{time}</th>
            {series.map(item => <td key={item.name}>{item.data[index] ?? 'Нет данных'}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
    </details>
  </section>;
}
```

</details>

## Дальше

- [График](../DsChart/README.md) — параметры и дополнительные сценарии.
- [Легенда](../DsChartLegend/README.md) — управление видимостью серий.
- [Цвета статусов](../DsStatus/README.md) — состояния и предупреждения.
