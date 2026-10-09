/** Поле с подписью для текста, числа, выбора и многострочного ввода. */
export interface DsFieldProps {
  /** Подпись, связанная с нативным полем ввода. */
  label?: string;
  /** Постоянная подсказка под полем; заменяется сообщением error. */
  hint?: string;
  /** Ошибка: выделяет рамку и задаёт aria-invalid. Проверку выполняет потребитель. */
  error?: string;
  /** Нативное обязательное заполнение; отметка рядом с обычной подписью. */
  required?: boolean;
  /** top — подпись над полем; notch — в рамке для соседства с устаревшими формами. */
  labelMode?: 'top' | 'notch';
  /** Нативный элемент, который отображается внутри оболочки. */
  as?: 'input' | 'select' | 'textarea';
  /** HTML-тип обычного input, например text, number, email или time. */
  type?: string;
  /** Текущее значение управляемого поля; используйте с onChange. */
  value?: string | number;
  /** Начальное значение неуправляемого поля; не передавайте вместе с value. */
  defaultValue?: string | number;
  /** Событие изменения нативного поля; новое значение находится в event.target. */
  onChange?: (e: React.ChangeEvent<HTMLElement>) => void;
  /** Подсказка внутри пустого поля; не заменяет label. */
  placeholder?: string;
  /** Варианты для select: строки или пары value/label. */
  options?: Array<string | { value: string; label: string }>;
  /** Имя Material Symbols Outlined перед значением. */
  icon?: string;
  /** Единица измерения или короткое пояснение справа; не выводится у select. */
  suffix?: string;
  /** Моноширинное значение для идентификаторов и чисел. */
  mono?: boolean;
  /** Заблокировать редактирование и исключить поле из последовательности Tab. */
  disabled?: boolean;
  /** Начальное число видимых строк textarea. */
  rows?: number;
  /** Ширина внешнего контейнера; число в px, строка — CSS-размер. */
  width?: number | string;
  /** Стабильный ID нативного поля; без него генерируется автоматически. */
  id?: string;
}
export declare function DsField(props: DsFieldProps): JSX.Element;
