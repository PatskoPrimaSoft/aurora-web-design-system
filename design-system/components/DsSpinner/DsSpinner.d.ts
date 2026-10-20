export interface DsSpinnerProps {
  /** Задержка появления в ms; место сохраняется, доступное объявление начинается после задержки. */
  delay?: number;
  /** Диаметр в px: 16–20 для строки, 32 для области, 48 для страницы. */
  size?: number;
  /** Толщина кольца в px; без значения вычисляется из диаметра. */
  thickness?: number;
  /** Цвет кольца; inverse наследует currentColor родителя. */
  tone?: 'brand' | 'muted' | 'inverse';
  /** Доступное название операции; без значения используется строка загрузки из DsStringsProvider. */
  label?: string;
}
export declare function DsSpinner(props: DsSpinnerProps): JSX.Element;
export interface DsSkeletonProps {
  /** Пульсация блока; отключается при prefers-reduced-motion независимо от этого параметра. */
  animated?: boolean;
  /** Ширина блока: число в px или CSS-значение, например 70%. */
  width?: number | string;
  /** Высота блока: число в px или CSS-значение. */
  height?: number | string;
  /** Скругление блока; 50% для круга при равных ширине и высоте. */
  radius?: string;
}
export declare function DsSkeleton(props: DsSkeletonProps): JSX.Element;
