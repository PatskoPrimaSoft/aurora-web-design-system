import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuroraScopeDirective, DsIconComponent } from '@primasoftllc/design-system/angular';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { iconSnippets } from './icon-page.snippets';
@Component({
  selector: 'aurora-icon-page',
  imports: [
    ArticleLayoutComponent,
    AuroraScopeDirective,
    DsIconComponent,
    ExampleBlockComponent,
    CodeBlockComponent,
  ],
  templateUrl: './icon-page.component.html',
  styleUrl: './icon-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPageComponent {
  protected readonly snippets = iconSnippets;
  protected readonly settings = inject(SiteSettingsService);
}
