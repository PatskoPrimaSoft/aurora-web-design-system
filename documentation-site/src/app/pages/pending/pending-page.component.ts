import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ArticleLayoutComponent } from '../../shared/article-layout/article-layout.component';

@Component({
  selector: 'aurora-pending-page',
  imports: [ArticleLayoutComponent],
  templateUrl: './pending-page.component.html',
  styleUrl: './pending-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly routeTitle = toSignal(this.route.title, {
    initialValue: this.route.snapshot.title,
  });
  protected readonly title = computed(
    () => this.routeTitle()?.replace(/ — Aurora$/, '') ?? 'Страница',
  );
}
