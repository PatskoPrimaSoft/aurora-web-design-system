import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { DisclosureComponent } from '../../../shared/disclosure/disclosure.component';

@Component({
  selector: 'aurora-typography-page',
  imports: [RouterLink, ArticleLayoutComponent, DisclosureComponent],
  templateUrl: './typography-page.component.html',
  styleUrl: './typography-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypographyPageComponent {
  protected readonly settings = inject(SiteSettingsService);
}
