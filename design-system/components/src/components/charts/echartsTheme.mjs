/* ES-module entry point for the token → ECharts bridge.

   echartsTheme.js is deliberately a plain global script: it has to stay droppable
   into a page with a bare <script src> and it is inlined into the design-system
   bundle. That form has no ES exports, and because the package declares
   "type": "module" a `import { dsEChartsTheme } from './echartsTheme.js'` resolves
   to a module with no such binding — which is what used to break the Angular entry
   point. This adapter runs that script for its side effect and re-exports the
   function as a real named export. Import THIS file (or the package's
   "./echarts-theme" export, which points here). */
import './echartsTheme.js';

const impl = /** @type {any} */ (globalThis).dsEChartsTheme;
if (!impl) throw new Error('echartsTheme.js did not register dsEChartsTheme on the global object');

export const dsEChartsTheme = impl;
export default dsEChartsTheme;
