/** Части длительности в строковом виде; пустая строка — незаполненный сегмент. */
export interface DsDurationValue { d?: string; h?: string; m?: string }
/** Ввод длительности в днях, часах и минутах. */
export interface DsDurationProps {
  /** Подпись над полем. */
  label?: string;
  /** Значения сегментов; компонент не нормализует диапазоны. */
  value?: DsDurationValue;
  /** Новое значение после ввода цифр; дни ограничены тремя цифрами, часы и минуты — двумя. */
  onChange?: (value: DsDurationValue) => void;
  /** Пояснение под полем, если нет ошибки или предупреждения. */
  hint?: string;
  /** Сообщение об ошибке; имеет приоритет над warning и hint. */
  error?: string;
  /** Предупреждение с выделенной рамкой и пояснением; имеет приоритет над hint. */
  warning?: string;
  /** Показать сегмент дней; скрытие не удаляет d из value. */
  showDays?: boolean;
  /** Заблокировать ввод во всех сегментах и исключить их из последовательности Tab. */
  disabled?: boolean;
  /** Ширина внешнего контейнера; число в px, строка — CSS-размер. */
  width?: number | string;
}
export declare function DsDuration(props: DsDurationProps): React.JSX.Element;
