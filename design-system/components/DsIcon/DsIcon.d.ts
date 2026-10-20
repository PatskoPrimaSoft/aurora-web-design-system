import * as React from 'react';

/** Иконка Material Symbols Outlined из локального шрифта; цвет наследуется от родителя. */
export interface DsIconProps {
  /** Имя глифа, например search, delete или local_shipping. */
  name: string;
  /** Предпочтительный способ задания размера глифа и его области. xs/sm/md/lg используют системные токены и автоматически учитывают плотность. Также поддерживаются число px и CSS-длина. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | number | (string & {});
  /** Поворот по часовой стрелке в градусах, когда направление передаёт смысл. */
  rotate?: number;
  /** Доступное имя самостоятельной смысловой иконки. Рядом с поясняющим текстом оставляйте декоративной. */
  label?: string;
  style?: React.CSSProperties;
}
export declare function DsIcon(props: DsIconProps): JSX.Element;
