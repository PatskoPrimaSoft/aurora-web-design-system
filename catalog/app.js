import {searchCards} from './search.js';
import {familyFor} from './families.js';
import {parseState,stateUrl,comparisonScopes} from './state.js';
const cards=await(await fetch('cards.json')).json();
let state=parseState(new URL(location.href),cards),renderedKey=null,frames=[];
const nav=document.getElementById('cards'),viewports=document.getElementById('viewports'),search=document.getElementById('search'),compare=document.getElementById('compare');
function save(push=false){history[push?'pushState':'replaceState'](null,'',stateUrl(location.href,state));}
function drawNavigation(){
 const found=searchCards(cards,state.query),groups=new Map();nav.replaceChildren();
 document.getElementById('count').textContent=`${found.length} из ${cards.length} карточек`;
 document.getElementById('search-empty').hidden=found.length>0;
 for(const card of found){
  const family=card.group==='2 · Основы'?null:familyFor(card.id);
  const name=family?card.group.split(' · ').slice(0,2).join(' · ')+' · '+family.title.toLocaleLowerCase('ru'):card.group;
  if(!groups.has(name))groups.set(name,[]);groups.get(name).push(card);
 }
 const orderedGroups=[...groups].sort(([nameA],[nameB])=>nameA.localeCompare(nameB,'ru',{numeric:true}));
 for(const[name,items]of orderedGroups){const h=document.createElement('h2');h.textContent=name;nav.append(h);
  for(const card of items){const link=document.createElement('a');link.href=stateUrl(location.href,{...state,cardId:card.id});link.dataset.id=card.id;link.textContent=card.title;
   if(card.id===state.cardId)link.setAttribute('aria-current','page');
   link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;event.preventDefault();state={...state,cardId:card.id,unknown:false};save(true);render();});nav.append(link);}
 }
}
function scopeFrame(record){
 const scope=state.compare?record.fixed:state.scope;
 for(const[name,value]of Object.entries(scope))record.element.contentDocument?.documentElement?.setAttribute('data-ds-'+name,value);
 const caption=`${scope.theme} / ${scope.appearance} / ${scope.density}`;
 record.caption.textContent=caption;record.element.title=record.card.title+' — '+caption;
}
function scopePreviewLink(event,record){
 const link=event.target.closest?.('a[target="_top"][href]');
 if(!link)return;
 const url=new URL(link.href),catalogue=new URL('index.html',location.href);
 if(url.origin!==catalogue.origin||url.pathname!==catalogue.pathname||!url.searchParams.has('card'))return;
 link.href=stateUrl(location.href,{...state,cardId:url.searchParams.get('card'),scope:state.compare?record.fixed:state.scope});
}
function referenceLinks(card){
 const target=document.getElementById('reference-links');target.replaceChildren();
 for(const ref of [...(card.apiPaths??[]),...(card.documentationPath&&!card.documentationHtml?[{name:'Описание',path:card.documentationPath}]:[])]){
  const link=document.createElement('a'),url=new URL(ref.path,location.href);for(const[name,value]of Object.entries(state.scope))url.searchParams.set(name,value);
  link.href=url;link.textContent=ref.name==='Описание'?ref.name:'API '+ref.name;if(target.childNodes.length)target.append(document.createTextNode(' · '));target.append(link);
 }
 target.hidden=!target.childNodes.length;
}
function describeCard(card){
 const target=document.getElementById('card-description');
 target.hidden=!card?.documentationHtml;
 // This HTML is generated locally by renderMarkdown with raw HTML disabled.
 target.innerHTML=card?.documentationHtml??'';
 for(const link of target.querySelectorAll('a[href]')){
  const url=new URL(link.getAttribute('href'),location.href);
  if(url.origin!==location.origin)continue;
  for(const[name,value]of Object.entries(state.scope))url.searchParams.set(name,value);
  link.href=url;
 }
}
function render(){
 for(const[name,value]of Object.entries(state.scope)){document.documentElement.setAttribute('data-ds-'+name,value);document.getElementById(name).value=value;}
 search.value=state.query;compare.setAttribute('aria-pressed',String(state.compare));compare.disabled=state.unknown;drawNavigation();
 const card=cards.find(card=>card.id===state.cardId),error=document.getElementById('card-error');error.hidden=!!card;
 describeCard(card);
 if(!card){document.getElementById('title').textContent='Карточка не найдена';document.getElementById('subtitle').textContent='Выберите карточку в навигации или вернитесь к началу.';document.getElementById('missing-id').textContent=state.cardId;for(const record of frames)record.resizeObserver?.disconnect();viewports.replaceChildren();document.getElementById('reference-links').replaceChildren();frames=[];renderedKey=null;document.getElementById('local-note').hidden=true;return;}
 document.getElementById('title').textContent=card.title;document.getElementById('subtitle').textContent=card.subtitle;document.getElementById('local-note').hidden=card.scopeMode!=='local';referenceLinks(card);
 const key=card.id+'|'+state.compare;
 const documentPreview=card.id==='overview'||card.id==='DsBreakpointsDecisions';
 if(key!==renderedKey){
  for(const record of frames)record.resizeObserver?.disconnect();
  viewports.replaceChildren();frames=[];viewports.className=state.compare?'preview-matrix':'single-preview';
  for(const[index,fixed]of (state.compare?comparisonScopes:[state.scope]).entries()){
   const panel=document.createElement('figure'),caption=document.createElement('figcaption'),scroll=document.createElement('div'),frame=document.createElement('iframe');
   panel.className='preview-panel';scroll.className='preview-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');caption.id='preview-caption-'+index;scroll.setAttribute('aria-labelledby',caption.id);frame.id=state.compare?'preview-'+index:'preview';frame.style.width=card.viewport.width+'px';frame.style.height=card.viewport.height+'px';
   if(documentPreview){
    panel.classList.add('document-preview');frame.style.width='100%';
    scroll.removeAttribute('tabindex');scroll.removeAttribute('role');scroll.removeAttribute('aria-labelledby');
   }
   const record={element:frame,caption,fixed,card};frames.push(record);frame.addEventListener('load',()=>{
    scopeFrame(record);
    if(documentPreview){
     record.resizeObserver?.disconnect();
     const fit=()=>{frame.style.height=Math.ceil(frame.contentDocument.body.getBoundingClientRect().height)+'px';};
     record.resizeObserver=new ResizeObserver(fit);record.resizeObserver.observe(frame.contentDocument.body);fit();
    }
    for(const event of ['click','auxclick','contextmenu'])frame.contentDocument.addEventListener(event,e=>scopePreviewLink(e,record));
   });
   const url=new URL(card.previewPath,location.href);for(const[name,value]of Object.entries(fixed))url.searchParams.set(name,value);frame.src=url;
   panel.append(caption,scroll);scroll.append(frame);viewports.append(panel);
  }
  renderedKey=key;
 }
 for(const record of frames)scopeFrame(record);
}
search.addEventListener('input',()=>{state.query=search.value;save();drawNavigation();});
for(const name of ['theme','appearance','density'])document.getElementById(name).addEventListener('change',event=>{state.scope[name]=event.target.value;save(true);render();});
compare.addEventListener('click',()=>{state.compare=!state.compare;save(true);render();});
document.getElementById('return-catalogue').addEventListener('click',()=>{state={...state,cardId:cards[0].id,query:'',unknown:false};save(true);render();});
for(const event of ['popstate','hashchange'])window.addEventListener(event,()=>{state=parseState(new URL(location.href),cards);render();});
render();
