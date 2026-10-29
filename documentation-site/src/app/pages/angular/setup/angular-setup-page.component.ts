import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { angularSetupSnippets } from './angular-setup-page.snippets';

@Component({
  selector: 'aurora-angular-setup-page',
  imports: [RouterLink, ArticleLayoutComponent, CodeBlockComponent],
  templateUrl: './angular-setup-page.component.html',
  styleUrl: './angular-setup-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AngularSetupPageComponent {
  protected readonly settings = inject(SiteSettingsService);
  protected readonly snippets = angularSetupSnippets;
}
