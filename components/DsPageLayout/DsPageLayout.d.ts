/** Каркас страницы с основным и необязательными боковыми регионами. */
export interface DsPageLayoutProps {
  /** Шапка приложения, например DsAppHeader. */
  header?: React.ReactNode;
  /** Заголовок страницы под шапкой приложения. */
  pageHeader?: React.ReactNode;
  /** Левый боковой регион. */
  left?: React.ReactNode;
  /** Правый боковой регион. */
  right?: React.ReactNode;
  /** Основное содержимое страницы. */
  children?: React.ReactNode;
  /** Ширина левого региона; по умолчанию var(--ds-panel-w). Число в px или CSS-длина. */
  leftWidth?: number | string;
  /** Ширина правого региона. Число в px или CSS-длина. */
  rightWidth?: number | string;
  /** Интервалы между регионами и их детьми; также определяет padding, если тот не задан. */
  gap?: boolean;
  /** Нижний регион под основным содержимым и боковыми областями. */
  footer?: React.ReactNode;
  /** Внутренние отступы каркаса, независимо от gap.
   * @default Значение gap
   */
  padding?: boolean;
  /** На узкой ширине каркаса панели скрыты и раскрываются кнопками в потоке страницы. */
  responsive?: boolean;
  /** Ширина каркаса в px, ниже которой включается узкая раскладка при responsive=true. */
  responsiveBreakpoint?: number;
  /** Минимальное место для основного региона в px: при нехватке места responsive сворачивает панели раньше порога. */
  mainMinWidth?: number;
  /** none — прокруткой владеет приложение; page — весь каркас; regions — отдельные регионы. Для page/regions родитель задаёт высоту. */
  scroll?: 'none' | 'page' | 'regions';
  /** Идентификатор основного региона для ссылки перехода; без него создаётся уникальный. */
  mainId?: string;
  /** Содержательное доступное имя левого региона и его кнопки раскрытия. */
  leftLabel?: string;
  /** Содержательное доступное имя правого региона и его кнопки раскрытия. */
  rightLabel?: string;
  /** Показывать ссылку перехода к содержимому при фокусе с клавиатуры. */
  skipLink?: boolean;
  /** Подпись ссылки перехода; по умолчанию из общего словаря. */
  skipLinkLabel?: string;
}
export declare function DsPageLayout(props: DsPageLayoutProps): JSX.Element;
