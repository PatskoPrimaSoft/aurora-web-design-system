import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { DisclosureComponent } from '../../../shared/disclosure/disclosure.component';
import { typographySnippets } from './typography-page.snippets';

@Component({
  selector: 'aurora-typography-page',
  imports: [RouterLink, ArticleLayoutComponent, DisclosureComponent, CodeBlockComponent],
  templateUrl: './typography-page.component.html',
  styleUrl: './typography-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypographyPageComponent {
  protected readonly snippets = typographySnippets;
  protected readonly settings = inject(SiteSettingsService);
}
