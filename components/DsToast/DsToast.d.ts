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
export declare function DsToast(props: DsToastProps): JSX.Element;
export interface DsToastStackProps {
  /** Тосты в порядке появления; новое сообщение добавляется последним. */
  children?: React.ReactNode;
  /** Фиксированное размещение у нижнего края окна. */
  position?: 'bottom-center' | 'bottom-right';
}
export declare function DsToastStack(props: DsToastStackProps): JSX.Element;
