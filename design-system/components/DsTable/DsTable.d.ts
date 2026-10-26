/** Столбец таблицы: данные, оформление и доступные действия. */
export interface DsTableColumn {
  /** Ключ поля строки и идентификатор столбца для сортировки. */
  key: string;
  /** Заголовок столбца. */
  label: string;
  /** Ширина столбца в px или CSS-значение. */
  width?: number | string;
  /** Выравнивание заголовка и ячеек. */
  align?: 'left' | 'right' | 'center';
  /** Кнопка сортировки в заголовке; требует onSort. Сортирует данные экран. */
  sortable?: boolean;
  /** Опорный столбец с кнопкой открытия строки; иначе используется первый. */
  rowAction?: boolean;
  /** Метаданные поля сортировки для экрана. onSort передаёт key; сопоставление выполняет потребитель. */
  sortBy?: string;
  /** Моноширинный текст для номеров, времени и координат. */
  mono?: boolean;
  /** Выделение опорной ячейки средним начертанием. */
  strong?: boolean;
  /** Вторичный цвет текста. */
  muted?: boolean;
  /** Разрешает перенос текста; по умолчанию ячейка однострочная. */
  wrap?: boolean;
  /** Содержимое ячейки; получает всю строку. */
  render?: (row: any) => React.ReactNode;
}
export interface DsTableProps {
  /** Дочерние элементы со slot="empty" или slot="footer". */
  children?: React.ReactNode;
  /** Столбцы в порядке отображения. */
  columns?: DsTableColumn[];
  /** Видимые строки; фильтрацию, сортировку и пагинацию выполняет экран. */
  rows?: any[];
  /** Поле уникального стабильного идентификатора строки. */
  rowKey?: string;
  /** Показывает чекбоксы строк и выбора видимой страницы. */
  selectable?: boolean;
  /** Выбранные ID, в том числе с других страниц. */
  selectedIds?: Array<string | number>;
  /** Запрос на переключение выбора строки. */
  onToggleRow?: (id: string | number) => void;
  /** Выбрать или снять выбор видимых ID. Выбор остальных строк сохраняет потребитель. */
  onToggleVisible?: (visibleIds: Array<string | number>, next: 'checked' | 'unchecked') => void;
  /** @deprecated Используйте onToggleVisible. Вызывается, если onToggleVisible отсутствует. */
  onToggleAll?: (next?: 'checked' | 'unchecked') => void;
  /** Размер всей выборки. Вместе с onSelectAll включает предложение выбрать все результаты. */
  totalCount?: number;
  /** Выбрана вся выборка, включая невидимые строки; состоянием управляет экран. */
  allSelected?: boolean;
  /** Запрос на выбор всей выборки после выбора видимой страницы. */
  onSelectAll?: () => void;
  /** Запрос на снятие выбора всей выборки. */
  onClearSelection?: () => void;
  /** Ключ единственного столбца с текущей сортировкой. */
  sortKey?: string;
  /** Направление текущей сортировки. */
  sortDir?: 'asc' | 'desc';
  /** Ключ столбца и следующее направление; экран обновляет данные и сбрасывает страницу. */
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  /** ID объекта под просмотром: фон выделения и полоса слева, независимо от чекбоксов. */
  activeId?: string | number;
  /** Открытие строки мышью или кнопкой в опорном столбце. */
  onRowClick?: (row: any) => void;
  /** Имя объекта для чекбокса. По умолчанию — значение опорного столбца. */
  rowLabel?: (row: any) => string;
  /** Закрепляет заголовок внутри области прокрутки таблицы. */
  stickyHeader?: boolean;
  /** Видимая подпись таблицы; также служит её доступным именем. */
  caption?: string;
  /** Доступное имя, если подпись не нужна или требуется уточнение. */
  ariaLabel?: string;
  /** Фиксирует раскладку столбцов: width задаёт ширины, остальные делят свободное место. */
  fixedLayout?: boolean;
  /** Содержимое при отсутствии строк; по умолчанию локализованное «Нет данных». */
  empty?: React.ReactNode;
  /** Подвал: например, DsPagination или сводка выбора. */
  footer?: React.ReactNode;
}
export declare function DsTable(props: DsTableProps): React.JSX.Element;
/** Состояние выбора видимых строк для собственного заголовка. */
export declare function dsVisibleSelection(visibleIds: Array<string | number>, selectedIds: Array<string | number>, allSelected?: boolean): 'unchecked' | 'indeterminate' | 'checked';
