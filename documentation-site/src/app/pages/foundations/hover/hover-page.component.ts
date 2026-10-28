import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';

@Component({
  selector: 'aurora-hover-page',
  imports: [RouterLink, ArticleLayoutComponent, ExampleBlockComponent],
  templateUrl: './hover-page.component.html',
  styleUrl: './hover-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoverPageComponent {
  protected readonly settings = inject(SiteSettingsService);
}
