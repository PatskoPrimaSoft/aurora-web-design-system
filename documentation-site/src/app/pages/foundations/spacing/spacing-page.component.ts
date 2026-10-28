import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { spacingSnippets } from './spacing-page.snippets';

@Component({
  selector: 'aurora-spacing-page',
  imports: [RouterLink, ArticleLayoutComponent, ExampleBlockComponent, CodeBlockComponent],
  templateUrl: './spacing-page.component.html',
  styleUrl: './spacing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpacingPageComponent {
  protected readonly snippets = spacingSnippets;
  protected readonly settings = inject(SiteSettingsService);
}
