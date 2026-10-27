import { Routes } from '@angular/router';
import { foundationNavigation } from './navigation';
import { OverviewPageComponent } from './pages/foundations/overview/overview-page.component';
import { TypographyPageComponent } from './pages/foundations/typography/typography-page.component';
import { ComponentsIndexPageComponent } from './pages/components/index/components-index-page.component';
import { IconPageComponent } from './pages/components/icon/icon-page.component';
import { ButtonPageComponent } from './pages/components/button/button-page.component';
import { PendingPageComponent } from './pages/pending/pending-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';

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
  { path: 'components/icon', component: IconPageComponent, title: 'Icon — Aurora' },
  { path: 'components/button', component: ButtonPageComponent, title: 'Button — Aurora' },
  ...foundationNavigation
    .flatMap((group) => group.items)
    .filter((item) => !['/', '/foundations/typography'].includes(item.path))
    .map((item) => ({
      path: item.path.slice(1),
      component: PendingPageComponent,
      title: item.title + ' — Aurora',
    })),
  { path: '**', component: NotFoundPageComponent, title: 'Страница не найдена — Aurora' },
];
