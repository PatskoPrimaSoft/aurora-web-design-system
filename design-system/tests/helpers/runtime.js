import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
export function loadRuntime({ html = '<!doctype html><body></body>', pretendToBeVisual = false } = {}) {
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual });
  for (const name of ['runtime.js', 'components.js']) dom.window.eval(readFileSync(new URL(`../../../.tmp/runtime/${name}`, import.meta.url), 'utf8'));
  return { dom, window: dom.window, React: dom.window.React, ReactDOM: dom.window.ReactDOM, NS: dom.window.AuroraWebDesignSystem_96e210 };
}
