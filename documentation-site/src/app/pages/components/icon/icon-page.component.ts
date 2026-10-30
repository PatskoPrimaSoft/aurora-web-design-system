import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AuroraScopeDirective,
  DsButtonComponent,
  DsIconComponent,
} from '@primasoftllc/design-system/angular';
import type { DsIconSize } from '@primasoftllc/design-system/angular';
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
    DsButtonComponent,
    ExampleBlockComponent,
    CodeBlockComponent,
    RouterLink,
  ],
  templateUrl: './icon-page.component.html',
  styleUrl: './icon-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPageComponent {
  protected readonly snippets = iconSnippets;
  protected readonly settings = inject(SiteSettingsService);
  protected readonly sizes: readonly DsIconSize[] = ['xs', 'sm', 'md', 'lg'];
  protected readonly angle = signal(45);
  protected readonly directionLabel = computed(() => `Направление: ${this.angle()}°`);

  protected turn() {
    this.angle.update((angle) => (angle + 45) % 360);
  }
}
