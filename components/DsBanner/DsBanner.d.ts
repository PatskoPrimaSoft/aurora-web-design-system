export interface DsBannerProps {
  /** Смысл сообщения и оформление; danger объявляется как alert, остальные — как status. */
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  /** Краткий заголовок сообщения. */
  title?: React.ReactNode;
  /** Пояснение; дочерний элемент с slot="actions" задаёт область действий. */
  children?: React.ReactNode;
  /** Действия для устранения условия, обычно одна кнопка. */
  actions?: React.ReactNode;
  /** Показывает кнопку закрытия; родитель сам убирает баннер из интерфейса. */
  onClose?: () => void;
  /** Уменьшенные внутренние отступы для плотного интерфейса. */
  compact?: boolean;
}
export declare function DsBanner(props: DsBannerProps): JSX.Element;
