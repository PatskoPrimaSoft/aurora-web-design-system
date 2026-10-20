export interface DsTabItem {
  id: string;
  label: React.ReactNode;
  /** Имя иконки Material Symbols Outlined. */
  icon?: string;
  /** Счётчик во всех вариантах; у stacked-вкладки расположен на иконке. */
  badge?: number | string;
}
interface DsTabsCommonProps {
  /** Уникальный префикс связи с DsTabPanel; обязателен для underline и segmented, совпадает у группы и панелей. */
  idBase?: string;
  /** Доступное название группы; внутри DsAppHeader название навигации задаёт шапка. */
  'aria-label'?: string;
  /** Вкладки с уникальными id. */
  items?: DsTabItem[];
  /** id выбранной вкладки. */
  active?: string;
  /** Выбор вкладки; родитель обновляет active. */
  onChange?: (id: string) => void;
  /** onHeader — разделы приложения; underline — вкладки страницы; segmented — короткие варианты. */
  tone?: 'onHeader' | 'underline' | 'segmented';
  /** Иконка над подписью; только для onHeader. false — иконка и подпись в строку. */
  stack?: boolean;
}
/** Для вкладок страницы idBase обязателен; навигация в шапке не связана с панелями. */
export type DsTabsProps = DsTabsCommonProps & (
  | { tone: 'onHeader'; idBase?: string }
  | { tone?: 'underline' | 'segmented'; idBase: string }
);
export declare function DsTabs(props: DsTabsProps): JSX.Element;
export interface DsTabPanelProps {
  /** Тот же префикс, что у связанной группы DsTabs. */
  idBase: string;
  /** id соответствующей вкладки. */
  id: string;
  /** Показывает панель. Содержимое монтируется при первом открытии и сохраняется при скрытии. */
  active: boolean;
  /** Размонтировать содержимое скрытой панели и сбросить его локальное состояние. */
  unmountOnHide?: boolean;
  children?: React.ReactNode;
  /** Стили контейнера панели. */
  style?: React.CSSProperties;
}
export declare function DsTabPanel(props: DsTabPanelProps): JSX.Element;
/** Контекст размещения вкладок внутри шапки приложения. */
export declare const DsInHeader: React.Context<boolean>;
/** Идентификаторы связанной вкладки и панели. */
export declare function dsTabIds(idBase: string, id: string): {tabId: string; panelId: string};
