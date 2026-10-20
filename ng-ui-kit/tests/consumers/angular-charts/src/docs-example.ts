import type {EChartsOption} from 'echarts/types/dist/echarts';
import {auroraChartChrome} from '@primasoftllc/design-system/angular/echarts';

export function chartOption(host: HTMLElement): EChartsOption {
  const chrome = auroraChartChrome(host);
  return {
    ...chrome,
    xAxis: {...chrome.xAxis, type: 'time'},
    series: [{type: 'line', data: [[Date.now(), 42]]}],
  };
}
