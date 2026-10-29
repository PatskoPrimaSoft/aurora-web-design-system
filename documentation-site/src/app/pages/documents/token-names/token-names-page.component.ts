import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteSettingsService } from '../../../site-settings.service';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { tokenNamesSnippets } from './token-names-page.snippets';

@Component({
  selector: 'aurora-token-names-page',
  imports: [RouterLink, CodeBlockComponent],
  templateUrl: './token-names-page.component.html',
  styleUrl: './token-names-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenNamesPageComponent {
  protected readonly settings = inject(SiteSettingsService);
  protected readonly snippets = tokenNamesSnippets;
}
