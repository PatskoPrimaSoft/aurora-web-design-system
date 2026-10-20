import {booleanAttribute, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, input, signal} from '@angular/core';

export type DsButtonTone = 'primary' | 'secondary' | 'subtle' | 'ghost' | 'danger' | 'accent' | 'inverse';
export type DsButtonSize = 'sm' | 'md' | 'lg';

/** Нативная кнопка Aurora. Loading сохраняет геометрию и фокус, блокируя активацию. */
@Component({
  selector: 'button[dsButton]', standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './button.component.css',
  template: `
    <span data-ds-button-content>
      @if (icon()) {<span class="material-symbols-outlined" aria-hidden="true">{{icon()}}</span>}
      <span data-ds-button-label><ng-content /></span>
      @if (iconRight()) {<span class="material-symbols-outlined" aria-hidden="true">{{iconRight()}}</span>}
    </span>
    @if (loading()) {<span data-ds-button-spinner aria-hidden="true"><span></span></span>}
  `,
  host: {
    '[attr.type]': 'type()', '[disabled]': 'disabled()',
    '[attr.aria-busy]': 'loading() ? true : ariaBusy()',
    '[attr.aria-disabled]': 'loading() ? true : ariaDisabled()',
    '[attr.data-ds-tone]': 'tone()', '[attr.data-ds-size]': 'size()',
    '[attr.data-ds-loading]': 'loading()', '[attr.data-ds-full-width]': 'fullWidth()',
    '[attr.data-ds-hover]': '!blocked() && hovered()',
    '[attr.data-ds-pressed]': '!blocked() && pressed()',
    '(pointerenter)': 'enter($event)', '(pointerleave)': 'leave()',
    '(pointerdown)': 'down($event)', '(pointerup)': 'pressed.set(false)',
    '(pointercancel)': 'leave()', '(blur)': 'leave()',
    '(keydown)': 'keyDown($event)', '(keyup)': 'keyUp($event)',
  },
})
export class DsButtonComponent {
  readonly tone = input<DsButtonTone>('primary');
  readonly size = input<DsButtonSize>('md');
  readonly icon = input<string>();
  readonly iconRight = input<string>();
  readonly loading = input(false, {transform: booleanAttribute});
  readonly disabled = input(false, {transform: booleanAttribute});
  readonly fullWidth = input(false, {transform: booleanAttribute});
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly ariaBusy = input<string | boolean | null>(null, {alias: 'aria-busy'});
  readonly ariaDisabled = input<string | boolean | null>(null, {alias: 'aria-disabled'});
  protected readonly hovered = signal(false);
  protected readonly pressed = signal(false);
  protected readonly blocked = computed(() => this.disabled() || this.loading());

  constructor() {
    const host = inject(ElementRef<HTMLButtonElement>).nativeElement;
    // Capture нужен до Angular (click) потребителя: HostListener может разделять с ним один listener.
    const guard = (event: MouseEvent) => {
      if (this.blocked()) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    host.addEventListener('click', guard, true);
    inject(DestroyRef).onDestroy(() => host.removeEventListener('click', guard, true));
    effect(() => { if (this.blocked()) this.leave(); });
  }

  protected enter(event: PointerEvent): void {
    if (!this.blocked() && event.pointerType === 'mouse') this.hovered.set(true);
  }
  protected down(event: PointerEvent): void {
    if (!this.blocked() && (event.pointerType !== 'mouse' || event.button === 0)) this.pressed.set(true);
  }
  protected leave(): void { this.hovered.set(false); this.pressed.set(false); }
  protected keyDown(event: KeyboardEvent): void {
    if (!this.blocked() && !event.repeat && (event.key === ' ' || event.key === 'Enter')) this.pressed.set(true);
  }
  protected keyUp(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') this.pressed.set(false);
  }
}
