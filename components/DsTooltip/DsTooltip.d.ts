/** Текстовая подсказка для интерактивного элемента. */
export interface DsTooltipProps {
  /** Короткая дополнительная информация. Только текст; важные условия показывайте постоянно. */
  content: string;
  /** Один доступный с клавиатуры элемент, передающий ARIA-атрибуты и обработчики DOM-контролу. Ref сохраняется. */
  children: React.ReactElement;
  /** Предпочтительная сторона; при нехватке места сторона меняется автоматически. */
  placement?: 'top' | 'bottom';
  /** Отключает подсказку, например на время загрузки действия. */
  disabled?: boolean;
}
export declare function DsTooltip(props: DsTooltipProps): JSX.Element | null;
