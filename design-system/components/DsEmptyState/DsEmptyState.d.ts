/** Объясняет отсутствие содержимого и предлагает следующий шаг. */
export interface DsEmptyStateProps {
  /** Действия с slot="action" или slot="secondary". */
  children?: React.ReactNode;
  /** Имя иконки Material Symbols Outlined; null скрывает иконку. */
  icon?: string | null;
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
  /** Уровень заголовка в структуре страницы; none выводит обычный текст. */
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'none';
  /** Объявление изменения: off для статичного состояния, polite для обычного результата, assertive для срочного. */
  announcement?: 'off' | 'polite' | 'assertive';
  /** Компактный вариант для узкой области. */
  size?: 'md' | 'sm';
}
export declare function DsEmptyState(props: DsEmptyStateProps): JSX.Element;
