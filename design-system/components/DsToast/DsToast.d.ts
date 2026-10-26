export interface DsToastProps {
  /** polite — status; assertive — alert для срочного сообщения; off — без объявления. */
  announcement?: 'polite' | 'assertive' | 'off';
  /** Автозакрытие в ms через onClose, 0 — выключено. Минимум 8000; warning/danger не закрываются автоматически. Таймер приостанавливается при наведении мыши и фокусе внутри. */
  autoDismiss?: number;
  /** Доступное имя и системная подсказка кнопки закрытия. */
  closeLabel?: string;
  /** Смысл сообщения и цвет иконки; срочность задаёт announcement. */
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  /** Краткий текст результата действия. */
  children?: React.ReactNode;
  /** Обработчик единственного действия, обычно отмены. */
  action?: () => void;
  /** Подпись действия; по умолчанию локализованное «Отменить». */
  actionLabel?: string;
  /** Показывает кнопку закрытия; родитель сам убирает тост. */
  onClose?: () => void;
  /** Имя иконки вместо стандартной для тона; neutral без icon не показывает иконку. */
  icon?: string;
}
export declare function DsToast(props: DsToastProps): React.JSX.Element;
export interface DsToastStackProps {
  /** DsToast со стабильными уникальными key, от старого к новому. Ожидающие тосты не монтируются до показа. */
  children?: React.ReactNode;
  /** Фиксированное размещение у нижнего края окна. */
  position?: 'bottom-center' | 'bottom-right';
  /** Доступное название группы и скрытый заголовок h2; по умолчанию локализованное «Уведомления». */
  label?: string;
  /** Максимум одновременно видимых тостов, включая уходящие; целое от 1. Остальные ждут освобождения места. */
  maxVisible?: number;
  /** Порядок видимых сообщений; newest-first показывает новые сверху. Очередь в обоих случаях поступает по порядку children. */
  order?: 'oldest-first' | 'newest-first';
  /** Portal в document.body. Для диалога задавайте container внутри его области фокуса. */
  portal?: boolean;
  /** Целевой DOM-контейнер portal; имеет приоритет над portal. */
  container?: HTMLElement | null;
  /** Куда вернуть фокус после закрытия последнего тоста с фокусом. Без пропа — элемент, активный при первом показе. */
  returnFocusRef?: React.RefObject<HTMLElement>;
}
export declare function DsToastStack(props: DsToastStackProps): React.JSX.Element;
