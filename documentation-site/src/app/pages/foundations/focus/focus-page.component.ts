import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';

@Component({
  selector: 'aurora-focus-page',
  imports: [RouterLink, ArticleLayoutComponent, ExampleBlockComponent],
  templateUrl: './focus-page.component.html',
  styleUrl: './focus-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusPageComponent {
  protected readonly settings = inject(SiteSettingsService);
}
