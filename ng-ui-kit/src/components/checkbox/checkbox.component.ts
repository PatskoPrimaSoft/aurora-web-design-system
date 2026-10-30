import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';

let nextCheckboxId = 0;

/** Native checkbox; group selection and indeterminate calculations belong to the application. */
@Component({
  selector: 'ds-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DsCheckboxComponent), multi: true },
  ],
  host: {
    '[attr.data-ds-disabled]': 'isDisabled()',
    '[attr.data-ds-compact]': 'compact()',
    // Accessible names/descriptions belong to the native input, not a second control on the host.
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
  },
})
export class DsCheckboxComponent implements ControlValueAccessor {
  readonly checked = input(false, { transform: booleanAttribute });
  readonly indeterminate = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** The 24 px hit area specified for table rows; the mark remains 18 px. */
  readonly compact = input(false, { transform: booleanAttribute });
  readonly label = input<string>();
  readonly description = input<string>();
  readonly inputId = input<string>();
  readonly name = input<string>();
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  readonly ariaDescribedBy = input<string | undefined>(undefined, { alias: 'aria-describedby' });
  readonly checkedChange = output<boolean>();
  readonly indeterminateChange = output<boolean>();

  // Local interaction state also supports standalone usage; input updates resynchronise it.
  protected readonly currentChecked = signal(false);
  protected readonly currentMixed = signal(false);
  private readonly formAttached = signal(false);
  private readonly formDisabled = signal(false);
  private readonly generatedId = 'ds-checkbox-' + nextCheckboxId++;
  protected readonly nativeId = computed(() => this.inputId() || this.generatedId);
  protected readonly descriptionId = computed(() => this.nativeId() + '-description');
  protected readonly labelId = computed(() => this.nativeId() + '-label');
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly labelledBy = computed(
    () => this.ariaLabelledBy() || (!this.ariaLabel() && this.label() ? this.labelId() : null),
  );
  protected readonly describedBy = computed(
    () =>
      [this.ariaDescribedBy(), this.description() ? this.descriptionId() : null]
        .filter(Boolean)
        .join(' ') || null,
  );
  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      // Forms own the value once a CVA is attached; do not also bind checked in that mode.
      if (!this.formAttached()) this.currentChecked.set(this.checked());
    });
    effect(() => this.currentMixed.set(this.indeterminate()));
  }

  writeValue(value: unknown): void {
    this.formAttached.set(true);
    this.currentChecked.set(value === true);
    // Reset/programmatic writes reflect the visual flag without emitting user events.
    this.currentMixed.set(this.indeterminate());
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  protected change(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.isDisabled()) {
      input.checked = this.currentChecked();
      input.indeterminate = this.currentMixed();
      return;
    }
    // Native activation may uncheck an already-checked mixed control: mixed must select all.
    const next = this.currentMixed() ? true : input.checked;
    const wasMixed = this.currentMixed();
    this.currentMixed.set(false);
    this.currentChecked.set(next);
    input.checked = next;
    input.indeterminate = false;
    if (wasMixed) this.indeterminateChange.emit(false);
    this.onChange(next);
    this.checkedChange.emit(next);
  }
}
