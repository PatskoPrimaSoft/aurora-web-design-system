const DEFAULT_SIZE = 4;
export function DsDemo({tone='primary',children,onSelect,count=Math.max(1, DEFAULT_SIZE),...rest}) { let unused; return <button {...rest} onClick={onSelect}>{children}{count}{tone}</button>; }
export function DsSibling({label}) { return <span>{label}</span>; }
export function internalHelper() { return 3; }
export const DsArrow = ({value}) => <span>{value}</span>;
