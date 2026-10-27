export interface NavigationItem {
  title: string;
  path: string;
}
export interface NavigationGroup {
  id: string;
  section: keyof typeof navigationSectionTitles;
  level: 1 | 2;
  title: string;
  items: NavigationItem[];
}
export const navigationSectionTitles = {
  start: 'Начало',
  foundations: 'Основы',
  components: 'Компоненты',
};
export const foundationNavigation: NavigationGroup[] = [
  {
    id: 'start',
    section: 'start',
    level: 1,
    title: navigationSectionTitles.start,
    items: [
      { title: 'Прочитать первым', path: '/' },
      { title: 'Токены', path: '/tokens' },
    ],
  },
  {
    id: 'general',
    section: 'foundations',
    level: 2,
    title: 'Общие правила',
    items: [
      { title: 'Доступность', path: '/foundations/accessibility' },
      { title: 'Тексты интерфейса', path: '/foundations/content' },
    ],
  },
  {
    id: 'visual',
    section: 'foundations',
    level: 2,
    title: 'Визуальный язык',
    items: [
      { title: 'Типографика', path: '/foundations/typography' },
      { title: 'Нейтральные цвета', path: '/foundations/colors' },
      { title: 'Иконографика', path: '/foundations/iconography' },
      { title: 'Форма и глубина', path: '/foundations/shape' },
      { title: 'Цвета статусов', path: '/foundations/status' },
    ],
  },
  {
    id: 'modes',
    section: 'foundations',
    level: 2,
    title: 'Режимы интерфейса',
    items: [
      { title: 'Светлый и тёмный режим', path: '/foundations/appearance' },
      { title: 'Плотность интерфейса', path: '/foundations/density' },
    ],
  },
  {
    id: 'states',
    section: 'foundations',
    level: 2,
    title: 'Состояния контролов',
    items: [
      { title: 'Наведение и нажатие', path: '/foundations/hover' },
      { title: 'Фокус', path: '/foundations/focus' },
      { title: 'Анимация и переходы', path: '/foundations/motion' },
    ],
  },
  {
    id: 'layout',
    section: 'foundations',
    level: 2,
    title: 'Компоновка и данные',
    items: [
      { title: 'Сетка и компоновка', path: '/foundations/layout' },
      { title: 'Отступы и группировка', path: '/foundations/spacing' },
      { title: 'Адаптивность и брейкпоинты', path: '/foundations/breakpoints' },
      { title: 'Сортировка вне таблицы', path: '/foundations/sorting' },
      { title: 'Цвета и оформление графиков', path: '/foundations/charts' },
    ],
  },
  {
    id: 'brand',
    section: 'foundations',
    level: 2,
    title: 'Бренд и темы',
    items: [
      { title: 'Цветовые темы', path: '/foundations/themes' },
      { title: 'Подбор цветов темы', path: '/foundations/theme-colors' },
      { title: 'Логотип бренда', path: '/foundations/logo' },
    ],
  },
];
export const componentNavigation: NavigationGroup[] = [
  {
    id: 'buttons-icons',
    section: 'components',
    level: 2,
    title: 'Кнопки и иконки',
    items: [
      { title: 'Button', path: '/components/button' },
      { title: 'Icon', path: '/components/icon' },
    ],
  },
];
