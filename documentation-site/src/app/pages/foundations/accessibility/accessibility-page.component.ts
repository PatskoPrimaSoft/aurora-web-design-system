import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';

@Component({
  selector: 'aurora-accessibility-page',
  imports: [RouterLink, ArticleLayoutComponent, ExampleBlockComponent],
  templateUrl: './accessibility-page.component.html',
  styleUrl: './accessibility-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessibilityPageComponent {
  protected readonly settings = inject(SiteSettingsService);
}
