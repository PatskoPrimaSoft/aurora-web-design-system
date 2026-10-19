import * as React from 'react';

/** День без времени и часового пояса. Значение YYYY-MM-DD, без автоматического преобразования в UTC. */
export interface DsDatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'size'> {
  /** Контекстная подпись поля. Если подпись скрыта, передайте aria-label. */
  label?: string;
  /** Постоянная подсказка; заменяется сообщением об ошибке. */
  hint?: string;
  /** Ошибка приложения: показывается сразу и блокирует нативную отправку формы. */
  error?: string;
  /** Текущее значение YYYY-MM-DD или пустая строка; применять с onChange. */
  value?: string;
  /** Начальное неуправляемое значение; восстанавливается при form.reset(). */
  defaultValue?: string;
  /** Новая строка и нативное событие React; пустая строка означает очистку. */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Нижняя включительная граница в том же формате, что value. */
  min?: string;
  /** Верхняя включительная граница в том же формате, что value. */
  max?: string;
  /** Шаг в днях; any снимает ограничение шага. */
  step?: number | 'any';
  /** Нативная обязательность; ошибка появляется после blur или попытки отправки. */
  required?: boolean;
  /** Исключает поле из Tab и FormData. */
  disabled?: boolean;
  /** Запрещает редактирование, сохраняя фокус и участие в FormData. */
  readOnly?: boolean;
  /** Имя поля в FormData. */
  name?: string;
  /** ID связанной формы, если поле расположено вне неё. */
  form?: string;
  /** Ширина оболочки; число в px или CSS-размер. */
  width?: number | string;
  /** Обычная подпись сверху либо подпись в рамке. */
  labelMode?: 'top' | 'notch';
}
export declare const DsDatePicker: React.ForwardRefExoticComponent<DsDatePickerProps & React.RefAttributes<HTMLInputElement>>;
