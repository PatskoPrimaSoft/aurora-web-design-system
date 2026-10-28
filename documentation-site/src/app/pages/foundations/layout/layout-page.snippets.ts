import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const layoutSnippets = {
  workspace: {
    language: 'css',
    fileName: 'workspace.css',
    code: `@import '@primasoftllc/design-system/styles.css';

.workspace-container {
  container-type: inline-size;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 240px) minmax(0, 1fr);
  gap: var(--ds-gap-md);
}

.workspace > * {
  min-width: 0;
}

@container (max-width: 600px) {
  .workspace {
    grid-template-columns: minmax(0, 1fr);
  }
}
`,
  },
  productGrid: {
    language: 'css',
    fileName: 'product-grid.css',
    code: `.product-grid-container {
  container-type: inline-size;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: var(--ds-gap-md);
  row-gap: var(--ds-gap-md);
  padding-inline: var(--ds-pad-md);
}

.product-grid > * {
  min-width: 0;
}

@container (max-width: 440px) {
  .product-grid {
    column-gap: var(--ds-gap-sm);
  }
}
`,
  },
} satisfies Record<string, CodeSnippet>;
