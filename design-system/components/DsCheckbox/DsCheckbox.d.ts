export type DsCheckboxState = 'unchecked' | 'checked' | 'indeterminate';

/** Чекбокс и радио с единой управляемой моделью выбора. */
export interface DsCheckboxProps {
  /** Текущее состояние. Для радио indeterminate отображается как unchecked. */
  state?: DsCheckboxState;
  /** Получает новое состояние при выборе. Потребитель обновляет state; частичный выбор становится полным. */
  onChange?: (nextState: 'unchecked' | 'checked') => void;
  /** Видимая подпись; нажатие на неё переключает выбор. */
  label?: React.ReactNode;
  /** Доступное имя. Обязательно, если нет видимой подписи. */
  ariaLabel?: string;
  /** Пояснение под подписью, связанное с input для вспомогательных технологий. */
  description?: string;
  /** Выбор одного варианта из группы с нативным поведением радио. */
  radio?: boolean;
  /** Запрещает взаимодействие и исключает контрол из порядка Tab. */
  disabled?: boolean;
  /** Имя поля формы. У радио одной группы должно совпадать. */
  name?: string;
  /** Значение выбранного поля при отправке формы. */
  value?: string;
  /** Минимальная сторона области нажатия. @default var(--ds-control-h) */
  hit?: number | string;
}
export declare function DsCheckbox(props: DsCheckboxProps): React.JSX.Element;
