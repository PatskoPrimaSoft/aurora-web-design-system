import * as React from 'react';

/** Границы периода: календарные даты либо местные дата и время; пустая строка — нет границы. */
export interface DsDateRangeValue { from: string; to: string }
/** Готовый период, рассчитанный приложением в выбранном часовом поясе. */
export interface DsDateRangePreset { id: string; label: string; value: DsDateRangeValue; disabled?: boolean }
/** Ввод двух границ; одинаковые границы допустимы, обратный порядок блокирует отправку. */
export interface DsDateRangePickerProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue' | 'children'> {
  /** Управляемые границы; использовать с onChange. */
  value?: DsDateRangeValue;
  /** Начальные границы неуправляемого периода; reset формы восстанавливает их. */
  defaultValue?: DsDateRangeValue;
  /** Вызывается после изменения одной границы или выбора готового периода. */
  onChange?: (value: DsDateRangeValue, event?: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => void;
  /** date — YYYY-MM-DD; datetime — YYYY-MM-DDTHH:mm, без преобразования в UTC. */
  granularity?: 'date' | 'datetime';
  /** Заголовок fieldset; по умолчанию локализованный «Период». */
  label?: string;
  /** Подпись начальной границы; по умолчанию «От». */
  fromLabel?: string;
  /** Подпись конечной границы; по умолчанию «До». */
  toLabel?: string;
  /** Видимая подпись часового пояса приложения, например Europe/Minsk; только пояснение, без пересчёта значений. */
  timeZone: string;
  /** Готовые периоды приложения; «сегодня» определяется приложением, не системными часами компонента. */
  presets?: DsDateRangePreset[];
  /** Общая нижняя включительная граница обоих полей. */
  min?: string;
  /** Общая верхняя включительная граница обоих полей. */
  max?: string;
  /** Шаг: дни для date, секунды для datetime; any снимает ограничение. */
  step?: number | 'any';
  /** Требовать заполнения обеих границ. */
  required?: boolean;
  /** Имя создаёт два поля FormData: name.from и name.to. */
  name?: string;
  /** Явное имя начальной границы вместо name.from. */
  fromName?: string;
  /** Явное имя конечной границы вместо name.to. */
  toName?: string;
  /** ID внешней формы; назначается обоим полям и fieldset. */
  form?: string;
  /** Блокирует оба поля и кнопки готовых периодов. */
  disabled?: boolean;
  /** Оставляет поля доступными для фокуса, запрещает ввод и выбор готовых периодов. */
  readOnly?: boolean;
  /** Пояснение периода, связанное с обоими полями. */
  hint?: string;
  /** Внешняя ошибка, показывается у конечной границы и блокирует отправку формы. */
  error?: string;
}
export declare const DsDateRangePicker: React.ForwardRefExoticComponent<DsDateRangePickerProps & React.RefAttributes<HTMLFieldSetElement>>;
