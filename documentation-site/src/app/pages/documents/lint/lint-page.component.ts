import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteSettingsService } from '../../../site-settings.service';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { lintSnippets } from './lint-page.snippets';

@Component({
  selector: 'aurora-lint-page',
  imports: [RouterLink, CodeBlockComponent],
  templateUrl: './lint-page.component.html',
  styleUrl: './lint-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LintPageComponent {
  protected readonly settings = inject(SiteSettingsService);
  protected readonly snippets = lintSnippets;
}
