import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { AuroraScopeDirective, DsIconComponent } from '@primasoftllc/design-system/angular';
import { SiteSettingsService } from '../../../site-settings.service';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
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
  protected readonly settings = inject(SiteSettingsService);
  protected readonly templateCode = '<ds-icon name="search" label="Поиск"></ds-icon>\n';
  protected readonly componentCode = `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsIconComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-icon-example',
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ds-icon name="search" label="Поиск"></ds-icon>',
})
export class IconExampleComponent {}
`;
}
