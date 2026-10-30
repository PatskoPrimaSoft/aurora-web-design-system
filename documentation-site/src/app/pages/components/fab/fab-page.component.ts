import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AuroraScopeDirective,
  DsButtonComponent,
  DsFabComponent,
  type DsFabSize,
  type DsFabTone,
} from '@primasoftllc/design-system/angular';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { fabSnippets } from './fab-page.snippets';

@Component({
  selector: 'aurora-fab-page',
  imports: [
    ArticleLayoutComponent,
    ExampleBlockComponent,
    CodeBlockComponent,
    AuroraScopeDirective,
    DsFabComponent,
    DsButtonComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fab-page.component.html',
  styleUrl: './fab-page.component.scss',
})
export class FabPageComponent {
  protected readonly settings = inject(SiteSettingsService);
  protected readonly snippets = fabSnippets;
  protected readonly sizes: readonly DsFabSize[] = ['sm', 'md', 'lg'];
  protected readonly tones: readonly DsFabTone[] = ['primary', 'accent', 'surface'];
  protected readonly added = signal(0);
  protected readonly selectedTone = signal<DsFabTone>('primary');
  protected readonly selectedSize = signal<DsFabSize>('md');
  protected readonly loading = signal(false);
  protected readonly locked = signal(true);
  protected readonly message = signal('Действие ещё не выполнялось.');
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }
  protected save(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.message.set('Сохраняем изменения…');
    // A demo timer replaces the application's request and is cleared when leaving the page.
    this.timer = setTimeout(() => {
      this.loading.set(false);
      this.message.set('Изменения сохранены.');
    }, 800);
  }
}
