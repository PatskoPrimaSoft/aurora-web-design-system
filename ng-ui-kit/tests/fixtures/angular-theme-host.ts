import assert from 'node:assert/strict';
import {ApplicationInitStatus, type Provider} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {TestBed} from '@angular/core/testing';
import {provideAurora,AuroraThemeService,type AuroraScopes} from '../../../dist/angular/core.mjs';

export async function checkTheme(doc:Document,config:Partial<AuroraScopes>,expected:AuroraScopes) {
  const providers:Provider[]=provideAurora(config);
  TestBed.configureTestingModule({providers:[{provide:DOCUMENT,useValue:doc},...providers]});
  try {
    const init=TestBed.inject(ApplicationInitStatus);init.runInitializers();await init.donePromise;
    // Проверяем запуск до ручного получения сервиса.
    for(const [scope,value]of Object.entries(expected))assert.equal(doc.body?.getAttribute('data-ds-'+scope),value,scope);
    assert.equal(doc.body.className,'theme-app');
    const service=TestBed.inject(AuroraThemeService);assert.equal(service,TestBed.inject(AuroraThemeService));
    service.setAppearance(expected.appearance==='dark'?'light':'dark');service.setDensity(expected.density==='compact'?'cozy':'compact');
    TestBed.flushEffects();
    assert.equal(doc.body.getAttribute('data-ds-appearance'),service.appearance());
    assert.equal(doc.body.getAttribute('data-ds-density'),service.density());
    try {assert.equal(doc.defaultView?.localStorage.getItem('ds-theme'),null);}catch(error){if(error instanceof assert.AssertionError)throw error;}
  }finally{TestBed.resetTestingModule();}
}

export async function checkMissingBody(doc:Document) {
  doc.body.remove();
  TestBed.configureTestingModule({providers:[{provide:DOCUMENT,useValue:doc},...provideAurora({theme:'RED2'})]});
  try{
    const init=TestBed.inject(ApplicationInitStatus);init.runInitializers();await init.donePromise;
    TestBed.flushEffects();
    const body=doc.createElement('body');doc.documentElement.append(body);
    TestBed.inject(AuroraThemeService).setDensity('compact');TestBed.flushEffects();
    assert.equal(body.getAttribute('data-ds-theme'),'RED2');assert.equal(body.getAttribute('data-ds-density'),'compact');
  }finally{TestBed.resetTestingModule();}
}
