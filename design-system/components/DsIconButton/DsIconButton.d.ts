import * as React from 'react';

/** Компактная кнопка с иконкой и обязательным доступным именем. */
export interface DsIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Имя иконки Material Symbols Outlined. */
  icon: string;
  /** Визуально скрытый текст внутри кнопки задаёт доступное имя; также используется в системной подсказке. */
  label: string;
  /** Роль действия; onHeader — для шапки, inverse — для инверсной поверхности. */
  tone?: 'ghost' | 'secondary' | 'primary' | 'danger' | 'onHeader' | 'inverse';
  /** Размер кнопки; фактические размеры зависят от плотности интерфейса. */
  size?: 'sm' | 'md' | 'lg';
  /** Состояние переключателя и aria-pressed. У обычного действия параметр опускайте. */
  active?: boolean;
  /** Спиннер и блокировка повторного действия с сохранением размеров, тона и фокуса. */
  loading?: boolean;
  /** Недоступность действия. Причину показывайте рядом с кнопкой. */
  disabled?: boolean;
  /** Индикатор применённой настройки; не заменяет числовой счётчик. */
  dot?: boolean;
  /** Поворот иконки в градусах, например для направления курса. */
  rotate?: number;
  /** Обработчик нажатия доступной кнопки. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Тип HTML-кнопки; по умолчанию button. */
  type?: 'button' | 'submit' | 'reset';
}
export declare function DsIconButton(props: DsIconButtonProps): JSX.Element;
