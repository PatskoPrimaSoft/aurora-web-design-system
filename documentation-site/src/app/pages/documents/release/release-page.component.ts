import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteSettingsService } from '../../../site-settings.service';

@Component({
  selector: 'aurora-release-page',
  imports: [RouterLink],
  templateUrl: './release-page.component.html',
  styleUrl: './release-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReleasePageComponent {
  protected readonly settings = inject(SiteSettingsService);
}
