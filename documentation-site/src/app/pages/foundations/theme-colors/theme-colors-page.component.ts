import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import type { CodeSnippet } from '../../../shared/code-block/code-snippet';
import { SiteSettingsService } from '../../../site-settings.service';
import { calculatePalette } from './palette-calculator';

@Component({
  selector: 'aurora-theme-colors-page',
  imports: [RouterLink, ArticleLayoutComponent, CodeBlockComponent],
  templateUrl: './theme-colors-page.component.html',
  styleUrl: './theme-colors-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeColorsPageComponent {
  protected readonly settings = inject(SiteSettingsService);
  // Keep native pickers and preview on the last valid input while the text field contains an error.
  protected readonly pickerColors = signal({ brand: '#2b5f9e', accent: '#efd63c' });
  protected readonly brand = signal('#2b5f9e');
  protected readonly accent = signal('#efd63c');
  protected readonly themeName = signal('CUSTOM');
  protected readonly palette = signal(
    calculatePalette(this.brand(), this.accent(), this.themeName()),
  );
  // This is calculated output, not a static documentation example.
  protected readonly paletteSnippet = computed<CodeSnippet>(() => ({
    language: 'css',
    code: this.palette().css,
  }));
  protected readonly error = computed(() =>
    this.validColor(this.brand()) && this.validColor(this.accent())
      ? ''
      : 'Введите цвет в формате #RRGGBB. Пока показан последний корректный результат.',
  );
  protected validColor(value: string) {
    return /^#[0-9a-f]{6}$/i.test(value.trim());
  }
  protected updateColor(kind: 'brand' | 'accent', value: string) {
    this[kind].set(value);
    if (this.validColor(value)) {
      this.pickerColors.update((colors) => ({ ...colors, [kind]: value.trim() }));
    }
    this.refresh();
  }
  protected updateName(value: string) {
    this.themeName.set(value);
    this.refresh();
  }
  private refresh() {
    if (this.validColor(this.brand()) && this.validColor(this.accent()))
      this.palette.set(
        calculatePalette(this.brand().trim(), this.accent().trim(), this.themeName()),
      );
  }
}
