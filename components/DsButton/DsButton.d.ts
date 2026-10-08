/** Кнопка действия. Размеры зависят от плотности интерфейса. */
export interface DsButtonProps {
  /** Визуальная важность действия; danger — разрушительное действие. */
  tone?: 'primary' | 'secondary' | 'subtle' | 'ghost' | 'danger' | 'accent';
  /** Высота кнопки из токенов плотности. */
  size?: 'sm' | 'md' | 'lg';
  /** Имя Material Symbols Outlined, иконка перед текстом. */
  icon?: string;
  /** Иконка после текста. Скрывается во время загрузки. */
  iconRight?: string;
  /** Спиннер вместо левой иконки; повторное нажатие недоступно. */
  loading?: boolean;
  /** Отключает действие и исключает кнопку из последовательности Tab. */
  disabled?: boolean;
  /** Растягивает кнопку на ширину родителя. */
  fullWidth?: boolean;
  /** Видимая подпись действия. */
  children?: React.ReactNode;
  /** Вызывается при активации доступной кнопки мышью или клавиатурой. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Поведение в форме; для отправки задайте submit. */
  type?: 'button' | 'submit' | 'reset';
}
export declare function DsButton(props: DsButtonProps): JSX.Element;
/** Общее правило наведения и нажатия DsButton, DsIconButton и DsFab. Обработчики rest вызываются после внутренних. */
export declare function usePress(disabled: boolean, rest?: Record<string, any>): {
  hover: boolean; pressed: boolean; handlers: Record<string, (e: any) => void>; rest: Record<string, any>;
};
