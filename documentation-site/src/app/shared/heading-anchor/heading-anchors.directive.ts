import {
  afterNextRender,
  ApplicationRef,
  type ComponentRef,
  createComponent,
  DestroyRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  inject,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { HeadingAnchorComponent, readHeadingTitle } from './heading-anchor.component';

interface HeadingLink {
  ref: ComponentRef<HeadingAnchorComponent>;
  host: HTMLElement;
  title: string;
  url: string;
}

/** Decorate article headings centrally, including standalone documents without a TOC. */
@Directive({ selector: '[auroraHeadingAnchors]' })
export class HeadingAnchorsDirective {
  private readonly root = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly router = inject(Router);
  private readonly app = inject(ApplicationRef);
  private readonly environment = inject(EnvironmentInjector);
  private readonly links = new Map<HTMLElement, HeadingLink>();

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new MutationObserver(() => this.refresh());
      observer.observe(this.root, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['id'],
      });
      const navigation = this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) this.refresh();
      });
      this.refresh();
      destroyRef.onDestroy(() => {
        observer.disconnect();
        navigation.unsubscribe();
        for (const entry of this.links.values()) this.destroy(entry);
        this.links.clear();
      });
    });
  }

  private refresh(): void {
    const headings = new Set(
      Array.from(this.root.querySelectorAll<HTMLElement>('article h2[id], article h3[id]')),
    );
    for (const [heading, entry] of this.links) {
      if (!headings.has(heading) || !heading.id) {
        this.destroy(entry);
        this.links.delete(heading);
      }
    }
    for (const heading of headings) {
      if (!heading.id) continue;
      const title = readHeadingTitle(heading);
      const target = this.router.parseUrl(this.router.url);
      target.fragment = heading.id;
      const url = this.router.serializeUrl(target);
      let entry = this.links.get(heading);
      if (!entry) {
        const host = this.root.ownerDocument.createElement('aurora-heading-anchor');
        const ref = createComponent(HeadingAnchorComponent, {
          hostElement: host,
          environmentInjector: this.environment,
        });
        ref.instance.activated.subscribe((event) => this.repeatAnchor(event, heading));
        this.app.attachView(ref.hostView);
        entry = { ref, host, title: '', url: '' };
        this.links.set(heading, entry);
      }
      // Cached inputs avoid a render/MutationObserver loop from the inserted icon.
      if (entry.title !== title || entry.url !== url) {
        entry.title = title;
        entry.url = url;
        entry.ref.setInput('headingTitle', title);
        entry.ref.setInput('target', target);
        entry.ref.changeDetectorRef.detectChanges();
      }
      // A page may replace a heading's text without replacing the heading element itself.
      if (entry.host.parentElement !== heading) heading.append(entry.host);
    }
  }

  private repeatAnchor(event: MouseEvent, heading: HTMLElement): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    if (this.router.parseUrl(this.router.url).fragment !== heading.id) return;
    // An unchanged URL does not trigger NavigationEnd; restore its scroll and focus explicitly.
    heading.scrollIntoView({ block: 'start' });
    heading.focus({ preventScroll: true });
  }

  private destroy(entry: HeadingLink): void {
    this.app.detachView(entry.ref.hostView);
    entry.ref.destroy();
    entry.host.remove();
  }
}
