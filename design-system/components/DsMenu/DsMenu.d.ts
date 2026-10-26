/** Выпадающее меню действий или выбора, привязанное к кнопке. */
export interface DsMenuItem {
  id?: string;
  label?: React.ReactNode;
  icon?: string;
  /** Действие, одиночный или множественный выбор. */
  type?: 'action' | 'radio' | 'checkbox';
  /** Закрывать после выбора; по умолчанию checkbox остаётся открытым. */
  closeOnSelect?: boolean;
  /** Видимая подсказка сочетания клавиш; обработчик реализует приложение. */
  shortcut?: string;
  /** Выбранное значение для radio/checkbox; хранит потребитель. Без type — только галочка. */
  checked?: boolean;
  /** Выделение действия с существенными последствиями. */
  tone?: 'default' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
  /** Разделитель вместо пункта; остальные поля не используются. */
  divider?: boolean;
}
export interface DsMenuProps {
  /** Кнопка раскрытия. Меню добавляет обработчик и атрибуты ARIA. */
  trigger?: React.ReactNode;
  /** Пункты действий или выбора и разделители. */
  items?: DsMenuItem[];
  /** Выбор доступного пункта; вызывается перед его onClick. */
  onSelect?: (item: DsMenuItem) => void;
  /** Край панели, совмещённый с краем кнопки. */
  align?: 'start' | 'end';
  /** Ширина в px или auto по содержимому; ограничивается шириной экрана. */
  width?: number | 'auto';
  /** Отдельное доступное имя панели; иначе используется имя кнопки. */
  menuLabel?: string;
  /** Короткий контекст над пунктами без интерактивных элементов. */
  header?: React.ReactNode;
  /** Короткое пояснение под пунктами без интерактивных элементов. */
  footer?: React.ReactNode;
  /** Управляемое раскрытие; передавайте вместе с onOpenChange. */
  open?: boolean;
  /** Запрос на открытие или закрытие меню. */
  onOpenChange?: (open: boolean) => void;
}
export declare function DsMenu(props: DsMenuProps): React.JSX.Element;
export interface DsUserMenuProps {
  name?: React.ReactNode;
  email?: string;
  avatarSrc?: string;
  items?: DsMenuItem[];
  onSelect?: (item: DsMenuItem) => void;
}
export declare function DsUserMenu(props: DsUserMenuProps): React.JSX.Element;
