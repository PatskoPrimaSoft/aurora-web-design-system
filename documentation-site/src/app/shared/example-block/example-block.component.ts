import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'aurora-example-block',
  templateUrl: './example-block.component.html',
  styleUrl: './example-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.subtle]': 'background() === "subtle"' },
})
export class ExampleBlockComponent {
  readonly background = input<'surface' | 'subtle'>('surface');
}
