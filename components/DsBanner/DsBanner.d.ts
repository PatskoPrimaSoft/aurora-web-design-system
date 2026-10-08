export interface DsBannerProps {
  /** Смысл сообщения и оформление; не определяет срочность объявления. */
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  /** Краткий заголовок сообщения. */
  title?: React.ReactNode;
  /** Уровень заголовка по структуре страницы; none выводит обычный текст. */
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'none';
  /** off — статичное сообщение; polite — status; assertive — alert для срочного изменения. */
  announcement?: 'off' | 'polite' | 'assertive';
  /** Пояснение; дочерний элемент с slot="actions" задаёт область действий. */
  children?: React.ReactNode;
  /** Обычно одно действие, максимум два: кнопка исправляет условие, ссылка ведёт к пояснению. */
  actions?: React.ReactNode;
  /** Показывает кнопку закрытия; родитель сам убирает баннер из интерфейса. */
  onClose?: () => void;
  /** Доступное имя и подсказка кнопки закрытия; по умолчанию локализованное «Закрыть». */
  closeLabel?: string;
  /** Уменьшенные внутренние отступы для плотного интерфейса. */
  compact?: boolean;
}
export declare function DsBanner(props: DsBannerProps): JSX.Element;
