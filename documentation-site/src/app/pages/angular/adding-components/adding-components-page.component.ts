import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { addingComponentsSnippets } from './adding-components-page.snippets';

@Component({
  selector: 'aurora-adding-components-page',
  imports: [RouterLink, ArticleLayoutComponent, CodeBlockComponent],
  templateUrl: './adding-components-page.component.html',
  styleUrl: './adding-components-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddingComponentsPageComponent {
  protected readonly settings = inject(SiteSettingsService);
  protected readonly snippets = addingComponentsSnippets;
}
