/** Группа связанных чипов с переносом строк и необязательной очисткой. */
export interface DsChipGroupProps {
  /** Чипы одного назначения: фильтры, удаляемые значения или постоянные метки. Пустая группа скрывается. */
  children?: React.ReactNode;
  /** Доступное название группы, например «Типы объектов». */
  ariaLabel: string;
  /** Запрос очистить значения или снять выбор; состояние обновляет родитель. Показывает кнопку очистки. */
  onClearAll?: () => void;
  /** Подпись кнопки очистки. По умолчанию — локализованное «Очистить все». */
  clearAllLabel?: string;
}
export declare function DsChipGroup(props: DsChipGroupProps): React.JSX.Element;
