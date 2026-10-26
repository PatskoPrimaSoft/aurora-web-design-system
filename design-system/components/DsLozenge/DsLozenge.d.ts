/** Компактная неинтерактивная метка статуса или значимого атрибута объекта. */
export interface DsLozengeProps {
  /** Смысловой тон статуса, общий для всех брендов. */
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  /** Сплошная заливка для цветной поверхности или карты. */
  solid?: boolean;
  /** Точка перед текстом; предпочтительна для состояния связи. */
  dot?: boolean;
  /** Имя иконки перед текстом. */
  icon?: string;
  /** Размер метки. */
  size?: 'sm' | 'md';
  /** Текст статуса или значимого атрибута. */
  children?: React.ReactNode;
}
export declare function DsLozenge(props: DsLozengeProps): React.JSX.Element;