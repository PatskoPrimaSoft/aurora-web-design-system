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

### Применение стандарта расстояний

Этот CSS применяет стандарт из справочника выше: промежуток колонок
уменьшается при ширине контейнера не больше 440 px. Число колонок здесь —
пример, его выбирают по задаче. Плотность наследуется из скоупа приложения.
Если горизонтальные поля уже заданы обёрткой, не добавляйте их второй раз.

```css
.product-grid-container {
  container-type: inline-size;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: var(--ds-gap-md);
  row-gap: var(--ds-gap-md);
  padding-inline: var(--ds-pad-md);
}

.product-grid > * {
  min-width: 0;
}

@container (max-width: 440px) {
  .product-grid {
    column-gap: var(--ds-gap-sm);
  }
}
```

Связанные темы: [отступы](../DsSpacing/README.md),
[адаптивность](../DsBreakpoints/README.md),
[React API и Angular UI kit](../../../ng-ui-kit/docs/adding-components.md).
