import * as React from 'react';
/** Прогресс операции. Для оценки величины используйте DsScoreBar. */
export interface DsProgressBarProps {
  /** Видимое и доступное имя операции. */
  label: string;
  /** Выполненное количество; null/undefined/нечисловые значения означают неопределённый прогресс. Конечные значения ограничиваются 0…max. */
  value?: number | null;
  /** Общее количество, по умолчанию 100. Неположительное или неконечное заменяется на 100. */
  max?: number;
  /** Человекочитаемый результат, например «320 из 500 объектов». */
  valueText?: string;
  /** Показывать текст прогресса рядом с названием; доступное описание остаётся. */
  showValue?: boolean;
  /** Основной цвет процесса или успешное завершение. */
  tone?: 'primary' | 'success';
  id?: string;
  style?: React.CSSProperties;
}
export declare function DsProgressBar(props: DsProgressBarProps): JSX.Element;
