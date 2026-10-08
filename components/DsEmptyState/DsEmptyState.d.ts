/** Объясняет отсутствие содержимого и предлагает следующий шаг. */
export interface DsEmptyStateProps {
  /** Действия с slot="action" или slot="secondary". */
  children?: React.ReactNode;
  /** Имя иконки Material Symbols Outlined, поясняющей причину отсутствия данных. */
  icon?: string;
  /** Короткое объяснение, чего нет. */
  title: React.ReactNode;
  /** Причина отсутствия данных и следующий шаг. */
  description?: React.ReactNode;
  /** Основное действие, обычно DsButton. */
  action?: React.ReactNode;
  /** Необязательное дополнительное действие с меньшим визуальным весом. */
  secondary?: React.ReactNode;
  /** Смысл ситуации; меняет цвет иконки. */
  tone?: 'neutral' | 'danger' | 'info' | 'warning';
  /** Компактный вариант для узкой области. */
  size?: 'md' | 'sm';
}
export declare function DsEmptyState(props: DsEmptyStateProps): JSX.Element;
