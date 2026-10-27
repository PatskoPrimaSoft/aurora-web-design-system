import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'aurora-disclosure',
  templateUrl: './disclosure.component.html',
  styleUrl: './disclosure.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisclosureComponent {}
