import assert from 'node:assert/strict';
import {loadRuntime} from './helpers/runtime.js';
const {dom,window:w,NS,React,ReactDOM}=loadRuntime({pretendToBeVisual:true});
const h=React.createElement;
function mount(props,children){const box=w.document.createElement('div');w.document.body.append(box);const root=ReactDOM.createRoot(box);ReactDOM.flushSync(()=>root.render(h(NS.DsPageLayout,props,children)));return {box,close(){ReactDOM.flushSync(()=>root.unmount());box.remove()}}}
// A prop overrides its slot without leaking the overridden content into main.
{
const v=mount({left:h('p',null,'Actual sidebar')},[h('p',{key:'slot',slot:'left'},'Overridden sidebar'),h('p',{key:'main'},'Main content')]);
assert.equal(v.box.querySelector('main').textContent,'Main content');assert.equal(v.box.querySelector('aside').textContent,'Actual sidebar');v.close();
}
// Explicit null disables a slot; repeated slot children never become main content.
{
const v=mount({left:null},[h('p',{key:'a',slot:'left'},'Hidden sidebar'),h('p',{key:'b',slot:'left'},'Duplicate'),h('p',{key:'main'},'Content')]);
assert.equal(v.box.querySelector('aside'),null);assert.equal(v.box.querySelector('main').textContent,'Content');v.close();
}
// Names belong to the actual landmarks; skip link moves keyboard focus to main.
{
const v=mount({mainId:'objects-main',leftLabel:'Объекты',rightLabel:'Сведения',left:h('p',null,'Left'),right:h('p',null,'Right')},h('button',null,'Content action'));
assert.deepEqual([...v.box.querySelectorAll('aside')].map(n=>n.getAttribute('aria-label')),['Объекты','Сведения']);
const link=v.box.querySelector('a[href="#objects-main"]');assert.ok(link);link.click();assert.equal(w.document.activeElement,v.box.querySelector('main'));v.close();
}
// Strings follow the provider rather than fixing the interface to Russian.
{
const box=w.document.createElement('div');w.document.body.append(box);const root=ReactDOM.createRoot(box);
ReactDOM.flushSync(()=>root.render(h(NS.DsStringsProvider,{strings:NS.dsStringsEn},h(NS.DsPageLayout,null,'Content'))));
assert.equal(box.querySelector('a').textContent,'Skip to content');ReactDOM.flushSync(()=>root.unmount());box.remove();
}
dom.window.close();console.log('DsPageLayout: slots, landmark names, skip focus and localization passed');
