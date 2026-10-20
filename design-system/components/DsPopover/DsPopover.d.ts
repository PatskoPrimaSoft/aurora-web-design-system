export interface DsPopoverTriggerProps {
  'data-ds-popover-trigger': string;
  'aria-haspopup': 'dialog';
  'aria-expanded': boolean;
  'aria-controls'?: string;
  onClick: React.MouseEventHandler<HTMLElement>;
}
/** Небольшая немодальная панель рядом с управляющим элементом. */
export interface DsPopoverProps {
  /** Кнопка или функция, передающая полученные атрибуты и обработчик одной кнопке. Ref элемента сохраняется. */
  trigger: React.ReactElement | ((props: DsPopoverTriggerProps) => React.ReactElement);
  /** Содержимое панели. close закрывает её и возвращает фокус на кнопку. */
  children?: React.ReactNode | ((controls: {close: () => void}) => React.ReactNode);
  /** Обязательное доступное имя панели; назовите задачу или содержимое. */
  label: string;
  /** Управляемое состояние; используйте вместе с onOpenChange. */
  open?: boolean;
  /** Начальное раскрытие в неуправляемом режиме. */
  defaultOpen?: boolean;
  /** Запрос изменения состояния после нажатия, Escape или ухода из панели. */
  onOpenChange?: (open: boolean) => void;
  /** Предпочтительная сторона; автоматически меняется при нехватке места. */
  placement?: 'top' | 'bottom';
  /** Край привязки панели к кнопке. */
  align?: 'start' | 'end';
  /** Ширина в px либо по содержимому; ограничена доступной шириной экрана. */
  width?: number | 'auto';
}
export declare function DsPopover(props: DsPopoverProps): JSX.Element;
