/** Панель содержимого с шапкой, телом и необязательным подвалом. */
export interface DsPanelProps {
  /** Заголовок панели уровня h2. */
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
  /** Прокрутка тела при ограниченной высоте панели. */
  scroll?: boolean;
  /** Высота панели; число задаёт px, строка — CSS-размер. */
  height?: number | string;
  /** Убрать внешнюю рамку и скругление; внутренние разделители сохраняются. */
  flush?: boolean;
  /** Стили тела, например display: 'block' для обычного потока вместо flex-колонки. */
  bodyStyle?: React.CSSProperties;
  /** Стили внешнего контейнера панели. */
  style?: React.CSSProperties;
}
export declare function DsPanel(props: DsPanelProps): JSX.Element;
