import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import yaml from 'highlight.js/lib/languages/yaml';
import type { CodeLanguage, CodeSnippet } from './code-snippet';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('json', json);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('yaml', yaml);

const labels: Record<CodeLanguage, string> = {
  typescript: 'TypeScript',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  yaml: 'YAML',
  shell: 'Shell',
  text: 'Текст',
};

@Component({
  selector: 'aurora-code-block',
  imports: [NgTemplateOutlet],
  templateUrl: './code-block.component.html',
  styleUrl: './code-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlockComponent {
  readonly snippet = input.required<CodeSnippet>();
  readonly collapsible = input(false, { transform: booleanAttribute });
  protected readonly label = computed(() => {
    const snippet = this.snippet();
    return snippet.fileName ?? labels[snippet.language];
  });
  protected readonly highlighted = computed(() => {
    const { code, language } = this.snippet();
    if (language === 'text') {
      return code.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    }
    // Highlight.js escapes source text; Angular sanitizes the generated markup as well.
    return hljs.highlight(code, { language, ignoreIllegals: true }).value;
  });
  protected readonly status = signal('');
  protected readonly copying = signal(false);
  private readonly source = viewChild<ElementRef<HTMLPreElement>>('source');
  private destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
    });
  }

  protected async copy() {
    if (this.copying()) return;
    this.status.set('');
    this.copying.set(true);
    const text = this.snippet().code;
    try {
      await navigator.clipboard.writeText(text);
      if (!this.destroyed) this.status.set('Скопировано');
    } catch {
      if (this.destroyed) return;
      const pre = this.source()?.nativeElement;
      const code = pre?.querySelector('code');
      if (pre && code) {
        pre.focus({ preventScroll: true });
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      this.status.set('Не удалось скопировать. Скопируйте выделенный код вручную.');
    } finally {
      if (!this.destroyed) this.copying.set(false);
    }
  }
}
