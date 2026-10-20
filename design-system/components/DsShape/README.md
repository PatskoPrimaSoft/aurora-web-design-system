# Форма и глубина

## Пример кода

Для обычной панели используйте готовый `DsPanel`: поверхность, граница
и скругление уже настроены. Вложенные компоненты оформляют себя сами.

```jsx
import { DsPanel, DsField } from '@primasoftllc/design-system';

<DsPanel title="МАЗ 5440" headingLevel="h3">
  <DsField label="Водитель" defaultValue="Андрей Иванов" readOnly />
</DsPanel>
```

Если создаёте собственный контейнер, используйте токены в его стилях:

```css
.region {
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
}
```

## Дальше

- [Нейтральные цвета](../DsNeutrals/README.md) — поверхности и границы.
- [DsPanel](../DsPanel/README.md) — контейнер для связанных данных.
- [DsMenu](../DsMenu/README.md) — готовое меню действий.
- [DsDialog](../DsDialog/README.md) — модальный диалог.
