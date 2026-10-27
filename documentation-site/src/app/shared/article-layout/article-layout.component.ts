import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'aurora-article-layout',
  imports: [RouterLink],
  templateUrl: './article-layout.component.html',
  styleUrl: './article-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleLayoutComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  private readonly media = matchMedia('(min-width: 1101px)');
  protected readonly wide = signal(this.media.matches);
  private readonly article = viewChild.required<ElementRef<HTMLElement>>('article');
  protected readonly headings = signal<{ id: string; title: string }[]>([]);
  protected readonly activeHeading = signal<string | null>(null);
  protected repeatAnchor(event: MouseEvent, id: string) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    if (this.route.snapshot.fragment !== id) return;
    // Router ignores an unchanged URL; the link must still scroll after manual scrolling.
    const heading = this.article().nativeElement.querySelector<HTMLElement>(
      `[id="${CSS.escape(id)}"]`,
    );
    heading?.scrollIntoView({ block: 'start' });
    heading?.focus({ preventScroll: true });
  }
  constructor() {
    const destroyRef = inject(DestroyRef);
    const update = (event: MediaQueryListEvent) => this.wide.set(event.matches);
    this.media.addEventListener('change', update);
    destroyRef.onDestroy(() => this.media.removeEventListener('change', update));
    afterNextRender(() => {
      const article = this.article().nativeElement;
      const scrollRoot = article.closest('main')!;
      let elements: HTMLElement[] = [];
      let frame = 0;
      const schedule = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const top = scrollRoot.getBoundingClientRect().top + 32;
          let current: HTMLElement | undefined = elements[0];
          for (const heading of elements) {
            if (heading.getBoundingClientRect().top > top) break;
            current = heading;
          }
          if (
            scrollRoot.scrollTop > 0 &&
            scrollRoot.scrollTop + scrollRoot.clientHeight >= scrollRoot.scrollHeight - 2
          ) {
            current = elements.at(-1);
          }
          this.activeHeading.set(current?.id ?? null);
        });
      };
      const refresh = () => {
        elements = Array.from(article.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
        this.headings.set(
          elements.map((heading) => ({ id: heading.id, title: heading.textContent?.trim() ?? '' })),
        );
        schedule();
      };
      const observer = new MutationObserver(refresh);
      observer.observe(article, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['id'],
      });
      refresh();
      const resize = new ResizeObserver(schedule);
      resize.observe(article);
      resize.observe(scrollRoot);
      scrollRoot.addEventListener('scroll', schedule, { passive: true });
      destroyRef.onDestroy(() => {
        observer.disconnect();
        resize.disconnect();
        scrollRoot.removeEventListener('scroll', schedule);
        cancelAnimationFrame(frame);
      });
    });
  }
}
