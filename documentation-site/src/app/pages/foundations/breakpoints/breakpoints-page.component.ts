import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { breakpointsSnippets } from './breakpoints-page.snippets';

@Component({
  selector: 'aurora-breakpoints-page',
  imports: [RouterLink, ArticleLayoutComponent, ExampleBlockComponent, CodeBlockComponent],
  templateUrl: './breakpoints-page.component.html',
  styleUrl: './breakpoints-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreakpointsPageComponent {
  protected readonly snippets = breakpointsSnippets;
  protected readonly settings = inject(SiteSettingsService);
}
