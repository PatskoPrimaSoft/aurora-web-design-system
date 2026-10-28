import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { statusTones } from '../../../data/reference-samples';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { statusSnippets } from './status-page.snippets';

@Component({
  selector: 'aurora-status-page',
  imports: [RouterLink, ArticleLayoutComponent, ExampleBlockComponent, CodeBlockComponent],
  templateUrl: './status-page.component.html',
  styleUrl: './status-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusPageComponent {
  protected readonly snippets = statusSnippets;
  protected readonly tones = statusTones;
  protected readonly settings = inject(SiteSettingsService);
}
