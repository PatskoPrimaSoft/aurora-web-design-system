import * as React from 'react';

/** Плавающая кнопка действия над содержимым. */
export interface DsFabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Имя иконки Material Symbols Outlined. */
  icon?: string;
  /** Обязательное доступное название; в extended также видимая подпись. */
  label: string;
  /** Показывает подпись рядом с иконкой и меняет круг на пилюлю. */
  extended?: boolean;
  /** Цветовое выделение; surface использует нейтральную поверхность текущей темы. */
  tone?: 'primary' | 'accent' | 'surface';
  /** Высота: sm — 40 px, md — 48 px, lg — 56 px; не зависит от плотности. */
  size?: 'sm' | 'md' | 'lg';
  /** Показывает спиннер, сохраняя размер, тон и фокус; блокирует повторное действие. */
  loading?: boolean;
  /** Блокирует действие и исключает кнопку из последовательности Tab. */
  disabled?: boolean;
  /** Вызывается при активации доступной кнопки мышью или клавиатурой. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Тип HTML-кнопки; по умолчанию button. */
  type?: 'button' | 'submit' | 'reset';
}
export declare function DsFab(props: DsFabProps): JSX.Element;
