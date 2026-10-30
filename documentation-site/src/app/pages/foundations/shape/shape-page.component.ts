import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DsButtonComponent, DsCheckboxComponent } from '@primasoftllc/design-system/angular';
import { RouterLink } from '@angular/router';
import { radiusSamples, shadowSamples } from '../../../data/reference-samples';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { shapeSnippets } from './shape-page.snippets';

@Component({
  selector: 'aurora-shape-page',
  imports: [
    DsButtonComponent,
    DsCheckboxComponent,
    RouterLink,
    ArticleLayoutComponent,
    ExampleBlockComponent,
    CodeBlockComponent,
  ],
  templateUrl: './shape-page.component.html',
  styleUrl: './shape-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShapePageComponent {
  protected readonly showTracks = signal(false);
  protected readonly snippets = shapeSnippets;
  protected readonly radiusSamples = radiusSamples;
  protected readonly shadowSamples = shadowSamples;
  protected readonly settings = inject(SiteSettingsService);
}
