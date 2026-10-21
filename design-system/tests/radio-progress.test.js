import assert from 'node:assert/strict';
import {loadRuntime} from './helpers/runtime.js';
const {window:w}=loadRuntime({html:'<!doctype html><body></body>',pretendToBeVisual:true});
const S=w.AuroraWebDesignSystem_96e210,{React,ReactDOM}=w,h=React.createElement;
assert.equal(typeof S.DsRadioGroup,'function','RadioGroup must be public');
assert.equal(typeof S.DsProgressBar,'function','ProgressBar must be public');
function render(element){const host=w.document.createElement('div');w.document.body.append(host);const root=ReactDOM.createRoot(host);ReactDOM.flushSync(()=>root.render(element));return {host,update:element=>ReactDOM.flushSync(()=>root.render(element))};}
const options=[{value:'a',label:'First',description:'First explanation'},{value:'b',label:'Second'},{value:'c',label:'Unavailable',disabled:true}];
const calls=[];
const {host,update}=render(h('form',null,h(S.DsRadioGroup,{label:'Mode',name:'mode',options,defaultValue:'a',onChange:value=>calls.push(value)})));
const form=host.querySelector('form'),inputs=host.querySelectorAll('input');
assert.equal(new w.FormData(form).get('mode'),'a');
ReactDOM.flushSync(()=>inputs[1].click());assert.equal(new w.FormData(form).get('mode'),'b');assert.deepEqual(calls,['b']);
ReactDOM.flushSync(()=>form.reset());await new Promise(r=>setTimeout(r,0));assert.equal(new w.FormData(form).get('mode'),'a');
assert.equal(inputs[2].disabled,true);
assert.equal(w.document.getElementById(inputs[0].getAttribute('aria-describedby')).textContent,'First explanation');
update(h('form',null,h(S.DsRadioGroup,{label:'Mode',name:'mode',options,value:'a',onChange:value=>calls.push(value)})));
ReactDOM.flushSync(()=>host.querySelectorAll('input')[1].click());assert.equal(new w.FormData(host.querySelector('form')).get('mode'),'a','controlled value remains authoritative');
update(h('form',null,h(S.DsRadioGroup,{label:'Mode',name:'mode',options,value:'b'})));
ReactDOM.flushSync(()=>host.querySelector('form').reset());await new Promise(r=>setTimeout(r,0));
assert.equal(new w.FormData(host.querySelector('form')).get('mode'),'b','reset preserves the latest controlled value');
for(const [value,max,want] of [[0,100,0],[50,100,50],[150,100,100],[-1,100,0]]){
 const {host}=render(h(S.DsProgressBar,{label:'Export',value,max}));const bar=host.querySelector('[role=progressbar]');
 assert.equal(Number(bar.getAttribute('aria-valuenow')),want);assert.equal(bar.getAttribute('aria-valuemax'),'100');
}
for(const value of [undefined,NaN,Infinity]){
 const {host}=render(h(S.DsProgressBar,{label:'Processing',value}));assert.equal(host.querySelector('[role=progressbar]').hasAttribute('aria-valuenow'),false);
}
console.log('radio-progress: native form state/reset, disabled options, descriptions and progress semantics passed');
w.close();
