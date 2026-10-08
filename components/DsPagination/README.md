## Правила применения

- Размещайте пагинацию в `footer` у DsTable или DsPanel, рядом с данными, которыми она управляет.
- `page` — индекс страницы с нуля, `length` — общее количество записей, а не страниц. `pageSize` должен быть положительным.
- Состоянием и загрузкой данных управляет родитель. При изменении размера страницы или фильтров сбрасывайте `page` в `0`; если число записей уменьшилось, не оставляйте индекс за пределами последней страницы.
- Выбор количества строк появляется только с `onPageSizeChange`. Передайте варианты в `pageSizeOptions`, включая текущее значение `pageSize`.
- Номера позволяют перейти сразу к нужной странице. Текущая страница выделена подложкой; многоточия не интерактивны. Количество позиций адаптируется к ширине самого компонента: пять в узкой области, семь — от 600 px.
- Для узкой панели используйте `compact`: останутся диапазон записей и переходы на соседние страницы.
- Задавайте `ariaLabel` по содержимому списка, например «Страницы объектов», особенно если на экране несколько пагинаций.
- Кнопки и выбор размера доступны с клавиатуры. При обновлении данных сохраняйте фокус на использованном контроле; результат перехода объявляйте в области данных через `aria-live="polite"`.

## Пример кода

```jsx
import { useState } from 'react';
import { DsPagination, DsTable } from '@primasoftllc/design-system';

export function PagedTable({ rows }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const lastPage = Math.max(0, Math.ceil(rows.length / pageSize) - 1);
  const currentPage = Math.min(page, lastPage);
  const start = currentPage * pageSize;

  return (
    <div>
      <DsTable
        columns={[{ key: 'name', label: 'Название' }]}
        rows={rows.slice(start, start + pageSize)}
        footer={
          <DsPagination
            ariaLabel="Страницы таблицы"
            page={currentPage}
            pageSize={pageSize}
            length={rows.length}
            pageSizeOptions={[10, 25, 50]}
            onPageChange={setPage}
            onPageSizeChange={size => {
              setPageSize(size);
              setPage(0);
            }}
          />
        }
      />
      <p role="status">
        {rows.length === 0
          ? 'Нет записей'
          : `Записи ${start + 1}–${Math.min(start + pageSize, rows.length)} из ${rows.length}`}
      </p>
    </div>
  );
}
```
