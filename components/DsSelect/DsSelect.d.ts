import * as React from 'react';
export interface DsSelectOption { value: string; label: string; disabled?: boolean }
/** Выбор одного значения из списка, оформленного токенами системы. */
export interface DsSelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onChange' | 'name' | 'form' | 'type'> {
  /** Видимая подпись. Без неё задайте aria-label или aria-labelledby. */
  label?: string;
  /** Строки или пары value/label с необязательным disabled; значения должны быть уникальными и непустыми. */
  options?: Array<string | DsSelectOption>;
  /** Текущее значение управляемого выбора; пустая строка означает отсутствие выбора. */
  value?: string;
  /** Начальное значение неуправляемого выбора; восстанавливается при сбросе формы. */
  defaultValue?: string;
  /** Новое значение и вариант после подтверждения выбора. */
  onChange?: (value: string, option: DsSelectOption) => void;
  /** Текст, когда значение не выбрано; без него используется строка из DsStringsProvider. */
  placeholder?: string;
  /** Подсказка, связанная с полем. */
  hint?: string;
  /** Сообщение об ошибке; заменяет hint и выделяет рамку. */
  error?: string;
  /** Запретить раскрытие и исключить поле из Tab и данных формы. */
  disabled?: boolean;
  /** Обязательный выбор с нативной проверкой формы и фокусом на контроле при ошибке. */
  required?: boolean;
  /** Имя значения в данных формы. */
  name?: string;
  /** ID связанной формы, если контрол расположен вне неё. */
  form?: string;
  /** Стабильный ID контрола; иначе генерируется автоматически. */
  id?: string;
  /** Ширина внешнего контейнера: число в px или CSS-размер. */
  width?: number | string;
  /** Максимальная высота раскрытого списка в px; дополнительно ограничивается доступным экраном. */
  maxHeight?: number;
  /** Фокус на контроле. */
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  /** Выход фокуса из контрола. */
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  /** Внешний обработчик клавиатуры; preventDefault отменяет внутреннюю обработку. */
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  /** Доступное имя без видимой подписи. */
  'aria-label'?: string;
  /** ID внешней подписи; имеет приоритет над собственной. */
  'aria-labelledby'?: string;
  /** Дополнительные ID описаний, объединяемые с подсказкой или ошибкой. */
  'aria-describedby'?: string;
  /** Ссылка на кнопку combobox для перевода фокуса. */
  ref?: React.Ref<HTMLButtonElement>;
}
export declare function DsSelect(props: DsSelectProps): JSX.Element;
