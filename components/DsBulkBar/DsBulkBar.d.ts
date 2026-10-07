/** Панель общих действий над выбранными строками таблицы. */
export interface DsBulkBarProps {
  /** Число выбранных строк. При нуле панель не отображается. */
  count?: number;
  /** Число строк в отфильтрованном результате. Вместе с onSelectAll включает кнопку выбора всех. */
  total?: number;
  /** Название объектов во множественном числе, например «объектов». */
  noun?: string;
  /** Запрос выбрать весь результат (true). Сброс вызывает false, если onClear не задан. Родитель обновляет count. */
  onSelectAll?: (all: boolean) => void;
  /** Запрос очистить выбор по кнопке «Снять выбор». Имеет приоритет над onSelectAll(false). */
  onClear?: () => void;
  /** Кнопки общих действий: DsButton или DsIconButton. */
  actions?: React.ReactNode;
  /** Альтернатива actions: дочерний элемент с slot="actions". */
  children?: React.ReactNode;
  /** Приподнятая поверхность, усиленная рамка и тень; без floating — обычная поверхность без тени. Позиционирование задаёт родитель. */
  floating?: boolean;
  /** Стили корневой панели, например перенос содержимого на узком экране. */
  style?: React.CSSProperties;
}
export declare function DsBulkBar(props: DsBulkBarProps): JSX.Element;
