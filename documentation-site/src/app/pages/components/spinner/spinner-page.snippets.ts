import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const spinnerSnippets = {
  basic: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DsSpinnerComponent, DsButtonComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-spinner-example',
  imports: [DsSpinnerComponent, DsButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <button dsButton tone="secondary" [aria-disabled]="refreshing()" (click)="refresh()">
      Обновить отчёт
    </button>
    <div class="loading-line">
      <span class="spinner-slot">
        @if (refreshing()) {
          <ds-spinner label="Обновление отчёта" [size]="32"></ds-spinner>
        }
      </span>
      <div [attr.aria-busy]="refreshing()">
        <p>{{ report() }}</p>
      </div>
    </div>
    <p [attr.role]="refreshing() ? null : 'status'">{{ refreshMessage() }}</p>
  \`,
  styles: \`
    .loading-line {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 48px;
      margin-top: 16px;
    }
    .spinner-slot {
      display: inline-flex;
      width: 32px;
      height: 32px;
      flex: none;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }
    p {
      margin: 8px 0 0;
    }
  \`,
})
export class SpinnerExampleComponent {
  readonly refreshing = signal(false);
  readonly report = signal('Последний отчёт: 4 объекта, маршрут Минск — Брест.');
  readonly refreshMessage = signal('Данные ещё не обновлялись.');
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;
  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.refreshTimer));
  }
  refresh(): void {
    if (this.refreshing()) return;
    this.refreshing.set(true);
    this.refreshMessage.set('Обновляем данные, предыдущий результат остаётся видимым.');
    this.refreshTimer = setTimeout(() => {
      this.refreshing.set(false);
      this.report.set('Отчёт обновлён: 4 объекта, последнее обновление только что.');
      this.refreshMessage.set('Обновление завершено.');
    }, 1500);
  }
}
`,
  },
  sizes: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsSpinnerComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-spinner-example',
  imports: [DsSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="variants">
      @for (size of sizes; track size) {
        <span class="size-sample">
          <ds-spinner [size]="size"
            label="Образец размера индикатора"
            aria-hidden="true"></ds-spinner>
          <span>{{ size }} px</span>
        </span>
      }
    </div>
  \`,
  styles: \`
    .variants {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 24px;
    }
    .size-sample {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
  \`,
})
export class SpinnerExampleComponent {
  readonly sizes = [16, 20, 32, 48];
}
`,
  },
  tones: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsSpinnerComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-spinner-example',
  imports: [DsSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="variants">
      <span class="size-sample">
        <ds-spinner label="Образец брендового цвета"
          tone="brand"
          [size]="32"
          aria-hidden="true"></ds-spinner>
        <code>brand</code>
      </span>
      <span class="size-sample">
        <ds-spinner label="Образец приглушённого цвета"
          tone="muted"
          [size]="32"
          aria-hidden="true"></ds-spinner>
        <code>muted</code>
      </span>
      <span class="size-sample inverse-surface">
        <ds-spinner label="Образец унаследованного цвета"
          tone="inverse"
          [size]="32"
          aria-hidden="true"></ds-spinner>
        <code>inverse</code>
      </span>
    </div>
  \`,
  styles: \`
    .variants {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 24px;
    }
    .size-sample {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .inverse-surface {
      padding: 16px;
      background: var(--ds-surface-inverse);
      color: var(--ds-fg-on-inverse);
      border-radius: var(--ds-radius-md);
    }
  \`,
})
export class SpinnerExampleComponent {}
`,
  },
  delay: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DsSpinnerComponent, DsButtonComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-spinner-example',
  imports: [DsSpinnerComponent, DsButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="row">
      <button dsButton tone="secondary" [aria-disabled]="delayed()" (click)="startDelayed(200)">
        Короткая операция · 200 ms
      </button>
      <button dsButton tone="secondary" [aria-disabled]="delayed()" (click)="startDelayed(1500)">
        Длинная операция · 1500 ms
      </button>
    </div>
    <div class="loading-line">
      <span class="spinner-slot">
        @if (delayed()) {
          <ds-spinner label="Загрузка списка объектов" [size]="32" [delay]="500"></ds-spinner>
        }
      </span>
      <p [attr.role]="delayed() ? null : 'status'">{{ delayMessage() }}</p>
    </div>
  \`,
  styles: \`
    .loading-line {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 48px;
      margin-top: 16px;
    }
    .spinner-slot {
      display: inline-flex;
      width: 32px;
      height: 32px;
      flex: none;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }
    p {
      margin: 8px 0 0;
    }
  \`,
})
export class SpinnerExampleComponent {
  readonly delayed = signal(false);
  readonly delayMessage = signal('Выберите короткую или длинную операцию.');
  private delayTimer: ReturnType<typeof setTimeout> | undefined;
  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.delayTimer));
  }
  startDelayed(duration: number): void {
    if (this.delayed()) return;
    this.delayed.set(true);
    this.delayMessage.set('Операция выполняется.');
    this.delayTimer = setTimeout(() => {
      this.delayed.set(false);
      this.delayMessage.set('Операция завершена за ' + duration + ' ms.');
    }, duration);
  }
}
`,
  },
  retry: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DsSpinnerComponent, DsButtonComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-spinner-example',
  imports: [DsSpinnerComponent, DsButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <button dsButton
      tone="secondary"
      [aria-disabled]="retryState() === 'loading'"
      (click)="loadReport()">
      {{ retryState() === 'error' ? 'Повторить загрузку' : 'Загрузить отчёт' }}
    </button>
    <div class="loading-line">
      <span class="spinner-slot">
        @if (retryState() === 'loading') {
          <ds-spinner label="Загрузка отчёта" [size]="32"></ds-spinner>
        }
      </span>
      <div [attr.aria-busy]="retryState() === 'loading'">
        <p>
          {{
            retryState() === 'done'
              ? 'Получены сведения о четырёх объектах.'
              : 'Данные отчёта пока недоступны.'
          }}
        </p>
      </div>
    </div>
    <p [attr.role]="retryState() === 'loading' ? null : 'status'">{{ retryMessage() }}</p>
  \`,
  styles: \`
    .loading-line {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 48px;
      margin-top: 16px;
    }
    .spinner-slot {
      display: inline-flex;
      width: 32px;
      height: 32px;
      flex: none;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }
    p {
      margin: 8px 0 0;
    }
  \`,
})
export class SpinnerExampleComponent {
  readonly retryState = signal<'idle' | 'loading' | 'error' | 'done'>('idle');
  readonly retryMessage = signal('Отчёт ещё не загружался.');
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private attempt = 0;
  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.retryTimer));
  }
  loadReport(): void {
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
`,
  },
  accessibility: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsSpinnerComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-spinner-example',
  imports: [DsSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="stack">
      <div class="sample">
        <ds-spinner label="Загрузка маршрута"></ds-spinner>
        <span>Индикатор с собственным доступным именем</span>
      </div>
      <div class="sample" role="status">
        <ds-spinner label="Загрузка событий" aria-hidden="true"></ds-spinner>
        <span>Загружаем события…</span>
      </div>
    </div>
  \`,
  styles: \`
    .stack {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .sample {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  \`,
})
export class SpinnerExampleComponent {}
`,
  },
  usage: {
    language: 'typescript',
    code: `import { Component, signal } from '@angular/core';
import { DsSpinnerComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-loading-report',
  imports: [DsSpinnerComponent],
  template: \`
    @if (loading()) {
      <ds-spinner label="Загрузка отчёта" [size]="32"></ds-spinner>
    }
  \`,
})
export class LoadingReportComponent {
  // The application sets this signal around its request.
  readonly loading = signal(true);
}
`,
  },
} satisfies Record<string, CodeSnippet>;
