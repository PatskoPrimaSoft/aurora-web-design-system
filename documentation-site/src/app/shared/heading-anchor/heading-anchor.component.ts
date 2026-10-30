import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, type UrlTree } from '@angular/router';
import { DsIconComponent } from '@primasoftllc/design-system/angular';

/** Internal documentation link; it is not part of the published UI kit. */
@Component({
  selector: 'aurora-heading-anchor',
  imports: [RouterLink, DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './heading-anchor.component.html',
  styleUrl: './heading-anchor.component.scss',
})
export class HeadingAnchorComponent {
  readonly target = input.required<UrlTree>();
  readonly headingTitle = input.required<string>();
  readonly activated = output<MouseEvent>();
}

/** Exclude generated link content from TOC titles and the link's own accessible name. */
export function readHeadingTitle(heading: HTMLElement): string {
  const copy = heading.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('aurora-heading-anchor').forEach((anchor) => anchor.remove());
  return copy.textContent?.trim() ?? '';
}
