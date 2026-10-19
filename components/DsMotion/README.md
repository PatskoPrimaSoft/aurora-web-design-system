## Для разработчика

<details>
<summary>Токены и пример кода</summary>

| Токен | Применение |
| --- | --- |
| `ds-transition-control` | Переход фона, границы, цвета и тени контрола. |
| `ds-dur-fast` | 120 ms — короткие переходы контролов. |
| `ds-dur` | 180 ms — базовая длительность, например для тени шапки. |
| `ds-ease` | Общая кривая плавности. |

Это токены для собственной разметки. Компоненты загрузки и уведомлений имеют свои анимации; не переопределяйте их длительности глобально.

Переход в собственной разметке. Готовые компоненты уже подключают нужные стили.

```css
.custom-control { transition: var(--ds-transition-control); }
@media (prefers-reduced-motion: reduce) {
  .custom-control { transition: none; }
}
```

</details>

## Дальше

- [Наведение и нажатие](../DsHover/README.md)
- [Spinner](../DsSpinner/README.md)
- [Skeleton](../DsSkeleton/README.md)
