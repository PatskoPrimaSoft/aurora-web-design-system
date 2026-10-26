/** Панель содержимого с шапкой, телом и необязательным подвалом. */
export interface DsPanelProps {
  /** Заголовок панели; по умолчанию уровня h2. */
  title?: React.ReactNode;
  /** Короткая категория над заголовком. */
  eyebrow?: React.ReactNode;
  /** Действия в правой части шапки; также принимаются через slot="actions". */
  actions?: React.ReactNode;
  /** Содержимое тела панели. */
  children?: React.ReactNode;
  /** Содержимое подвала; также принимается через slot="footer". */
  footer?: React.ReactNode;
  /** Внутренние отступы тела; отключите для таблицы или карты до краёв. */
  padding?: boolean;
  /** Прокрутка тела при ограниченной высоте панели; область доступна через Tab. */
  scroll?: boolean;
  /** Высота панели; число задаёт px, строка — CSS-размер. */
  height?: number | string;
  /** Убрать внешнюю рамку и скругление; внутренние разделители сохраняются. */
  flush?: boolean;
  /** Уровень заголовка в структуре страницы; none выводит обычный текст. */
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'none';
  /** Доступное имя панели без заголовка или вместо его текста. */
  'aria-label'?: string;
  /** ID элемента, который задаёт доступное имя; имеет приоритет над aria-label и title. */
  'aria-labelledby'?: string;
  /** ID внешнего контейнера панели. */
  id?: string;
  /** Стили тела, например display: 'block' для обычного потока вместо flex-колонки. */
  bodyStyle?: React.CSSProperties;
  /** Стили внешнего контейнера панели. */
  style?: React.CSSProperties;
}
export declare function DsPanel(props: DsPanelProps): React.JSX.Element;
