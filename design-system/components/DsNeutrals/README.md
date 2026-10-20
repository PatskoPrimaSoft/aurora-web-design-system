# Нейтральные цвета

## Пример кода

Готовые компоненты оформляют свои заголовки, подписи и состояния.
В этом примере цвет текста отдельно не задаётся: его выбирают DsPanel
и DsField, а обычный текст наследует цвет страницы.

```jsx
import { DsPanel, DsField } from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

function VehiclePanel() {
  return (
    <DsPanel title="МАЗ 5440" eyebrow="Объект" headingLevel="h3">
      <p>Маршрут Минск — Брест</p>
      <DsField
        label="Водитель"
        defaultValue="Андрей Иванов"
        readOnly
        hint="Последнее сообщение — 14:32"
      />
    </DsPanel>
  );
}
```

Внешние отступы и промежутки между дочерними элементами задаёт родитель.
Цветовые токены из справочника нужны при создании собственной разметки
и стилей. Токен `--ds-type-title` задаёт параметры шрифта; сам по себе
он не назначает цвет. Готовый заголовок DsPanel объединяет нужные стили.

## Дальше

- [Типографика](../DsType/README.md) — размер, вес и иерархия текста.
- [Оформление интерфейса](../DsAppearance/README.md) — светлый и тёмный режимы.
- [Статусные цвета](../DsStatus/README.md) — цвет состояния и обратной связи.
- [Hover](../DsHover/README.md) — правила наведения и нажатия.
- [Форма и глубина](../DsShape/README.md) — скругления и тени.
- [Atlassian: Color](https://atlassian.design/foundations/color/) — роли, выразительность и состояния цвета.
- [Atlassian: Elevation](https://atlassian.design/foundations/elevation/) — уровни поверхностей.
