import * as React from 'react';
export interface DsRadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}
/** Группа для выбора одного значения с нативной отправкой и сбросом формы. */
export interface DsRadioGroupProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>,'onChange'|'defaultValue'> {
  /** Общая видимая подпись группы. */
  label: React.ReactNode;
  /** Варианты с уникальными непустыми value; подписи могут переноситься. */
  options?: DsRadioOption[];
  /** Управляемый выбор. Пустая строка означает отсутствие выбора. */
  value?: string;
  /** Начальный выбор и значение после нативного reset. */
  defaultValue?: string;
  /** Получает выбранное значение и событие нативного input. */
  onChange?: (value: string,event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Имя выбранного значения в FormData. У независимых групп имена различаются. */
  name?: string;
  /** ID формы, если группа находится вне неё. */
  form?: string;
  /** Нативная обязательность выбора, ошибка показывается после отправки. */
  required?: boolean;
  /** Запретить изменение и исключить значения из FormData. */
  disabled?: boolean;
  /** Постоянное пояснение группы. */
  hint?: string;
  /** Ошибка группы, заменяющая hint. Проверку серверных условий выполняет приложение. */
  error?: string;
  /** Вертикальный список или горизонтальный ряд с переносом. */
  orientation?: 'vertical' | 'horizontal';
  /** Стабильный ID fieldset. */
  id?: string;
  /** Стили внешнего контейнера. */
  style?: React.CSSProperties;
}
export declare function DsRadioGroup(props: DsRadioGroupProps): React.JSX.Element;
