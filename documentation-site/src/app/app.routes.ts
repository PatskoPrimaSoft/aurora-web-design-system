import { Routes } from '@angular/router';
import { ButtonPageComponent } from './pages/components/button/button-page.component';
import { IconPageComponent } from './pages/components/icon/icon-page.component';
import { ComponentsIndexPageComponent } from './pages/components/index/components-index-page.component';
import { AccessibilityPageComponent } from './pages/foundations/accessibility/accessibility-page.component';
import { AppearancePageComponent } from './pages/foundations/appearance/appearance-page.component';
import { BreakpointsPageComponent } from './pages/foundations/breakpoints/breakpoints-page.component';
import { ChartsPageComponent } from './pages/foundations/charts/charts-page.component';
import { NeutralColorsPageComponent } from './pages/foundations/colors/colors-page.component';
import { ContentPageComponent } from './pages/foundations/content/content-page.component';
import { DensityPageComponent } from './pages/foundations/density/density-page.component';
import { FocusPageComponent } from './pages/foundations/focus/focus-page.component';
import { HoverPageComponent } from './pages/foundations/hover/hover-page.component';
import { IconographyPageComponent } from './pages/foundations/iconography/iconography-page.component';
import { LayoutPageComponent } from './pages/foundations/layout/layout-page.component';
import { LogoPageComponent } from './pages/foundations/logo/logo-page.component';
import { MotionPageComponent } from './pages/foundations/motion/motion-page.component';
import { OverviewPageComponent } from './pages/foundations/overview/overview-page.component';
import { ShapePageComponent } from './pages/foundations/shape/shape-page.component';
import { SortingPageComponent } from './pages/foundations/sorting/sorting-page.component';
import { SpacingPageComponent } from './pages/foundations/spacing/spacing-page.component';
import { StatusPageComponent } from './pages/foundations/status/status-page.component';
import { ThemeColorsPageComponent } from './pages/foundations/theme-colors/theme-colors-page.component';
import { ThemesPageComponent } from './pages/foundations/themes/themes-page.component';
import { TypographyPageComponent } from './pages/foundations/typography/typography-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';
import { TokensPageComponent } from './pages/tokens/tokens-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OverviewPageComponent,
    title: 'Прочитать первым — Aurora',
  },
  {
    path: 'foundations/typography',
    component: TypographyPageComponent,
    title: 'Типографика — Aurora',
  },
  { path: 'components', component: ComponentsIndexPageComponent, title: 'Компоненты — Aurora' },
  {
    path: 'foundations/colors',
    component: NeutralColorsPageComponent,
    title: 'Нейтральные цвета — Aurora',
  },
  { path: 'foundations/shape', component: ShapePageComponent, title: 'Форма и глубина — Aurora' },
  {
    path: 'foundations/spacing',
    component: SpacingPageComponent,
    title: 'Отступы и группировка — Aurora',
  },
  {
    path: 'foundations/breakpoints',
    component: BreakpointsPageComponent,
    title: 'Адаптивность и брейкпоинты — Aurora',
  },
  {
    path: 'foundations/appearance',
    component: AppearancePageComponent,
    title: 'Светлый и тёмный режим — Aurora',
  },
  {
    path: 'foundations/density',
    component: DensityPageComponent,
    title: 'Плотность интерфейса — Aurora',
  },
  {
    path: 'foundations/hover',
    component: HoverPageComponent,
    title: 'Наведение и нажатие — Aurora',
  },
  { path: 'foundations/focus', component: FocusPageComponent, title: 'Фокус — Aurora' },
  {
    path: 'foundations/iconography',
    component: IconographyPageComponent,
    title: 'Иконографика — Aurora',
  },
  { path: 'foundations/status', component: StatusPageComponent, title: 'Цвета статусов — Aurora' },
  {
    path: 'foundations/motion',
    component: MotionPageComponent,
    title: 'Анимация и переходы — Aurora',
  },
  {
    path: 'foundations/accessibility',
    component: AccessibilityPageComponent,
    title: 'Доступность — Aurora',
  },
  {
    path: 'foundations/content',
    component: ContentPageComponent,
    title: 'Тексты интерфейса — Aurora',
  },
  {
    path: 'foundations/layout',
    component: LayoutPageComponent,
    title: 'Сетка и компоновка — Aurora',
  },
  {
    path: 'foundations/sorting',
    component: SortingPageComponent,
    title: 'Сортировка вне таблицы — Aurora',
  },
  { path: 'foundations/themes', component: ThemesPageComponent, title: 'Цветовые темы — Aurora' },
  {
    path: 'foundations/theme-colors',
    component: ThemeColorsPageComponent,
    title: 'Подбор цветов темы — Aurora',
  },
  {
    path: 'foundations/charts',
    component: ChartsPageComponent,
    title: 'Цвета и оформление графиков — Aurora',
  },
  { path: 'foundations/logo', component: LogoPageComponent, title: 'Логотип бренда — Aurora' },
  { path: 'tokens', component: TokensPageComponent, title: 'Дизайн-токены — Aurora' },
  { path: 'components/icon', component: IconPageComponent, title: 'Icon — Aurora' },
  { path: 'components/button', component: ButtonPageComponent, title: 'Button — Aurora' },
  { path: '**', component: NotFoundPageComponent, title: 'Страница не найдена — Aurora' },
];
