import { build } from 'esbuild';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
export async function buildComponents({ root, outDir }) {
  const runtime = join(outDir, 'runtime.js'), components = join(outDir, 'components.js');
  const common = { bundle: true, format: 'iife', jsx: 'transform', target: 'es2020', tsconfigRaw: {}, write: false, logLevel: 'silent', define: { 'process.env.NODE_ENV': '"production"' } };
  const r = await build({ ...common, entryPoints: [fileURLToPath(new URL('../catalog/runtime.jsx', import.meta.url))], outfile: runtime });
  const c = await build({ ...common, entryPoints: [join(root, 'design-system/components/src/index.js')], outfile: components,
    globalName: 'AuroraWebDesignSystem_96e210', plugins: [{ name: 'shared-react', setup(builder) {
      builder.onResolve({ filter: /^react(?:-dom)?$/ }, args => ({ path: args.path, namespace: 'shared-react' }));
      builder.onLoad({ filter: /.*/, namespace: 'shared-react' }, args => ({ contents: `module.exports = window.${args.path==='react-dom'?'ReactDOM':'React'};`, loader: 'js' }));
    } }] });
  mkdirSync(outDir, { recursive: true });
  writeFileSync(runtime, r.outputFiles[0].contents);
  writeFileSync(components, c.outputFiles[0].contents);
  return { runtime, components };
}
