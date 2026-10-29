import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteSettingsService } from '../../../site-settings.service';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { angularUiKitSnippets } from './angular-ui-kit-page.snippets';

@Component({
  selector: 'aurora-angular-ui-kit-page',
  imports: [RouterLink, CodeBlockComponent],
  templateUrl: './angular-ui-kit-page.component.html',
  styleUrl: './angular-ui-kit-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AngularUiKitPageComponent {
  protected readonly settings = inject(SiteSettingsService);
  protected readonly snippets = angularUiKitSnippets;
}
