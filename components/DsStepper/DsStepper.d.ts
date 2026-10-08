export interface DsStep {
  /** Стабильный ключ шага. */
  id?: string;
  /** Короткое название этапа. */
  label: React.ReactNode;
  /** Краткое пояснение под названием. */
  hint?: string;
  /** Запрещает переход к шагу, включая завершённый. */
  disabled?: boolean;
}
export interface DsStepperProps {
  /** Этапы в порядке прохождения. */
  steps?: DsStep[];
  /** Индекс текущего шага с нуля; игнорируется при isComplete. */
  active?: number;
  /** Выбор текущего или завершённого доступного шага. Без обработчика — только чтение. */
  onSelect?: (index: number) => void;
  /** Завершённые индексы; по умолчанию — все перед active. Текущий шаг сохраняет номер. */
  completed?: number[];
  /** Вся задача завершена: все шаги с галочками, текущего нет. */
  isComplete?: boolean;
  /** Доступное имя последовательности; по умолчанию — из словаря DsStrings. */
  ariaLabel?: string;
}
export declare function DsStepper(props: DsStepperProps): JSX.Element;
