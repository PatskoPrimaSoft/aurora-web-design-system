export interface DsDemoProps {
  /** Цветовой вариант. */
  tone?: 'primary' | 'secondary';
  children: React.ReactNode;
  onSelect?: (value: string) => void;
  /** @default Минимум один элемент, значение DEFAULT_SIZE ограничивается снизу. */
  count?: number;
}
export declare function DsDemo(props: DsDemoProps): JSX.Element;
export declare function DsSibling(props: {label: string}): JSX.Element;
export declare const DsArrow: React.FC<{value: number}>;
