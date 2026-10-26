export interface DsBreadcrumbItem {
  /** Стабильный ключ, если состав цепочки меняется. */
  id?: string;
  /** Название уровня, совпадающее с названием страницы. */
  label: React.ReactNode;
  /** Адрес предка. Последний пункт всегда текст текущей страницы. */
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  /** Обработчик ссылки предка; обычные переходы не требуют обработчика. */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}
export interface DsBreadcrumbsProps {
  /** Уровни от корня к текущей странице. Пустая цепочка не отображается. */
  items?: DsBreadcrumbItem[];
  /** Доступное имя навигации; по умолчанию берётся из DsStringsProvider. */
  'aria-label'?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function DsBreadcrumbs(props: DsBreadcrumbsProps): React.JSX.Element | null;
