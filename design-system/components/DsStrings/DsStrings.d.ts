/** Flat strings/formatters and groups of interface strings. */
export type DsStringValue = string | ((...args: any[]) => string);
export interface DsStrings {
  close: string;
  remove: string;
  removeItem: (label: string) => string;
  clear: string;
  clearAll: string;
  search: string;
  filters: string;
  loading: string;
  back: string;
  noData: string;
  apply: string;
  undo: string;
  select: string;
  selectItem: (name: string) => string;
  selectAllIn: (title: string) => string;
  selectAllObjects: string;
  clearSelection: string;
  expand: (title: string) => string;
  collapse: (title: string) => string;
  tree: { selected: (selected: number, total: number) => string };
  unread: (count: number) => string;
  objects: (count: number) => string;
  online: string;
  state: Record<'moving' | 'parked' | 'offline' | 'invalid' | 'alarm' | 'nodata', string>;
  freshness: Record<'live' | 'recent' | 'late' | 'none', string>;
  signal: Record<'good' | 'weak' | 'none', string>;
  filter: Record<'contains' | 'from' | 'to' | 'asc' | 'desc' | 'rangeInvalid' | 'resetSort', string>;
  table: {
    sort: (label: string, dir: 'asc' | 'desc') => string;
    selectPage: string;
    pageSelected: (count: number) => string;
    selectAllResults: (count: number) => string;
    allSelected: (count: number) => string;
    clearSelection: string;
  };
  bulk: {
    toolbar: (count: number) => string;
    selected: string;
    allSelected: (selection: string) => string;
    deselectAll: string;
    selectAll: (count: number) => string;
  };
  pagination: {
    label: string;
    page: (page: number) => string;
    rows: string;
    range: (from: number, to: number, total: number) => string;
    first: string;
    prev: string;
    next: string;
    last: string;
  };
  selectField: { selection: (labels: string) => string; placeholder: string; empty: string; noResults: string; loading: string; clear: string; search: string; required: string};
  field: {count: (used: number, max?: number) => string};
  radio: {required: string};
  progress: {percent: (percent: number) => string};
  breadcrumbs: {label: string};
  date: {date: string; time: string; dateTime: string; from: string; to: string; range: string; rangeInvalid: string; required: string; invalid: string; min: (value: string) => string; max: (value: string) => string; step: string; timeZone: (zone: string) => string};
  duration: Record<'days' | 'hours' | 'minutes' | 'd' | 'h' | 'm', string>;
  chart: Record<'zoom' | 'data' | 'invalid' | 'settings' | 'reset' | 'download', string>;
  score: Record<'label' | 'bad' | 'norm' | 'good' | 'best', string>;
  toast: {label: string};
  layout: {skip: string; left: string; right: string};
  tabs: {nav: string};
  stepper: {label: string; position: (n: number, total: number) => string; current: string; completed: string; upcoming: string; disabled: string};
}
/** Group overrides are shallow, matching the provider's inherited dictionary merge. */
export type DsStringsOverrides = {
  [Key in keyof DsStrings]?: DsStrings[Key] extends (...args: any[]) => string
    ? DsStrings[Key]
    : DsStrings[Key] extends object ? Partial<DsStrings[Key]> : DsStrings[Key];
} & Record<string, DsStringValue | Record<string, DsStringValue | undefined> | undefined>;
export interface DsStringsProviderProps {
  /** Flat values and partial groups override the inherited dictionary. */
  strings?: DsStrings | DsStringsOverrides;
  children?: React.ReactNode;
}
export declare function DsStringsProvider(props: DsStringsProviderProps): React.JSX.Element;
export declare function useDsStrings(): DsStrings;
export declare const dsStringsRu: DsStrings;
export declare const dsStringsEn: DsStrings;
