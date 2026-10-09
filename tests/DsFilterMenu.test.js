import {loadRuntime} from './helpers/runtime.js';
// Поведенческий тест №10: 0, отрицательные и диапазон от нуля — реальные значения.
/* Запуск: node tests/DsFilterMenu.test.js [путь к bundle.js]
   Нужен jsdom (npm i -D jsdom). Проверяет собранный бандл, а не исходник:
   ловит и ошибку в коде, и бандл, пересобранный не из того исходника. */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url);
import ts from 'typescript';
import assert from 'node:assert/strict';
const program=ts.createProgram([fileURLToPath(new URL('./fixtures/filter-menu-types.tsx',import.meta.url))],{noEmit:true,strict:true,jsx:ts.JsxEmit.React,moduleResolution:ts.ModuleResolutionKind.Bundler,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022});
const diagnostics=ts.getPreEmitDiagnostics(program);assert.equal(diagnostics.length,0,diagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('\n'));
const {JSDOM}=require('jsdom');
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const {dom,window:w}=loadRuntime({html:'<!doctype html><body><div id=r></div></body>',pretendToBeVisual:true});
const d=w.document;
const NS=Object.keys(w).find(k=>k.startsWith('AuroraWebDesignSystem_'));const {DsFilterMenu}=w[NS];
const {React,ReactDOM}=w; w.IS_REACT_ACT_ENVIRONMENT=true;
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++};
function mount(props){const el=w.document.createElement('div');w.document.body.appendChild(el);
  let applied;const root=ReactDOM.createRoot(el);
  w.ReactDOM.flushSync(()=>root.render(React.createElement(DsFilterMenu,{label:'L',...props,onApply:v=>{applied=v}})));
  w.ReactDOM.flushSync(()=>el.querySelector('button').click());
  return {el,applied:()=>applied,inputs:()=>[...el.querySelectorAll('input')],apply:()=>{w.ReactDOM.flushSync(()=>[...el.querySelectorAll('button')].find(b=>b.textContent==='Применить').click());return applied},
    type:(i,v)=>{const inp=el.querySelectorAll('input')[i];const set=Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set;
      w.ReactDOM.flushSync(()=>{set.call(inp,v);inp.dispatchEvent(new w.Event('input',{bubbles:true}))})}};}
let m=mount({type:'number',value:0});ok(m.inputs()[0].value==='0','number: 0 показывается как 0');
ok(m.apply()===0,'number: Apply без правок отдаёт 0 (число)');
m=mount({type:'number',value:-5});ok(m.inputs()[0].value==='-5','number: отрицательное показывается');
m=mount({type:'number',value:null});ok(m.inputs()[0].value==='','number: null — пустое поле');
m.type(0,'0');ok(m.apply()===0,'number: ввод «0» даёт число 0, а не строку');
m=mount({type:'number',value:7});m.type(0,'');ok(m.apply()===null,'number: стёртое поле даёт null');
m=mount({type:'number-range',value:{from:0,to:100}});ok(m.inputs()[0].value==='0'&&m.inputs()[1].value==='100','range: диапазон от нуля показывается');
m.type(1,'');const r=m.apply();ok(r.from===0&&r.to===null,'range: {from:0,to:null} после очистки «До»');
m=mount({type:'number-range',value:undefined});m.type(0,'-10');const r2=m.apply();ok(r2.from===-10&&r2.to===null,'range: из пустого — {from:-10,to:null}');
m=mount({type:'string',value:'abc'});m.type(0,'');ok(m.apply()===null,'string: стёртое поле даёт null');
// индикатор активного фильтра на триггере
const trig=v=>{const el=w.document.createElement('div');w.document.body.appendChild(el);w.ReactDOM.flushSync(()=>ReactDOM.createRoot(el).render(React.createElement(DsFilterMenu,{label:'L',type:'number-range',value:v})));return el.querySelector('[data-ds-filter-menu]').getAttribute('data-active')==='true'};
ok(trig({from:0,to:null}),'триггер: диапазон от нуля — фильтр активен');
ok(!trig({from:null,to:null}),'триггер: пустой диапазон — не активен');
ok(!trig({from:'',to:''}),'триггер: старый формат {from:"",to:""} — не активен');
ok(trig(0),'триггер: 0 — фильтр активен');
m=mount({type:'checkbox-list',value:['moving'],options:[{label:'На связи',options:[{value:'moving',label:'Движение',count:62},{value:'parked',label:'Стоянка'}]},{label:'Нет данных',options:[{value:'offline',label:'Нет связи'}]}]});
ok(m.el.querySelectorAll('[role="group"]').length===2,'checkbox-list: подписанные группы');
ok(m.inputs().length===3,'checkbox-list: плоский список значений внутри групп');
ReactDOM.flushSync(()=>m.inputs()[2]?.click());
ok(JSON.stringify(m.apply())===JSON.stringify(['moving','offline']),'checkbox-list: выбор из разных групп применяется одним массивом');
m=mount({type:'checkbox-list',value:[],options:['First',{value:'second',label:'Second'}]});
ok(m.inputs().length===2,'checkbox-list: варианты без групп остаются доступными');
m=mount({type:'checkbox-list',value:['moving','parked'],options:[{value:'moving',label:'Движение'},{value:'parked',label:'Стоянка'}]});
ok(m.el.querySelector('button').textContent.includes('Движение +1'),'триггер: краткое выбранное значение');
ok(m.el.querySelector('button').getAttribute('aria-label')==='L: Движение, Стоянка','триггер: полное значение доступно скринридеру');
m=mount({type:'number-range',value:{from:0,to:80}});ok(m.el.querySelector('button').textContent.includes('0–80'),'триггер: обе границы включая ноль');
let cleared=0;m=mount({type:'string',value:'Грузовик',onClear:()=>cleared++});
const clear=m.el.querySelector('[data-ds-filter-clear]');ok(!!clear,'триггер: отдельная кнопка очистки');
if(clear){ReactDOM.flushSync(()=>clear.click());ok(cleared===1,'очистка: один вызов без применения черновика');ok(!m.el.querySelector('[role="dialog"]'),'очистка: поповер закрыт');}
for(const [type,value,empty] of [['checkbox-list',['moving'],[]],['number-range',{from:0,to:80},{from:null,to:null}],['string','Truck',null]]){
 m=mount({type,value});ReactDOM.flushSync(()=>m.el.querySelector('[data-ds-filter-clear]').click());ok(JSON.stringify(m.applied())===JSON.stringify(empty),'очистка без onClear: '+type);
}
m=mount({type:'number',value:0,formatValue:v=>v+' км/ч'});ok(m.el.querySelector('button').textContent.includes('0 км/ч'),'триггер: пользовательский формат сохраняет ноль');
m=mount({type:'number-range',value:{from:90,to:10}});ok(m.apply()===undefined,'range: неверный диапазон не применяется');ok(!!m.el.querySelector('[role="dialog"]'),'range: ошибка оставляет редактор открытым');
m=mount({type:'date-range',value:{from:'2026-10-09',to:'2026-10-01'}});ok(m.apply()===undefined,'date-range: неверный порядок дат не применяется');
m=mount({type:'checkbox-list',value:['moving'],searchable:true,options:[{label:'Activity',options:[{value:'moving',label:'Moving'},{value:'parked',label:'Parked',disabled:true,description:'No permission'}]}]});
ok(!!m.el.querySelector('input[type="search"]'),'checkbox-list: поиск');ok(m.el.querySelector('input[aria-label="Parked"]')?.disabled,'checkbox-list: недоступный вариант');
if(m.el.querySelector('input[type="search"]')){m.type(0,'moving');ok(m.el.querySelectorAll('input[type="checkbox"]').length===1,'checkbox-list: поиск внутри групп');}
m=mount({type:'checkbox-list',value:['moving'],loading:true,options:['moving']});ok(!!m.el.querySelector('[data-ds-spinner]'),'checkbox-list: загрузка');ok(m.inputs().length===0,'checkbox-list: во время загрузки выбор недоступен');
if(fails){console.error(fails+' FAIL');process.exit(1)}console.log('все проверки прошли');
