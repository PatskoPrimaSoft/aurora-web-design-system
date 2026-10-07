/** Строка объекта с основной областью и независимыми дополнительными действиями. */
export interface DsListRowProps {
  /** Дочерние элементы со slot="actions" или slot="badge". */
  children?: React.ReactNode;
  /** Основное название объекта; сокращается при нехватке места. */
  title?: React.ReactNode;
  /** Номер, время или пояснение; по умолчанию обычный шрифт. */
  subtitle?: React.ReactNode;
  /** Моноширинный подзаголовок для номеров и времени. */
  subtitleMono?: boolean;
  /** Статусный символ DsStateIcon; имеет приоритет над icon. */
  state?: 'moving' | 'parked' | 'offline' | 'invalid' | 'alarm' | 'nodata';
  /** Направление в градусах для state="moving". */
  course?: number;
  /** Короткое значение справа: скорость, топливо, количество. */
  value?: React.ReactNode;
  /** Дополнительная подпись под value; без value не отображается. */
  valueMeta?: React.ReactNode;
  /** Имя Material Symbols; используется, если не задан state. */
  icon?: string;
  /** Открытый для просмотра объект: подложка, полоса слева и aria-current. Независим от selected. */
  active?: boolean;
  /** Подложка множественного выбора. Доступный контрол выбора задаёт родитель. */
  selected?: boolean;
  /** Нажатие основной кнопки. При as="div" не вызывается. */
  onClick?: () => void;
  /** Адрес перехода. Создаёт нативную ссылку вместо кнопки, кроме as="div". */
  href?: string;
  /** Цель открытия ссылки, например _blank. */
  target?: string;
  /** Отношение ссылки. Для target="_blank" по умолчанию noopener noreferrer. */
  rel?: string;
  /** Независимые кнопки действий с доступными именами; имя показывается в подсказке. */
  actions?: React.ReactNode;
  /** Резерв ширины действий в px, в том числе без actions. Одинаковый для строк одного списка. */
  actionsWidth?: number;
  /** Короткая неинтерактивная метка DsLozenge после названия. */
  badge?: React.ReactNode;
  /** div отключает действие и ссылку. Без href и onClick основная область всегда div. @default button */
  as?: 'button' | 'div';
}
export declare function DsListRow(props: DsListRowProps): JSX.Element;
