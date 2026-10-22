# Сетка и компоновка

Примеры и правила выбора регионов показаны выше. Размеры и поведение готового
каркаса описаны в [DsPageLayout](../DsPageLayout/README.md).

## Пример кода

Стили для собственной разметки: панель занимает ограниченную ширину,
а основной регион — остаток. В приложении поместите их в контейнер
`.workspace`. Интервалы берутся из существующих токенов. Порог 600 px выбран
для этого примера, а не является новым общим брейкпоинтом.

```css
@import '@primasoftllc/design-system/styles.css';

.workspace-container {
  container-type: inline-size;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 240px) minmax(0, 1fr);
  gap: var(--ds-gap-md);
}

.workspace > * {
  min-width: 0;
}

@container (max-width: 600px) {
  .workspace {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

Ширина 240 px служит только демонстрации. У DsPageLayout ширина боковой
панели по умолчанию определяется токеном `--ds-panel-w`.

Связанные темы: [отступы](../DsSpacing/README.md),
[адаптивность](../DsBreakpoints/README.md),
[React API и Angular UI kit](../../../ng-ui-kit/docs/adding-components.md).
