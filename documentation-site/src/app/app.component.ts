import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { componentNavigation, foundationNavigation, navigationSectionTitles } from './navigation';
import { SiteSettingsService } from './site-settings.service';

@Component({
  selector: 'aurora-documentation',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly sectionTitles = navigationSectionTitles;
  private previousLocation: string | undefined;
  protected readonly router = inject(Router);
  protected readonly settings = inject(SiteSettingsService);
  protected readonly query = signal('');
  protected readonly menuOpen = signal(false);
  private readonly navigation = toSignal(
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)),
  );
  protected readonly isComponents = computed(() => {
    this.navigation();
    return this.router.url.split(/[?#]/)[0].startsWith('/components');
  });
  protected readonly groups = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('ru');
    return (this.isComponents() ? componentNavigation : foundationNavigation)
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          `${item.title} ${group.title} ${this.sectionTitles[group.section]}`
            .toLocaleLowerCase('ru')
            .includes(query),
        ),
      }))
      .filter((group) => group.items.length);
  });
  constructor() {
    effect((onCleanup) => {
      const navigation = this.navigation();
      if (!navigation) return;
      this.menuOpen.set(false);
      const tree = this.router.parseUrl(navigation.urlAfterRedirects);
      const params = tree.queryParams;
      this.settings.theme.set(params['theme'] === 'RED2' ? 'RED2' : 'DEFAULT');
      this.settings.appearance.set(params['appearance'] === 'dark' ? 'dark' : 'light');
      this.settings.density.set(params['density'] === 'compact' ? 'compact' : 'cozy');
      const location = navigation.urlAfterRedirects.split(/[?#]/)[0] + '#' + (tree.fragment ?? '');
      if (this.previousLocation === location) return;
      this.previousLocation = location;
      const timer = setTimeout(() => {
        const target = tree.fragment
          ? document.getElementById(tree.fragment)
          : document.getElementById('page-title');
        if (tree.fragment) target?.scrollIntoView({ block: 'start' });
        else document.getElementById('catalog-main')?.scrollTo(0, 0);
        target?.focus({ preventScroll: true });
      });
      onCleanup(() => clearTimeout(timer));
    });
  }
  protected updateSetting(key: 'theme' | 'appearance' | 'density', event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    void this.router.navigate([], {
      queryParams: { [key]: value },
      queryParamsHandling: 'merge',
      preserveFragment: true,
    });
  }
}
