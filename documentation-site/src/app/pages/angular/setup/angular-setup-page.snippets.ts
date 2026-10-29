import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const angularSetupSnippets = {
  registry: {
    language: 'text',
    fileName: '.npmrc',
    code: `@primasoftllc:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${NODE_AUTH_TOKEN}
`,
  },
  install: {
    language: 'shell',
    code: `npm i -E @primasoftllc/design-system # точная версия, без ^: обновление — отдельный коммит
npm i -D stylelint postcss-scss      # линтер (шаг 8)
`,
  },
  globalStyles: {
    language: 'json',
    code: `{
  "styles": [
    "node_modules/@primasoftllc/design-system/dist/styles.css",
    "src/styles.scss"
  ]
}
`,
  },
  appConfig: {
    language: 'typescript',
    code: `import {ApplicationConfig} from '@angular/core';
import {provideAurora} from '@primasoftllc/design-system/angular';

export const appConfig: ApplicationConfig = {
  providers: [...provideAurora({theme: 'DEFAULT'})],
};
`,
  },
  bootstrap: {
    language: 'typescript',
    code: `import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {appConfig} from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(console.error);
`,
  },
  initialScope: {
    language: 'html',
    code: `<body data-ds-theme="DEFAULT" data-ds-appearance="light" data-ds-density="cozy">
`,
  },
  localScope: {
    language: 'html',
    code: `<section auroraScope density="compact">…</section>
<div data-ds-appearance="dark">…</div>
`,
  },
  installCharts: {
    language: 'shell',
    code: `npm i echarts
`,
  },
  chartImports: {
    language: 'typescript',
    code: `import {auroraChartChrome, auroraWatchScopes} from '@primasoftllc/design-system/angular/echarts';
`,
  },
  stylelint: {
    language: 'json',
    code: `{
  "extends": "@primasoftllc/design-system/stylelint-config",
  "overrides": [{ "files": ["**/*.scss"], "customSyntax": "postcss-scss" }]
}
`,
  },
  button: {
    language: 'typescript',
    code: `import {Component, signal} from '@angular/core';
import {DsButtonComponent} from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-save-example',
  imports: [DsButtonComponent],
  template: \`<button dsButton icon="save" [loading]="saving()" (click)="save()">Сохранить</button>
    <p role="status">{{message()}}</p>\`,
})
export class SaveExample {
  readonly saving = signal(false);
  readonly message = signal('');

  async save(): Promise<void> {
    this.saving.set(true);
    this.message.set('Сохраняем изменения…');
    try {
      // Демонстрация асинхронного действия; в приложении здесь вызов сервиса.
      await new Promise<void>(resolve => setTimeout(resolve, 500));
      this.message.set('Изменения сохранены.');
    } catch {
      this.message.set('Не удалось сохранить изменения. Попробуйте ещё раз.');
    } finally {
      this.saving.set(false);
    }
  }
}
`,
  },
  ci: {
    language: 'yaml',
    code: `permissions:
  contents: read
  packages: read
steps:
  - uses: actions/setup-node@v7
    with:
      node-version: '22'
      cache: npm
      registry-url: https://npm.pkg.github.com
      scope: '@primasoftllc'
  - run: npm ci
    env:
      NODE_AUTH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`,
  },
  scopeTemplate: {
    language: 'html',
    code: `<section auroraScope density="compact">…</section>
<div data-ds-appearance="light">…</div>
`,
  },
  rowStyles: {
    language: 'scss',
    code: `.row {
  height: var(--ds-row-h);
  padding-inline: var(--ds-cell-pad-x);
  border-bottom: 1px solid var(--ds-divider);
  color: var(--ds-fg);
  font: var(--ds-type-body);
  &:hover { background: var(--ds-surface-hover); }
  &[aria-selected='true'] { background: var(--ds-surface-selected); }
}
`,
  },
  chartOptions: {
    language: 'typescript',
    code: `import type {EChartsOption} from 'echarts/types/dist/echarts';
import {auroraChartChrome} from '@primasoftllc/design-system/angular/echarts';

export function chartOption(host: HTMLElement): EChartsOption {
  const chrome = auroraChartChrome(host);
  return {
    ...chrome,
    xAxis: {...chrome.xAxis, type: 'time'},
    series: [{type: 'line', data: [[Date.now(), 42]]}],
  };
}
`,
  },
  watchScopes: {
    language: 'typescript',
    code: `import {auroraWatchScopes} from '@primasoftllc/design-system/angular/echarts';

chart.setOption(chartOption(host), true);
const stop = auroraWatchScopes(host, () => chart.setOption(chartOption(host), true));
// В ngOnDestroy: stop(); chart.dispose();
`,
  },
  legacyAlias: {
    language: 'json',
    code: `{
  "files": ["node_modules/@primasoftllc/design-system/components/src/templates/angular/index.ts"]
}
`,
  },
} satisfies Record<string, CodeSnippet>;
