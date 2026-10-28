import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';

@Component({
  selector: 'aurora-sorting-page',
  imports: [RouterLink, ArticleLayoutComponent, ExampleBlockComponent],
  templateUrl: './sorting-page.component.html',
  styleUrl: './sorting-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortingPageComponent {
  protected readonly settings = inject(SiteSettingsService);
}
