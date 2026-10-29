import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { SiteSettingsService } from '../../../site-settings.service';
@Component({
  selector: 'aurora-breakpoint-migration-page',
  imports: [RouterLink, ArticleLayoutComponent],
  templateUrl: './breakpoint-migration-page.component.html',
  styleUrl: './breakpoint-migration-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreakpointMigrationPageComponent {
  protected readonly settings = inject(SiteSettingsService);
}
