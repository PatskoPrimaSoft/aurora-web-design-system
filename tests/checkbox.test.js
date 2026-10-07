import assert from 'node:assert/strict';
import {loadRuntime} from './helpers/runtime.js';
const {window:w}=loadRuntime({html:'<!doctype html><body></body>',pretendToBeVisual:true});
const NS=w[Object.keys(w).find(k=>k.startsWith('AuroraWebDesignSystem_'))];
const {React,ReactDOM}=w,h=React.createElement;
const render=props=>{
  const host=w.document.createElement('div');w.document.body.append(host);
  const root=ReactDOM.createRoot(host);
  const update=p=>ReactDOM.flushSync(()=>root.render(h(NS.DsCheckbox,p)));
  update(props);return {host,update,input:host.querySelector('input')};
};
for(const [state,next,glyph] of [['unchecked','checked',''],['checked','unchecked','check'],['indeterminate','checked','remove']]){
  const calls=[],props={state,ariaLabel:'Select',onChange:next=>calls.push(next)};
  const {host,input,update}=render(props);
  assert.equal(input.getAttribute('aria-label'),'Select');
  assert.equal(input.checked,state==='checked');
  assert.equal(input.indeterminate,state==='indeterminate');
  assert.equal(host.querySelector('[aria-hidden="true"]').textContent,glyph);
  ReactDOM.flushSync(()=>host.querySelector('label').click());
  assert.deepEqual(calls,[next]);
  assert.equal(input.indeterminate,state==='indeterminate','controlled DOM state stays in sync until parent updates');
  update({...props,state:next});
  assert.equal(input.checked,next==='checked');assert.equal(input.indeterminate,false);
}
for(const state of ['unchecked','checked','indeterminate']){
  const {input}=render({state,label:'Read only'});
  ReactDOM.flushSync(()=>input.click());
  assert.equal(input.checked,state==='checked');assert.equal(input.indeterminate,state==='indeterminate');
  const calls=[];const disabled=render({state,disabled:true,onChange:n=>calls.push(n)});
  ReactDOM.flushSync(()=>disabled.input.click());assert.deepEqual(calls,[]);
}
const a=render({label:'First',description:'First explanation'}),b=render({label:'Second',description:'Second explanation'});
assert.notEqual(a.input.getAttribute('aria-describedby'),b.input.getAttribute('aria-describedby'));
assert.equal(w.document.getElementById(a.input.getAttribute('aria-describedby')).textContent,'First explanation');
const radio=render({radio:true,state:'indeterminate',label:'Radio'});
assert.equal(radio.input.checked,false);assert.equal(radio.input.indeterminate,false);
assert.equal(radio.input.getAttribute('aria-checked'),null);
assert.equal(NS.DsCheck,undefined);assert.equal(NS.DsCheckButton,undefined);assert.equal(NS.DsSelectBox,undefined);
console.log('checkbox: unified states, controlled updates, labels, descriptions, disabled and exports passed');
w.close();
