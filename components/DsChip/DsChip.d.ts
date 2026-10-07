/** Компактный фильтр или удаляемое значение. */
export interface DsChipProps {
  /** Короткая текстовая подпись. */
  children?: React.ReactNode;
  /** Имя ведущей иконки DsIcon. */
  icon?: string;
  /** Выделение активного фильтра; состояние обновляет родитель. */
  selected?: boolean;
  /** Показывает крестик удаления. Имеет приоритет над режимом фильтра onClick. */
  removable?: boolean;
  /** Запрос удалить значение; список обновляет родитель. */
  onRemove?: () => void;
  /** Действие фильтра по клику, Enter или Space. */
  onClick?: (e: React.MouseEvent) => void;
  /** Блокирует выбор фильтра и удаление значения. */
  disabled?: boolean;
  /** Количество элементов справа от подписи; ноль также отображается. */
  count?: number;
  /** Полная подпись для скринридера и кнопки удаления. Обязательна, если children не текст. */
  ariaLabel?: string;
  /** Максимальная ширина в px; длинная подпись сокращается многоточием. Ширина также ограничена родителем. */
  maxWidth?: number;
}
export declare function DsChip(props: DsChipProps): JSX.Element;
