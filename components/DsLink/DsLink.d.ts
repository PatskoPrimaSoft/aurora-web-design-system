/** Ссылка с нативным переходом; для действий используйте DsButton. */
export interface DsLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Адрес страницы, файла или существующего якоря. */
  href: string;
  /** Понятное название назначения. */
  children: React.ReactNode;
  /** _blank добавляет noopener noreferrer и исключает opener. */
  target?: React.HTMLAttributeAnchorTarget;
  /** Дополнительные отношения ссылки, например author. */
  rel?: string;
}
export declare const DsLink: React.ForwardRefExoticComponent<DsLinkProps & React.RefAttributes<HTMLAnchorElement>>;
