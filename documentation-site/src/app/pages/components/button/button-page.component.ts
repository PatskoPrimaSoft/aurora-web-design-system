import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuroraScopeDirective, DsButtonComponent } from '@primasoftllc/design-system/angular';
import type { DsButtonSize, DsButtonTone } from '@primasoftllc/design-system/angular';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { buttonSnippets } from './button-page.snippets';

@Component({
  selector: 'aurora-button-page',
  imports: [
    ArticleLayoutComponent,
    CodeBlockComponent,
    ExampleBlockComponent,
    DsButtonComponent,
    AuroraScopeDirective,
    RouterLink,
  ],
  templateUrl: './button-page.component.html',
  styleUrl: './button-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPageComponent {
  protected readonly settings = inject(SiteSettingsService);
  protected readonly snippets = buttonSnippets;
  protected readonly tones: readonly DsButtonTone[] = [
    'primary',
    'secondary',
    'subtle',
    'ghost',
    'danger',
    'accent',
    'inverse',
  ];
  protected readonly sizes: readonly DsButtonSize[] = ['sm', 'md', 'lg'];
  protected readonly clicks = signal(0);
  protected readonly selectedTone = signal<DsButtonTone>('primary');
  protected readonly selectedSize = signal<DsButtonSize>('md');
  protected readonly added = signal(0);
  protected readonly locked = signal(true);
  protected readonly performed = signal(0);
  protected readonly saving = signal(false);
  protected readonly saves = signal(0);
  protected readonly saveMessage = signal('Изменения ещё не сохранялись.');
  protected readonly formMessage = signal('Форма ещё не отправлялась.');
  private saveTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.saveTimer));
  }

  protected save() {
    if (this.saving()) return;
    this.saving.set(true);
    this.saves.update((value) => value + 1);
    this.saveMessage.set('Сохраняем изменения…');
    // Demo-only operation; real requests and their lifecycle belong to the application.
    this.saveTimer = setTimeout(() => {
      this.saving.set(false);
      this.saveMessage.set('Изменения сохранены.');
    }, 800);
  }

  protected submit(event: Event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    this.formMessage.set(`Отправлено: ${data.get('objectName')}`);
  }

  protected reset() {
    this.formMessage.set('Форма сброшена.');
  }
}
