import {Component,inject,Injector} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideAurora,AuroraThemeService,AURORA_CONFIG,AuroraScopeDirective,auroraChartChrome,auroraWatchScopes,AURORA_ATTR,AURORA_DEFAULTS,AURORA_STORAGE,type AuroraScopes,type DsTheme,type DsAppearance,type DsDensity,type AuroraChartChrome} from '@primasoftllc/design-system/angular';
import {AuroraThemeService as NewService,AURORA_CONFIG as NewConfig} from '../node_modules/@primasoftllc/design-system/dist/angular/core.mjs';
@Component({selector:'app-root',standalone:true,imports:[AuroraScopeDirective],template:`<h1>Angular legacy</h1><section id="legacy" auroraScope density="compact">Совместимый алиас</section>`,host:{'data-ready':'true'}})
class Root {
 constructor(){const injector=inject(Injector);const scope:AuroraScopes={theme:'RED2' as DsTheme,appearance:'light' as DsAppearance,density:'cozy' as DsDensity};
  (window as any).legacyCheck={sameService:AuroraThemeService===NewService,sameConfig:AURORA_CONFIG===NewConfig,sameInstance:injector.get(AuroraThemeService)===injector.get(NewService),scope,attributes:AURORA_ATTR,defaults:AURORA_DEFAULTS,storage:AURORA_STORAGE,chart:typeof auroraChartChrome==='function',watch:typeof auroraWatchScopes==='function'};
 }
}
bootstrapApplication(Root,{providers:[...provideAurora({theme:'RED2'})]}).catch(error=>{console.error(error);throw error;});
