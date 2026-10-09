/** Управляемая настройка с немедленным применением. Дорожка — 36 × 20 px. */
export interface DsSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'checked' | 'defaultChecked' | 'children' | 'onChange' | 'disabled' | 'readOnly' | 'style'> {
  /** Постоянная видимая подпись. Без неё задайте aria-label или aria-labelledby. */
  label?: React.ReactNode;
  /** Пояснение, связанное с input через aria-describedby. */
  description?: string;
  /** Текущее значение настройки; обновляйте через onChange. */
  checked?: boolean;
  /** Запрещает изменение и исключает input из порядка Tab. */
  disabled?: boolean;
  /** Показывает спиннер, блокирует изменение и сохраняет фокус. */
  loading?: boolean;
  /** Нативное событие изменения. Без обработчика — только статичный образец. */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export declare const DsSwitch: React.ForwardRefExoticComponent<DsSwitchProps & React.RefAttributes<HTMLInputElement>>;
