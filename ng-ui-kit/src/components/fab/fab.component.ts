import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DsIconComponent } from '../icon/icon.component';

export type DsFabTone = 'primary' | 'accent' | 'surface';
export type DsFabSize = 'sm' | 'md' | 'lg';
let nextTooltipId = 0;

/** Главное действие области. Размещение задаёт родитель, запросы выполняет приложение. */
@Component({
  selector: 'button[dsFab]',
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fab.component.html',
  styleUrl: './fab.component.css',
  host: {
    '[attr.type]': 'type()',
    '[disabled]': 'disabled()',
    '[attr.aria-label]': 'label()',
    '[attr.aria-busy]': 'loading() ? true : ariaBusy()',
    '[attr.aria-disabled]': 'loading() ? true : ariaDisabled()',
    '[attr.aria-describedby]': 'description()',
    '[attr.data-ds-tone]': 'tone()',
    '[attr.data-ds-size]': 'size()',
    '[attr.data-ds-loading]': 'loading()',
    '[attr.data-ds-extended]': 'extended()',
    '[attr.data-ds-hover]': '!blocked() && hovered()',
    '[attr.data-ds-pressed]': '!blocked() && pressed()',
    '(pointerenter)': 'enter($event)',
    '(pointerleave)': 'leave($event)',
    '(pointerdown)': 'down($event)',
    '(pointerup)': 'pressed.set(false)',
    '(pointercancel)': 'reset()',
    '(focus)': 'showTip()',
    '(blur)': 'reset()',
    '(keydown)': 'keyDown($event)',
    '(keyup)': 'pressed.set(false)',
  },
})
export class DsFabComponent {
  readonly label = input.required<string>();
  readonly icon = input('add');
  readonly tone = input<DsFabTone>('primary');
  readonly size = input<DsFabSize>('md');
  readonly extended = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly ariaBusy = input<string | boolean | null>(null, { alias: 'aria-busy' });
  readonly ariaDisabled = input<string | boolean | null>(null, { alias: 'aria-disabled' });
  readonly ariaDescribedBy = input<string | null>(null, { alias: 'aria-describedby' });
  protected readonly tooltipId = 'ds-fab-tooltip-' + nextTooltipId++;
  protected readonly hovered = signal(false);
  protected readonly pressed = signal(false);
  protected readonly tipOpen = signal(false);
  protected readonly blocked = computed(() => this.disabled() || this.loading());
  protected readonly description = computed(
    () =>
      [this.ariaDescribedBy(), this.tipOpen() ? this.tooltipId : null].filter(Boolean).join(' ') ||
      null,
  );
  private hideTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly host = inject(ElementRef<HTMLButtonElement>).nativeElement;
  private readonly tip = viewChild<ElementRef<HTMLElement>>('tip');
  private readonly text = viewChild<ElementRef<HTMLElement>>('text');

  constructor() {
    // Capture blocks the consumer's Angular click handler and native submission during loading.
    const activate = (event: MouseEvent) => {
      this.hideTip();
      if (this.blocked()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.tipOpen()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.hideTip();
      }
    };
    const reposition = () => {
      if (this.tipOpen()) this.showTip();
    };
    this.host.addEventListener('click', activate, true);
    const document = this.host.ownerDocument;
    const window = document.defaultView;
    document.addEventListener('keydown', escape, true);
    window?.addEventListener('scroll', reposition, true);
    window?.addEventListener('resize', reposition);
    let resize: ResizeObserver | undefined;
    afterNextRender(() => {
      // Re-evaluate truncation when the parent changes width without a window resize.
      resize = new ResizeObserver(reposition);
      resize.observe(this.host);
    });
    inject(DestroyRef).onDestroy(() => {
      this.host.removeEventListener('click', activate, true);
      document.removeEventListener('keydown', escape, true);
      window?.removeEventListener('scroll', reposition, true);
      window?.removeEventListener('resize', reposition);
      resize?.disconnect();
      clearTimeout(this.hideTimer);
    });
    effect(() => {
      this.label();
      this.extended();
      this.size();
      this.hideTip();
      if (this.blocked()) {
        this.hovered.set(false);
        this.pressed.set(false);
      }
    });
  }

  protected enter(event: PointerEvent): void {
    if (!this.blocked() && event.pointerType === 'mouse') {
      this.hovered.set(true);
      this.showTip();
    }
  }
  protected leave(event: PointerEvent): void {
    this.hovered.set(false);
    this.pressed.set(false);
    if (!this.tip()?.nativeElement.contains(event.relatedTarget as Node | null)) {
      // Allow the pointer to cross the small gap between the button and its tooltip.
      this.hideTimer = setTimeout(() => this.hideTip(), 120);
    }
  }
  protected down(event: PointerEvent): void {
    if (!this.blocked() && (event.pointerType !== 'mouse' || event.button === 0))
      this.pressed.set(true);
  }
  protected keyDown(event: KeyboardEvent): void {
    if (!this.blocked() && !event.repeat && (event.key === ' ' || event.key === 'Enter')) {
      this.pressed.set(true);
    }
  }
  protected reset(): void {
    this.hovered.set(false);
    this.pressed.set(false);
    this.hideTip();
  }
  protected keepTip(): void {
    clearTimeout(this.hideTimer);
  }
  protected hideTip(): void {
    clearTimeout(this.hideTimer);
    this.tip()?.nativeElement.hidePopover();
    this.tipOpen.set(false);
  }
  protected showTip(): void {
    clearTimeout(this.hideTimer);
    const tip = this.tip()?.nativeElement;
    const text = this.text()?.nativeElement;
    if (
      !tip ||
      this.blocked() ||
      !this.label().trim() ||
      (this.extended() && text && text.scrollWidth <= text.clientWidth)
    ) {
      this.hideTip();
      return;
    }
    // Native manual popover enters the top layer without moving outside the local token scope.
    tip.showPopover();
    this.tipOpen.set(true);
    const anchor = this.host.getBoundingClientRect();
    const rect = tip.getBoundingClientRect();
    const viewport = this.host.ownerDocument.documentElement;
    tip.style.left =
      Math.max(4, Math.min(anchor.left, viewport.clientWidth - rect.width - 4)) + 'px';
    tip.style.top =
      (anchor.bottom + 4 + rect.height <= viewport.clientHeight - 4
        ? anchor.bottom + 4
        : Math.max(4, anchor.top - rect.height - 4)) + 'px';
  }
  protected leaveTip(event: PointerEvent): void {
    if (!this.host.contains(event.relatedTarget as Node | null)) this.hideTip();
  }
}
