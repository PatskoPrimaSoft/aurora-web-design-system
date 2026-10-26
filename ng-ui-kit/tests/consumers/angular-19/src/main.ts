import {Component,inject,Injector} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {ButtonDemo} from './button-demo';
import {provideAurora,AuroraScopeDirective,AuroraThemeService} from '@primasoftllc/design-system/angular';
@Component({selector:'app-root',imports:[AuroraScopeDirective,ButtonDemo],template:`<h1>Angular core</h1><section auroraScope density="compact"><button id="theme-toggle" (click)="toggle()">Переключить оформление</button></section><button-demo />`,host:{'data-ready':'true'}})
class Root {
  private readonly injector=inject(Injector);
  toggle(){const service=this.injector.get(AuroraThemeService);service.setAppearance(service.appearance()==='dark'?'light':'dark');}
}
bootstrapApplication(Root,{providers:[...provideAurora({theme:'RED2'})]}).catch(error=>{console.error(error);throw error;});
