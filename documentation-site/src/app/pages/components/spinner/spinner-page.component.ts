import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AuroraScopeDirective,
  DsButtonComponent,
  DsSpinnerComponent,
} from '@primasoftllc/design-system/angular';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { spinnerSnippets } from './spinner-page.snippets';

@Component({
  selector: 'aurora-spinner-page',
  imports: [
    ArticleLayoutComponent,
    CodeBlockComponent,
    ExampleBlockComponent,
    RouterLink,
    AuroraScopeDirective,
    DsButtonComponent,
    DsSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spinner-page.component.html',
  styleUrl: './spinner-page.component.scss',
})
export class SpinnerPageComponent {
  protected readonly settings = inject(SiteSettingsService);
  protected readonly snippets = spinnerSnippets;
  protected readonly sizes = [16, 20, 32, 48];
  protected readonly refreshing = signal(false);
  protected readonly report = signal('Последний отчёт: 4 объекта, маршрут Минск — Брест.');
  protected readonly refreshMessage = signal('Данные ещё не обновлялись.');
  protected readonly delayed = signal(false);
  protected readonly delayMessage = signal('Выберите короткую или длинную операцию.');
  protected readonly retryState = signal<'idle' | 'loading' | 'error' | 'done'>('idle');
  protected readonly retryMessage = signal('Отчёт ещё не загружался.');
  private attempt = 0;
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;
  private delayTimer: ReturnType<typeof setTimeout> | undefined;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    // Timers simulate operations on this page, not behaviour of the exported Spinner.
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.refreshTimer);
      clearTimeout(this.delayTimer);
      clearTimeout(this.retryTimer);
    });
  }
  protected refresh(): void {
    if (this.refreshing()) return;
    this.refreshing.set(true);
    this.refreshMessage.set('Обновляем данные, предыдущий результат остаётся видимым.');
    this.refreshTimer = setTimeout(() => {
      this.refreshing.set(false);
      this.report.set('Отчёт обновлён: 4 объекта, последнее обновление только что.');
      this.refreshMessage.set('Обновление завершено.');
    }, 1500);
  }
  protected startDelayed(duration: number): void {
    if (this.delayed()) return;
    this.delayed.set(true);
    this.delayMessage.set('Операция выполняется.');
    this.delayTimer = setTimeout(() => {
      this.delayed.set(false);
      this.delayMessage.set('Операция завершена за ' + duration + ' ms.');
    }, duration);
  }
  protected loadReport(): void {
    if (this.retryState() === 'loading') return;
    this.attempt++;
    this.retryState.set('loading');
    this.retryMessage.set('Загружаем отчёт…');
    this.retryTimer = setTimeout(() => {
      const failed = this.attempt % 2 === 1;
      this.retryState.set(failed ? 'error' : 'done');
      this.retryMessage.set(
        failed ? 'Не удалось загрузить отчёт. Повторите попытку.' : 'Отчёт загружен.',
      );
    }, 1200);
  }
}
