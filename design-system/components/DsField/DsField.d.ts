import * as React from 'react';

/** Поле с подписью для текста, числа, выбора и многострочного ввода. */
export interface DsFieldOwnProps {
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
  /** Разрешить фокус и копирование без редактирования input или textarea; у select не применяется. */
  readOnly?: boolean;
  /** Автоматически увеличивать и уменьшать textarea по содержимому; rows задаёт начальную высоту. */
  autoResize?: boolean;
  /** Максимальная высота textarea: число в px или CSS-размер. */
  maxHeight?: number | string;
  /** Показать счётчик символов textarea; maxLength задаёт лимит. Счётчик не является live region. */
  showCount?: boolean;
  /** Стабильный ID нативного поля; без него генерируется автоматически. */
  id?: string;
}
export type DsFieldAs = 'input' | 'select' | 'textarea';
export type DsFieldElement<T extends DsFieldAs> = T extends 'select' ? HTMLSelectElement : T extends 'textarea' ? HTMLTextAreaElement : HTMLInputElement;
type NativeFieldProps<T extends DsFieldAs> = T extends 'select' ? React.SelectHTMLAttributes<HTMLSelectElement> : T extends 'textarea' ? React.TextareaHTMLAttributes<HTMLTextAreaElement> : React.InputHTMLAttributes<HTMLInputElement>;
export type DsFieldProps<T extends DsFieldAs = 'input'> = Omit<DsFieldOwnProps, 'as'> & { as?: T; /** Ссылка на нативный input, select или textarea; позволяет перевести фокус из формы. */ ref?: React.Ref<DsFieldElement<T>> } & Omit<NativeFieldProps<T>, keyof DsFieldOwnProps | 'size'>;
export declare function DsField<T extends DsFieldAs = 'input'>(props: DsFieldProps<T>): React.JSX.Element;
