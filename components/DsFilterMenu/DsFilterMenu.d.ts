/** Редактор фильтра: черновик применяется по кнопке, результат виден в кнопке открытия. */
export interface DsFilterOption {
  value: string;
  label: string;
  count?: number;
  /** Запрещает выбор варианта, сохраняя уже выбранное значение. */
  disabled?: boolean;
  /** Пояснение под названием; для disabled укажите причину недоступности. */
  description?: string;
  /** `sort-by` only: direction labels, e.g. `asc: 'Oldest first'` / `desc: 'Newest first'`. */
  asc?: string;
  desc?: string;
  /** `sort-by` only: this option groups rather than orders — no direction pair. */
  group?: boolean;
}
/** Подписанная группа вариантов в раскрытом списке. */
export interface DsFilterOptionGroup {
  label: string;
  options: Array<string | DsFilterOption>;
}
export type DsFilterRange<T> = { from: T | null; to: T | null };
export type DsFilterValue =
  | string | number | null | undefined
  | DsFilterRange<number> | DsFilterRange<string>
  | string[]
  | { key: string; dir: 'asc' | 'desc' | null };
export interface DsFilterMenuProps {
  /** Column or attribute name. Also the popover's heading. */
  label?: string;
  /**
   * All eight v1 filter types. `sort-by` is the sort menu for surfaces with no
   * column headers (object panel, tree, card list): a radio list of fields, plus
   * one ascending / descending pair when the value is held as `{key, dir}`.
   */
  type?: 'string' | 'number' | 'number-range' | 'date' | 'date-range' | 'checkbox-list' | 'radio' | 'sort-by';
  /**
   * Applied value. Empty is only `null` / `undefined`: `0`, negative numbers and a
   * range starting at zero are real values and render as such.
   * - `string`: `string | null`
   * - `number`: `number | null` (a cleared field yields `null`, never `''`)
   * - `number-range`: `{ from: number | null, to: number | null }`
   * - `date`: `'YYYY-MM-DD' | null`; `date-range`: `{ from, to }` of those
   * - `checkbox-list`: `string[]`; `radio`: `string`; `sort-by`: `string` or `{ key, dir }`
   * Legacy string values (`'5'`, `{from: '', to: ''}`) are still read correctly.
   */
  value?: DsFilterValue;
  /** Плоский список или подписанные группы; значение checkbox-list остаётся массивом строк. */
  options?: Array<string | DsFilterOption | DsFilterOptionGroup>;
  /** Called with the draft value on Apply. */
  onApply?: (value: DsFilterValue) => void;
  /** Сброс применённого значения. Для sort-by восстанавливает исходный порядок через «Сбросить порядок». Без обработчика «Очистить» передаёт пустое значение в onApply. */
  onClear?: () => void;
  /** Формат применённого значения в кнопке, например единицы измерения или локальная дата. */
  formatValue?: (value: DsFilterValue) => string;
  /** Replace the default button. DsFilterMenu attaches the click handler itself. */
  trigger?: React.ReactNode;
  width?: number;
  /** Поиск по названию вариантов; сохраняет группировку. Для списочных типов. */
  searchable?: boolean;
  /** Загрузка вариантов: сохраняет значение, временно блокирует выбор и применение. */
  loading?: boolean;
  /** Запрещает открытие редактора и очистку значения. */
  disabled?: boolean;
  /** Максимальная высота поповера в px; дополнительно ограничивается экраном. */
  maxHeight?: number;
}
export declare function DsFilterMenu(props: DsFilterMenuProps): JSX.Element;
