import {Component,AfterViewInit} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideAurora} from '@primasoftllc/design-system/angular';
import {auroraChartChrome,auroraWatchScopes} from '@primasoftllc/design-system/angular/echarts';
import theme,{dsEChartsTheme} from '@primasoftllc/design-system/echarts-theme';
import{init,use}from'echarts/core';import{LineChart}from'echarts/charts';import{GridComponent,TooltipComponent,LegendComponent,DataZoomComponent}from'echarts/components';import{CanvasRenderer}from'echarts/renderers';
use([LineChart,GridComponent,TooltipComponent,LegendComponent,DataZoomComponent,CanvasRenderer]);
@Component({selector:'app-root',standalone:true,template:`<h1>Angular charts</h1><div id="panel" data-ds-appearance="dark"><div id="chart" style="width:500px;height:250px"></div></div>`,host:{'data-ready':'true'}})
class Root implements AfterViewInit {
 ngAfterViewInit(){
  const host=document.getElementById('chart')!,chart=init(host);let callbacks=0;
  const state:any={sameTheme:theme===dsEChartsTheme,read:dsEChartsTheme.read(host)};
  const update=()=>{callbacks++;state.callbacks=callbacks;state.option=auroraChartChrome(host);state.read=dsEChartsTheme.read(host);chart.setOption({...state.option,xAxis:{...state.option.xAxis,data:['A','B','C']},series:[{type:'line',data:[1,2,3]}]},true);};
  update();state.stop=auroraWatchScopes(host,update);(window as any).auroraCheck=state;
 }
}
bootstrapApplication(Root,{providers:[...provideAurora({theme:'DEFAULT'})]}).catch(error=>{console.error(error);throw error;});
