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
  unread: (count: number) => string;
  objects: (count: number) => string;
  online: string;
  state: Record<'moving' | 'parked' | 'offline' | 'invalid' | 'alarm' | 'nodata', string>;
  freshness: Record<'live' | 'recent' | 'late' | 'none', string>;
  signal: Record<'good' | 'weak' | 'none', string>;
  filter: Record<'contains' | 'from' | 'to' | 'asc' | 'desc', string>;
  table: {
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
  duration: Record<'days' | 'hours' | 'minutes' | 'd' | 'h' | 'm', string>;
  chart: Record<'zoom' | 'data' | 'invalid' | 'settings' | 'reset' | 'download', string>;
  score: Record<'label' | 'bad' | 'norm' | 'good' | 'best', string>;
  tabs: {nav: string};
}
/** Group overrides are shallow, matching the provider's inherited dictionary merge. */
export type DsStringsOverrides = {
  [Key in keyof DsStrings]?: DsStrings[Key] extends (...args: any[]) => string
    ? DsStrings[Key]
    : DsStrings[Key] extends object ? Partial<DsStrings[Key]> : DsStrings[Key];
} & Record<string, DsStringValue | Record<string, DsStringValue | undefined> | undefined>;
export interface DsStringsProviderProps {
  /** Flat values and partial groups override the inherited dictionary. */
  strings?: DsStringsOverrides;
  children?: React.ReactNode;
}
export declare function DsStringsProvider(props: DsStringsProviderProps): JSX.Element;
export declare function useDsStrings(): DsStrings;
export declare const dsStringsRu: DsStrings;
export declare const dsStringsEn: DsStrings;
