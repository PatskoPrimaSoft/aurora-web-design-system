import {SpinnerDemo} from './spinner-demo';
import {CheckboxDemo} from './checkbox-demo';
import {FabDemo} from './fab-demo';
import {Component,inject,Injector} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {ButtonDemo} from './button-demo';
import {IconDemo} from './icon-demo';
import {provideAurora,AuroraScopeDirective,AuroraThemeService} from '@primasoftllc/design-system/angular';
@Component({selector:'app-root',imports:[AuroraScopeDirective,ButtonDemo,IconDemo,FabDemo,CheckboxDemo,SpinnerDemo],template:`<h1>Angular core</h1><section auroraScope density="compact"><button id="theme-toggle" (click)="toggle()">Переключить оформление</button></section><button-demo /><icon-demo /><fab-demo /><checkbox-demo /><spinner-demo />`,host:{'data-ready':'true'}})
class Root {
  private readonly injector=inject(Injector);
  toggle(){const service=this.injector.get(AuroraThemeService);service.setAppearance(service.appearance()==='dark'?'light':'dark');}
}
bootstrapApplication(Root,{providers:[...provideAurora({theme:'RED2'})]}).catch(error=>{console.error(error);throw error;});
