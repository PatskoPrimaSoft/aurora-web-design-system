/* v2 → ECharts bridge.
   The product builds its graphs with ECharts. This is the one place the design
   tokens are translated into an `EChartsOption`, so a real chart and a v2 mock
   cannot drift. Values are READ FROM THE DOM at call time, which is what makes it
   survive the three v2 scopes: call it again after [data-ds-theme],
   [data-ds-appearance] or [data-ds-density] changes and re-`setOption`.

   Angular usage (typed wrapper: templates/angular/aurora-echarts.ts):
     import { dsEChartsTheme } from '@primasoftllc/design-system/echarts-theme';
     const opt = {...dsEChartsTheme(this.host.nativeElement), series: [...]};
     this.chart.setOption(opt, true);

   This file itself is a plain global script so it can also be dropped in with a
   <script src>. The ES-module entry point is the sibling echartsTheme.mjs, which is
   what the package export map and every TS import resolve to.

   Do not hand-write colours into an option object. Do not use echarts.registerTheme
   with a static JSON theme — it cannot follow the appearance attribute. */
(function(g){
  function readVars(el){
    var cs=getComputedStyle(el||document.body),v=function(n){return cs.getPropertyValue(n).trim()};
    var series=[];for(var i=1;i<=8;i++)series.push(v('--ds-series-'+i));
    return {
      series:series,
      fg:v('--ds-fg'),label:v('--ds-chart-label'),axis:v('--ds-chart-axis'),grid:v('--ds-chart-grid'),
      crosshair:v('--ds-chart-crosshair'),marker:v('--ds-chart-marker-stroke'),
      tipBg:v('--ds-chart-tooltip-bg'),tipFg:v('--ds-chart-tooltip-fg'),
      zoomBg:v('--ds-chart-zoom-bg'),zoomFill:v('--ds-chart-zoom-window'),zoomHandle:v('--ds-chart-zoom-handle'),
      zoomPreview:v('--ds-chart-zoom-preview'),
      surface:v('--ds-surface'),border:v('--ds-border'),
      sans:v('--ds-font-sans'),mono:v('--ds-font-mono'),
      shadowMd:v('--ds-shadow-md'),radiusMd:v('--ds-radius-md'),
      lineW:parseFloat(v('--ds-chart-line-w'))||2,
      radius:parseFloat(v('--ds-radius-xs'))||4
    };
  }
  /* Returns the chrome half of an EChartsOption: colour, axes, grid, tooltip,
     legend, dataZoom, toolbox ink and the series defaults. Merge your `series`,
     `xAxis.type` and `title` on top. */
  function dsEChartsTheme(el,opts){
    var t=readVars(el),o=opts||{},labelFont={fontFamily:t.sans,fontSize:11,color:t.label};
    var axis={
      axisLine:{show:true,lineStyle:{color:t.axis,width:1}},
      axisTick:{show:false},
      axisLabel:labelFont,
      splitLine:{show:true,lineStyle:{color:t.grid,width:1,type:'dotted'}},
      axisPointer:{show:true,type:'line',animation:false,
        lineStyle:{color:t.crosshair,width:1,type:[3,3]},
        label:{backgroundColor:t.tipBg,color:t.tipFg,fontFamily:t.mono,fontSize:11,borderWidth:0,padding:[4,6]}}
    };
    return {
      color:t.series,
      backgroundColor:'transparent',
      textStyle:{fontFamily:t.sans,color:t.fg},
      animation:false,                     /* operator screens redraw on every message */
      grid:{top:o.legend===false?12:34,right:o.toolbox?38:12,bottom:o.zoom?44:24,left:6,containLabel:true},
      legend:{type:'scroll',top:0,left:0,itemWidth:14,itemHeight:3,itemGap:16,icon:'roundRect',
        textStyle:{fontFamily:t.sans,fontSize:12,color:t.label},
        inactiveColor:t.grid,pageIconColor:t.label,pageTextStyle:{color:t.label}},
      tooltip:{trigger:'axis',backgroundColor:t.tipBg,borderWidth:0,padding:[8,10],
        /* radius and shadow off the tokens too — a hard-coded black shadow was
           invisible in dark and drifted from --ds-shadow-md in light. */
        extraCssText:'border-radius:'+(t.radiusMd||'8px')+';box-shadow:'+(t.shadowMd||'none'),
        textStyle:{color:t.tipFg,fontFamily:t.sans,fontSize:12},
        axisPointer:{type:'cross',animation:false,crossStyle:{color:t.crosshair,type:[3,3]},
          label:{backgroundColor:t.tipBg,color:t.tipFg,borderWidth:0}}},
      xAxis:Object.assign({type:'time',silent:true,splitLine:{show:false}},axis,{splitLine:{show:false}}),
      yAxis:Object.assign({type:'value',splitNumber:5,silent:true},axis,{axisLine:{show:false}}),
      dataZoom:[
        {type:'inside',filterMode:'none'},
        {type:'slider',filterMode:'none',bottom:0,height:26,moveHandleSize:0,
          backgroundColor:t.zoomBg,borderColor:t.border,fillerColor:t.zoomFill,
          dataBackground:{lineStyle:{color:t.zoomPreview,width:1},areaStyle:{opacity:0}},
          selectedDataBackground:{lineStyle:{color:t.zoomHandle,width:1},areaStyle:{opacity:0}},
          handleStyle:{color:t.zoomHandle,borderColor:t.zoomHandle},
          moveHandleStyle:{color:t.zoomHandle},
          textStyle:{color:t.label,fontFamily:t.mono,fontSize:11}}
      ],
      toolbox:{orient:'vertical',left:'right',top:'center',itemGap:6,itemSize:15,
        iconStyle:{borderColor:t.label,borderWidth:1.4},
        emphasis:{iconStyle:{borderColor:t.fg,textPosition:'left',textFill:t.fg,
          textBackgroundColor:t.tipBg,textPadding:[4,6],textBorderRadius:6}}},
      /* series defaults — spread these into every line series you build */
      lineDefaults:{
        type:'line',showSymbol:false,symbolSize:7,
        lineStyle:{width:t.lineW},
        itemStyle:{borderColor:t.marker,borderWidth:2},
        connectNulls:false,          /* a silent tracker is a gap, not a straight line */
        animation:false,
        emphasis:{focus:'series',lineStyle:{width:t.lineW+1}},
        markPoint:{symbol:'circle',symbolSize:7,label:{fontFamily:t.mono,fontSize:11,color:t.fg,position:'top'}},
        markArea:{itemStyle:{opacity:0.5},silent:true,animation:false}
      },
      barDefaults:{type:'bar',barMaxWidth:22,itemStyle:{borderRadius:[t.radius,t.radius,0,0]},animation:false}
    };
  }
  dsEChartsTheme.read=readVars;
  g.dsEChartsTheme=dsEChartsTheme;
  if(typeof module!=='undefined'&&module.exports)module.exports={dsEChartsTheme:dsEChartsTheme};
})(typeof window!=='undefined'?window:globalThis);
