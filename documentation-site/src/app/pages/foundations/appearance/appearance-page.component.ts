import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';

@Component({
  selector: 'aurora-appearance-page',
  imports: [RouterLink, ArticleLayoutComponent, ExampleBlockComponent],
  templateUrl: './appearance-page.component.html',
  styleUrl: './appearance-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppearancePageComponent {
  protected readonly settings = inject(SiteSettingsService);
}
