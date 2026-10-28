import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { motionSnippets } from './motion-page.snippets';

@Component({
  selector: 'aurora-motion-page',
  imports: [RouterLink, ArticleLayoutComponent, ExampleBlockComponent, CodeBlockComponent],
  templateUrl: './motion-page.component.html',
  styleUrl: './motion-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionPageComponent {
  protected readonly snippets = motionSnippets;
  protected readonly settings = inject(SiteSettingsService);
}
