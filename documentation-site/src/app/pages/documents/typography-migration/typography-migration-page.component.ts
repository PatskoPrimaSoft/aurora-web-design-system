import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteSettingsService } from '../../../site-settings.service';

@Component({
  selector: 'aurora-typography-migration-page',
  imports: [RouterLink],
  templateUrl: './typography-migration-page.component.html',
  styleUrl: './typography-migration-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypographyMigrationPageComponent {
  protected readonly settings = inject(SiteSettingsService);
}
