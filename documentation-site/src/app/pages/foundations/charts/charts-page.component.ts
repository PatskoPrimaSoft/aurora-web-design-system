import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { chartSeries, speedRows } from '../../../data/reference-samples';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';

@Component({
  selector: 'aurora-charts-page',
  imports: [RouterLink, ArticleLayoutComponent, ExampleBlockComponent],
  templateUrl: './charts-page.component.html',
  styleUrl: './charts-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartsPageComponent {
  protected readonly seriesSamples = chartSeries;
  protected readonly speedRows = speedRows;
  protected readonly settings = inject(SiteSettingsService);
}
