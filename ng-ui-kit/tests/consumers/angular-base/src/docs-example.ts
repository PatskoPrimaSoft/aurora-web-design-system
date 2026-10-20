import {ApplicationConfig} from '@angular/core';
import {provideAurora} from '@primasoftllc/design-system/angular';

export const appConfig: ApplicationConfig = {
  providers: [...provideAurora({theme: 'DEFAULT'})],
};
