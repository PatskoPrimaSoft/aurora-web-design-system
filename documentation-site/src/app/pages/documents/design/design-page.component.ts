import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteSettingsService } from '../../../site-settings.service';

@Component({
  selector: 'aurora-design-page',
  imports: [RouterLink],
  templateUrl: './design-page.component.html',
  styleUrl: './design-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignPageComponent {
  protected readonly settings = inject(SiteSettingsService);
}
