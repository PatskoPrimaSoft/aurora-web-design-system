import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';
import { readTokenModel } from './model.mjs';
import { renderTokenCss, renderTypography, renderLegacyTokens } from './css.mjs';
import { serializePublicTokens } from './public-json.mjs';
import { customPropertiesFromTokens } from '../../lint/lib/tokens.js';

export function buildTokens({ root }) {
  const source = JSON.parse(readFileSync(join(root, 'design-system/tokens/source.json'), 'utf8'));
  const model = readTokenModel(source);
  const native = renderTokenCss(model);
  const typography = renderTypography(source);
  const typographyTokens = postcss.parse(typography);
  typographyTokens.each(r => { if (r.selector !== ':root') r.remove(); });
  const header = '/* Generated from design-system/tokens/source.json; do not edit. */\n';
  const tokens = header + native + typographyTokens.toString();
  const fontFaces = source.type.fonts.map(f => `@font-face { font-family: "${f.family}"; src: url("../${f.file}") format("woff2"); font-weight: ${f.weight}; font-style: ${f.style}; font-display: swap; }\n`).join('');
  const styles = header + readFileSync(join(root, 'design-system/tokens/webfonts-selfhost.css'), 'utf8') + '\n' + fontFaces + native + typography
    + ['controls', 'motion', 'icons'].map(name => readFileSync(join(root, `design-system/styles/${name}.css`), 'utf8')).join('\n');
  return { styles, tokens, legacy: header + renderLegacyTokens(model), native, source };
}
export function writeTokenOutputs({ root, outDir = join(root, 'dist') }) {
  const output = buildTokens({ root });
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'styles.css'), output.styles);
  writeFileSync(join(outDir, 'tokens.css'), output.tokens);
  writeFileSync(join(root, 'tokens.json'), serializePublicTokens(output.source));
  writeFileSync(join(root, 'tokens.css'), output.legacy);
  writeFileSync(join(root, 'design-system/tokens/scoped.css'), output.native);
  writeFileSync(join(root, 'design-system/components/bundle.css'), output.styles);
  writeFileSync(join(root, 'lint/tokens.allowed.json'), JSON.stringify({ $comment: 'Generated from design-system/tokens/source.json. Do not edit.', tokensVersion: output.source.version, namespaces: ['--ds-', '--font-ds-'], names: customPropertiesFromTokens(output.source) }, null, 2) + '\n');
  return output;
}
