import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  afterRenderEffect,
  ElementRef,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { themeRoles } from '../../../data/reference-samples';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';

@Component({
  selector: 'aurora-themes-page',
  imports: [RouterLink, ArticleLayoutComponent, ExampleBlockComponent],
  templateUrl: './themes-page.component.html',
  styleUrl: './themes-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemesPageComponent {
  protected readonly roles = themeRoles;
  protected readonly settings = inject(SiteSettingsService);
  private readonly tokenRows = viewChildren<ElementRef<HTMLElement>>('tokenRow');
  protected readonly tokenValues = signal<Record<string, string>>({});
  constructor() {
    afterRenderEffect(() => {
      this.settings.theme();
      this.settings.appearance();
      this.settings.density();
      const values: Record<string, string> = {};
      for (const row of this.tokenRows()) {
        const token = row.nativeElement.dataset['token']!;
        values[token] = getComputedStyle(row.nativeElement).getPropertyValue(token).trim();
      }
      this.tokenValues.set(values);
    });
  }
}
