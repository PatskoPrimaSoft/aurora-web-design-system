import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import metadata from '../../../../.tmp/tokens-page.generated.json';
import { SiteSettingsService } from '../../site-settings.service';

const descriptions: Record<string, string> = {
  main: 'Повседневные задачи: текст, поверхности, действия, размеры, отступы, состояния и свежесть данных.',
  chart: 'Цвета серий, осей, сетки и подсказок, размеры графиков.',
  map: 'Цвета карты и тень элементов поверх неё.',
  base: 'Исходные цвета и числовые шкалы. Для обычных задач используйте готовые токены из раздела «Основные».',
  all: 'Полный набор публичных токенов.',
};

@Component({
  selector: 'aurora-tokens-page',
  imports: [RouterLink],
  templateUrl: '../../../../.tmp/tokens-page.generated.html',
  styleUrl: './tokens-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokensPageComponent {
  protected readonly settings = inject(SiteSettingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly group = signal('main');
  protected readonly category = signal('all');
  protected readonly query = signal('');
  protected readonly status = signal('Нажмите на имя токена, чтобы скопировать CSS-переменную.');
  private readonly filtered = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('ru');
    return metadata.entries.filter(
      (entry) =>
        (this.category() === 'all' || entry.category === this.category()) &&
        (query ||
          this.category() !== 'all' ||
          this.group() === 'all' ||
          entry.group === this.group()) &&
        entry.search.includes(query),
    );
  });
  protected readonly visibleNames = computed(
    () => new Set(this.filtered().map((entry) => entry.name)),
  );
  protected readonly visibleCategories = computed(
    () => new Set(this.filtered().map((entry) => entry.category)),
  );
  protected readonly count = computed(() => this.filtered().length);
  protected readonly description = computed(() =>
    this.query().trim() ? 'Поиск по всем группам токенов.' : descriptions[this.group()],
  );
  private timer: ReturnType<typeof setTimeout> | undefined;
  private readonly animations = new Set<Animation>();
  private destroyed = false;

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const group = params.get('group') === 'special' ? 'all' : (params.get('group') ?? 'main');
      this.group.set(Object.hasOwn(descriptions, group) ? group : 'main');
      const category = params.get('category') ?? 'all';
      this.category.set(
        metadata.categories.some((item) => item.id === category) ? category : 'all',
      );
      this.query.set(params.get('q') ?? '');
    });
    this.route.fragment.pipe(takeUntilDestroyed()).subscribe((fragment) => this.reveal(fragment));
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      clearTimeout(this.timer);
      for (const animation of this.animations) animation.cancel();
    });
  }

  protected selectGroup(group: string) {
    this.group.set(group);
    this.category.set('all');
    this.query.set('');
    this.save();
  }
  protected selectCategory(category: string) {
    this.category.set(category);
    const selected = metadata.categories.find((item) => item.id === category);
    if (selected) this.group.set(selected.group);
    this.save();
  }
  protected selectQuery(query: string) {
    this.query.set(query);
    this.save();
  }
  protected selectBrand(theme: 'DEFAULT' | 'RED2') {
    this.settings.theme.set(theme);
    this.save();
  }
  private save(fragment?: string) {
    void this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        ...this.settings.queryParams(),
        group: this.group() === 'main' ? null : this.group(),
        category: this.category() === 'all' ? null : this.category(),
        q: this.query() || null,
      },
      fragment,
    });
  }
  private reveal(fragment: string | null) {
    if (!fragment) return;
    const entry = metadata.entries.find((item) => item.name === '--' + fragment);
    const category = metadata.categories.find(
      (item) => 'token-' + item.id === fragment || item.id === entry?.category,
    );
    if (!category) return;
    // A deep link must reveal its target even if the current search or group hides it.
    if (entry ? !this.visibleNames().has(entry.name) : !this.visibleCategories().has(category.id)) {
      this.group.set(category.group);
      this.category.set('all');
      this.query.set('');
      this.save(fragment);
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const target = this.host.nativeElement.querySelector<HTMLElement>('#' + CSS.escape(fragment));
      target?.scrollIntoView({ block: 'start' });
      target?.focus({ preventScroll: true });
    });
  }
  protected async handleClick(event: MouseEvent) {
    const target = event.target instanceof Element ? event.target : null;
    const copy = target?.closest<HTMLElement>('[data-copy]');
    if (copy) {
      const value = 'var(' + copy.dataset['copy'] + ')';
      try {
        await navigator.clipboard.writeText(value);
        if (!this.destroyed) this.status.set('Скопировано: ' + value);
      } catch {
        if (!this.destroyed) this.status.set('Для копирования: ' + value);
      }
    }
    const motion = target?.closest<HTMLElement>('.token-motion');
    if (motion) {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.status.set('Движение отключено в настройках системы.');
        return;
      }
      const duration = Number.parseFloat(motion.dataset['duration'] ?? '');
      if (Number.isFinite(duration) && motion.nextElementSibling) {
        const animation = motion.nextElementSibling.animate(
          [{ transform: 'translateX(0)' }, { transform: 'translateX(24px)' }],
          { duration, iterations: 2, direction: 'alternate' },
        );
        this.animations.add(animation);
        animation.finished.then(
          () => this.animations.delete(animation),
          () => this.animations.delete(animation),
        );
      }
    }
    const anchor = target?.closest<HTMLAnchorElement>('a');
    if (
      anchor &&
      event.button === 0 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      this.reveal(anchor.hash.slice(1));
    }
  }
}
