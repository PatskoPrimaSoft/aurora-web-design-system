/**
 * Мост «токены → EChartsOption». Читает CSS-переменные с реального узла, поэтому
 * после смены темы, оформления или плотности его нужно вызвать заново и сделать
 * setOption. Статическую JSON-тему регистрировать нельзя — она не следит за атрибутом.
 */
import type { EChartsOption } from 'echarts/types/dist/echarts';
import { dsEChartsTheme } from '@primasoftllc/design-system/echarts-theme';

export interface AuroraChartChrome {
  color: string[];
  textStyle: Record<string, unknown>;
  grid: Record<string, unknown>;
  xAxis: Record<string, unknown>;
  yAxis: Record<string, unknown>;
  tooltip: Record<string, unknown>;
  legend: Record<string, unknown>;
  dataZoom: EChartsOption['dataZoom'];
  animation: boolean;
  [key: string]: unknown;
}

/** Хром графика, вычисленный от узла: он определяет, какая тема и плотность действуют. */
export function auroraChartChrome(host: HTMLElement, opts?: { zoom?: boolean }): AuroraChartChrome {
  return dsEChartsTheme(host, opts) as AuroraChartChrome;
}

/**
 * Пересобирает хром при смене любого из трёх скоупов на самом узле или на ЛЮБОМ его
 * предке (включая промежуточную панель с auroraScope, <body> и <html>): вложенное
 * переопределение темы — заявленный контракт, см. readme.md §4.1.
 * Возвращает функцию отписки — вызвать в ngOnDestroy.
 *
 *   this.stop = auroraWatchScopes(el, () => this.chart.setOption(this.buildOption(), true));
 */
export function auroraWatchScopes(host: HTMLElement, onChange: () => void): () => void {
  const attrs = ['data-ds-theme', 'data-ds-appearance', 'data-ds-density'];
  const obs = new MutationObserver(() => onChange());
  for (let node: HTMLElement | null = host; node; node = node.parentElement) {
    obs.observe(node, { attributes: true, attributeFilter: attrs });
  }
  const root = host.ownerDocument.documentElement;
  if (root && !root.contains(host)) obs.observe(root, { attributes: true, attributeFilter: attrs });
  return () => obs.disconnect();
}
