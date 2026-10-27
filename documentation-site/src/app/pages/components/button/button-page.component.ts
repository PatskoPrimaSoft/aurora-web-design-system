import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';

@Component({
  selector: 'aurora-button-page',
  imports: [ArticleLayoutComponent],
  templateUrl: './button-page.component.html',
  styleUrl: './button-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPageComponent {}
