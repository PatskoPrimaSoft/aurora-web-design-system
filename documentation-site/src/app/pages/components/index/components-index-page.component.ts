import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { RouterLink } from '@angular/router';
import { SiteSettingsService } from '../../../site-settings.service';
@Component({
  selector: 'aurora-components-index-page',
  imports: [ArticleLayoutComponent, RouterLink],
  templateUrl: './components-index-page.component.html',
  styleUrl: './components-index-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentsIndexPageComponent {
  protected readonly settings = inject(SiteSettingsService);
}
