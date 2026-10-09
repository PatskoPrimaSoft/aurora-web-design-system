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
  /** Внутренние отступы и интервалы между регионами; false убирает их. */
  gap?: boolean;
  /** Нижний регион под основным содержимым и боковыми областями. */
  footer?: React.ReactNode;
}
export declare function DsPageLayout(props: DsPageLayoutProps): JSX.Element;
