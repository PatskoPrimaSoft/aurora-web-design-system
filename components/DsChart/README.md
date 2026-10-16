# Интеграция ECharts

## Код этого примера

Код воспроизводит график выше: две линии, внешнюю легенду, порог, подсказку и таблицу данных. Установите `echarts`, разместите разметку и запускайте JavaScript после её появления в DOM.

<details>
<summary>Показать полный код примера</summary>

```html
<style>
  .scene { padding:24px; min-width:0; font:var(--ds-type-body); color:var(--ds-fg); background:var(--ds-bg); border:1px solid var(--ds-border); border-radius:var(--ds-radius-lg); }
  #chart-data { margin-top:24px; font:var(--ds-type-body); }
  #chart-data table { width:100%; border-collapse:collapse; font:var(--ds-type-mono); }
  #chart-data th, #chart-data td { padding:8px; text-align:right; border-bottom:1px solid var(--ds-divider); white-space:nowrap; }
  #chart-data th:first-child { text-align:left; }
  @media(max-width:640px) { .scene { padding:16px; } }
</style>
<section id="ready-interface" class="scene"></section>
<p>В 11:00 нет данных МАЗ — линия прерывается.</p>
<details id="chart-data">
  <summary>Показать данные графика</summary>
  <div style="overflow-x:auto">
    <table>
      <caption>Скорость объектов, км/ч</caption>
      <thead><tr><th scope="col">Время</th><th scope="col">МАЗ 5440</th><th scope="col">Volvo FH16</th></tr></thead>
      <tbody id="data-rows"></tbody>
    </table>
  </div>
</details>
```

```js
import * as echarts from 'echarts';
import { dsEChartsTheme } from '@primasoftllc/design-system/echarts-theme';
import '@primasoftllc/design-system/styles.css';

/* Общий работающий пример для руководства и страницы оформления графиков. */
(() => {
  const times = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00'];
  const series = [
    {name:'МАЗ 5440',data:[24,48,62,null,54,76,60]},
    {name:'Volvo FH16',data:[40,56,48,64,72,60,44]}
  ];
  const scene = document.getElementById('ready-interface');
  const host = document.createElement('div');
  host.id = 'echarts-plot';
  host.style.cssText = 'width:100%;height:260px;min-width:0';
  host.setAttribute('role','img');
  host.setAttribute('aria-label','Скорость объектов, км/ч. МАЗ — сплошная линия, Volvo — пунктир. В 11:00 нет данных МАЗ. Точные значения в таблице ниже.');
  const heading = document.createElement('p');
  heading.textContent = 'Скорость объектов · км/ч';
  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;margin:12px 0';
  legend.setAttribute('role','group');
  legend.setAttribute('aria-label','Видимость серий');
  scene.append(heading,legend,host);
  const chart = echarts.init(host,null,{renderer:'svg'});
  const selected = Object.fromEntries(series.map(s=>[s.name,true]));
  series.forEach((s,i)=>{
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = s.name+' км/ч';
    button.setAttribute('aria-pressed','true');
    button.style.cssText = 'font:var(--ds-type-ui);color:var(--ds-fg);background:var(--ds-surface);border:1px solid var(--ds-border-field);border-radius:var(--ds-radius-sm);padding:6px 8px;cursor:pointer';
    const swatch=document.createElement('span');
    swatch.setAttribute('aria-hidden','true');
    swatch.style.cssText='display:inline-block;width:16px;margin-right:6px;vertical-align:middle;border-top:2px '+(i?'dashed':'solid')+' var(--ds-series-'+(i+1)+')';
    button.prepend(swatch);
    button.addEventListener('click',()=>{
      selected[s.name] = !selected[s.name];
      button.setAttribute('aria-pressed',String(selected[s.name]));
      button.style.textDecoration=selected[s.name]?'none':'line-through';
      chart.dispatchAction({type:'legendToggleSelect',name:s.name});
    });
    legend.append(button);
  });
  function refresh(){
    const root = document.documentElement;
    for(const el of document.querySelectorAll('.scene'))for(const axis of ['theme','appearance','density'])
      el.setAttribute('data-ds-'+axis,root.getAttribute('data-ds-'+axis)||({theme:'DEFAULT',appearance:'light',density:'cozy'})[axis]);
    const theme = dsEChartsTheme(host);
    const {lineDefaults,barDefaults,...chrome} = theme;
    chart.setOption({...chrome,
      grid:{...chrome.grid,top:20,bottom:24,right:12,left:6},
      legend:{...chrome.legend,show:false,selected},dataZoom:[],
      tooltip:{...chrome.tooltip,renderMode:'html',confine:true,valueFormatter:value=>value==null?'Нет данных':value+' км/ч'},
      xAxis:{...chrome.xAxis,type:'category',data:times,boundaryGap:false},
      yAxis:{...chrome.yAxis,min:0,max:100},
      series:series.map((s,i)=>({...lineDefaults,...s,id:s.name,
        itemStyle:{...lineDefaults.itemStyle,color:theme.color[i]},
        lineStyle:{...lineDefaults.lineStyle,color:theme.color[i],type:i?'dashed':'solid'},
        ...(i?{}:{markLine:{silent:true,symbol:'none',lineStyle:{color:getComputedStyle(host).getPropertyValue('--ds-danger-solid').trim()},label:{show:true,position:'insideEndTop',formatter:'Лимит 90 км/ч',color:theme.textStyle.color,fontFamily:theme.textStyle.fontFamily},data:[{yAxis:90}]}})
      }))
    },true);
    chart.resize();
  }
  refresh();
  const scopeObserver = new MutationObserver(refresh);
  scopeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-ds-theme','data-ds-appearance','data-ds-density']});
  const resizeObserver = new ResizeObserver(()=>chart.resize());
  resizeObserver.observe(host);
  const rows = document.getElementById('data-rows');
  times.forEach((time,index)=>{
    const row=document.createElement('tr');
    [time,...series.map(s=>s.data[index]??'Нет данных')].forEach((value,column)=>{
      const cell=document.createElement(column?'td':'th');if(!column)cell.scope='row';cell.textContent=value;row.append(cell);
    });rows.append(row);
  });
  const palette=document.getElementById('series-palette');
  if(palette)for(let i=1;i<=8;i++){
    const item=document.createElement('div'),swatch=document.createElement('div'),label=document.createElement('code');
    swatch.className='swatch';swatch.style.background='var(--ds-series-'+i+')';label.textContent='series-'+i;item.append(swatch,label);palette.append(item);
  }
  window.addEventListener('pagehide',()=>{scopeObserver.disconnect();resizeObserver.disconnect();chart.dispose();},{once:true});
})();

```

В каталоге оформление демонстрации следует переключателям страницы. В приложении задайте нужную тему контейнеру и наблюдайте за изменениями её атрибутов на нём и предках. При удалении компонента выполните очистку наблюдателей и графика из обработчика `pagehide` в коде. В Angular для наблюдения за оформлением доступен `auroraWatchScopes` из `@primasoftllc/design-system/angular/echarts`.

</details>

## Дальше

- [Цвета и оформление графиков](../DsCharts/README.md) — палитра, шкалы и достоверность.
- [DsSparkline](../DsSparkline/README.md) — тенденция рядом с числом.
- [DsScoreBar](../DsScoreBar/README.md) — оценка на именованных диапазонах.
