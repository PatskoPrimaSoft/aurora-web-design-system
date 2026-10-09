import * as React from 'react';
export interface DsSelectOption { value: string; label: string; disabled?: boolean }
export interface DsSelectGroup { label: string; options: Array<string | DsSelectOption> }
/** Выбор одного или нескольких значений из списка, оформленного токенами системы. */
export interface DsSelectProps<Multiple extends boolean = false> extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onChange' | 'name' | 'form' | 'type'> {
  /** Несколько значений: массивы value/defaultValue и onChange, удаляемые чипы и чекбоксы в списке. */
  multiple?: Multiple;
  /** Видимая подпись. Без неё задайте aria-label или aria-labelledby. */
  label?: string;
  /** Строки, варианты value/label или группы label/options; значения уникальные и непустые. */
  options?: Array<string | DsSelectOption | DsSelectGroup>;
  /** Текущее значение: строка для одного выбора, массив строк при multiple; пустое состояние — пустая строка или []. */
  value?: Multiple extends true ? string[] : string;
  /** Начальное значение или массив при multiple; сброс формы восстанавливает его. В multiple по умолчанию []. */
  defaultValue?: Multiple extends true ? string[] : string;
  /** В одиночном режиме — значение и вариант (очистка: пустая строка/null); при multiple — массивы значений и вариантов (очистка: []/[]). */
  onChange?: (value: Multiple extends true ? string[] : string, option: Multiple extends true ? DsSelectOption[] : DsSelectOption | null) => void;
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
  /** Имя значения в данных формы; при multiple читайте FormData.getAll(name). */
  name?: string;
  /** ID связанной формы, если контрол расположен вне неё. */
  form?: string;
  /** Стабильный ID контрола; иначе генерируется автоматически. */
  id?: string;
  /** Ширина внешнего контейнера: число в px или CSS-размер. */
  width?: number | string;
  /** Максимальная высота раскрытого списка в px; дополнительно ограничивается доступным экраном. */
  maxHeight?: number;
  /** Ввод поиска внутри раскрытого списка; фильтрует варианты по вхождению текста. */
  searchable?: boolean;
  /** Очистка кнопкой или Delete на закрытом поле; в multiple передаёт []/[], Backspace удаляет последнее значение. */
  clearable?: boolean;
  /** Загрузка вариантов: показывает индикатор, сохраняет значение и временно запрещает выбор. */
  loading?: boolean;
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
export declare function DsSelect<Multiple extends boolean = false>(props: DsSelectProps<Multiple>): JSX.Element;
