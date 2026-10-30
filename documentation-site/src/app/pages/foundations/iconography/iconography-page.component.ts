import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DsIconComponent, DsButtonComponent } from '@primasoftllc/design-system/angular';
import { iconDictionary, iconSizes } from '../../../data/iconography';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';

@Component({
  selector: 'aurora-iconography-page',
  imports: [
    RouterLink,
    ArticleLayoutComponent,
    ExampleBlockComponent,
    DsIconComponent,
    DsButtonComponent,
  ],
  templateUrl: './iconography-page.component.html',
  styleUrl: './iconography-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconographyPageComponent {
  protected readonly removedCorrectly = signal(false);
  protected readonly removedIncorrectly = signal(false);
  protected readonly icons = iconDictionary;
  protected readonly sizes = iconSizes;
  protected readonly settings = inject(SiteSettingsService);
}
