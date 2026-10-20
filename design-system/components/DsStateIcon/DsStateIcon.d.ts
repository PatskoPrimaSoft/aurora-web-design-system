/** Индикатор состояния объекта мониторинга с направлением движения. */
export interface DsStateIconProps {
  /** Состояние объекта: определяет глиф, его цвет и подложку диска. */
  state?: 'moving' | 'parked' | 'offline' | 'invalid' | 'alarm' | 'nodata';
  /** Курс в градусах: 0 — север, 90 — восток. Поворот только для moving. */
  course?: number;
  /** Диаметр диска в px. Глиф: 16 при size ≤ 20, 20 при size ≤ 28, иначе 24; не больше size. */
  size?: number;
  /** Убирает диск; размер глифа по-прежнему определяется через size. */
  bare?: boolean;
  /** Доступное имя и нативная подсказка вместо подписи из словаря локализации. */
  label?: string;
  /** Скрывает индикатор от скринридера и убирает подсказку, если состояние уже дано текстом. */
  decorative?: boolean;
}
export declare function DsStateIcon(props: DsStateIconProps): JSX.Element;
/** Общий словарь глифов, тонов и русских подписей состояний объекта. */
export declare const dsFleetState: Record<'moving' | 'parked' | 'offline' | 'invalid' | 'alarm' | 'nodata',
  { glyph: string; tone: 'success' | 'neutral' | 'danger' | 'info' | 'warning'; label: string }>;
