import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DsButtonComponent, DsSpinnerComponent } from '@primasoftllc/design-system/angular';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { motionSnippets } from './motion-page.snippets';

@Component({
  selector: 'aurora-motion-page',
  imports: [
    RouterLink,
    ArticleLayoutComponent,
    ExampleBlockComponent,
    CodeBlockComponent,
    DsButtonComponent,
    DsSpinnerComponent,
  ],
  templateUrl: './motion-page.component.html',
  styleUrl: './motion-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionPageComponent {
  protected readonly loading = signal(false);
  protected readonly loadingMessage = signal('Готово к проверке.');
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected startLoading(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.loadingMessage.set('Загружаем объекты…');
    // This timer simulates an operation only; the Spinner does not manage loading state.
    this.timer = setTimeout(() => {
      this.loading.set(false);
      this.loadingMessage.set('Объекты загружены.');
    }, 2000);
  }

  protected readonly snippets = motionSnippets;
  protected readonly settings = inject(SiteSettingsService);
}
