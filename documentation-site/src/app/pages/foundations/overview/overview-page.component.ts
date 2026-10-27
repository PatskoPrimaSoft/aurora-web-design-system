import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { SiteSettingsService } from '../../../site-settings.service';

@Component({
  selector: 'aurora-overview-page',
  imports: [RouterLink, ArticleLayoutComponent],
  templateUrl: './overview-page.component.html',
  styleUrl: './overview-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPageComponent {
  protected readonly settings = inject(SiteSettingsService);
}
