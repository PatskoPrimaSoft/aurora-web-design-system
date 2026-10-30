import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DsButtonComponent } from '@primasoftllc/design-system/angular';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { hoverSnippets } from './hover-page.snippets';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';

@Component({
  selector: 'aurora-hover-page',
  imports: [
    DsButtonComponent,
    CodeBlockComponent,
    RouterLink,
    ArticleLayoutComponent,
    ExampleBlockComponent,
  ],
  templateUrl: './hover-page.component.html',
  styleUrl: './hover-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoverPageComponent {
  protected readonly snippets = hoverSnippets;
  protected readonly result = signal('Изменения ещё не сохранены.');
  protected readonly settings = inject(SiteSettingsService);
}
