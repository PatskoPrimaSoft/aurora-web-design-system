import {mountCatalogueShell} from './shell.js';
import {createCatalogueNavigation} from './navigation.js';
import {parseState,stateUrl,comparisonScopes} from './state.js';
import {enhanceCodeBlocks,createPageContents} from './documentation.js';
const cards=await(await fetch('cards.json')).json();
const foundationGuides=new Set(['DsType','DsNeutrals','DsBrandThemes','DsAppearance','DsDensity','DsHover','DsFocus','DsBreakpoints','DsSortingMenu','DsCharts']);
let state=parseState(new URL(location.href),cards),renderedKey=null,frames=[];
let disposeContents=()=>{};
const {DsMenu,DsButton}=window.AuroraWebDesignSystem_96e210;
const h=window.React.createElement;
mountCatalogueShell();
const nav=document.getElementById('cards'),viewports=document.getElementById('viewports'),search=document.getElementById('search');
const previewControls=document.createElement('div');
previewControls.className='catalog-controls';previewControls.setAttribute('role','group');previewControls.setAttribute('aria-label','Настройки примера');
document.querySelector('.catalog-header').append(previewControls);
const controlsRoot=window.ReactDOM.createRoot(previewControls);
const scopeFields=[
 {id:'theme',label:'Бренд',options:['DEFAULT','RED2']},
 {id:'appearance',label:'Оформление',options:[{value:'light',label:'Светлое'},{value:'dark',label:'Тёмное'}]},
 {id:'density',label:'Плотность',options:[{value:'cozy',label:'Обычная'},{value:'compact',label:'Компактная'}]},
];
function renderControls(){
 window.ReactDOM.flushSync(()=>controlsRoot.render(h(window.React.Fragment,null,
   ...scopeFields.map(field=>{
    const options=field.options.map(option=>typeof option==='string'?{value:option,label:option}:option);
    const selected=options.find(option=>option.value===state.scope[field.id]);
    return h(DsMenu,{key:field.id,menuLabel:field.label,width:180,
     trigger:h(DsButton,{id:field.id,tone:'subtle',iconRight:'expand_more','aria-label':field.label+': '+selected.label},selected.label),
     items:options.map(option=>({id:option.value,label:option.label,type:'radio',checked:option.value===state.scope[field.id]})),
     onSelect:item=>{state.scope[field.id]=item.id;save(true);render();}
    });
   }),
   h(DsButton,{id:'compare',tone:state.compare?'subtle':'secondary','aria-pressed':state.compare,disabled:state.unknown,onClick:()=>{state.compare=!state.compare;save(true);render();}},'Сравнить 4 режима')
 )));
}
const titleStatus=document.getElementById('card-status'),titleStatusRoot=window.ReactDOM.createRoot(titleStatus);
function renderStatus(root,card){window.ReactDOM.flushSync(()=>root.render(card?.status==='deprecated'?window.React.createElement(window.AuroraWebDesignSystem_96e210.DsLozenge,{tone:'warning',size:'sm'},'Устарело'):null));}
const examplesHeading=document.createElement('h2');examplesHeading.id='examples-heading';examplesHeading.textContent='Живые примеры';examplesHeading.hidden=true;viewports.before(examplesHeading);
function save(push=false){
 const url=stateUrl(location.href,state);
 if(new URL(location.href).searchParams.get('card')===state.cardId)url.hash=location.hash;
 history[push?'pushState':'replaceState'](null,'',url);
}
const drawCatalogueNavigation=createCatalogueNavigation(cards,{onSelect:card=>{state={...state,cardId:card.id,unknown:false};save(true);render();}});
function drawNavigation(){drawCatalogueNavigation(state);}
function scopeFrame(record){
 const scope=state.compare?record.fixed:state.scope;
 for(const[name,value]of Object.entries(scope))record.element.contentDocument?.documentElement?.setAttribute('data-ds-'+name,value);
 record.element.contentDocument?.documentElement?.setAttribute('data-ds-example-card-url',stateUrl(location.href,{...state,scope,compare:false,query:''}));
 const caption=`${scope.theme} / ${scope.appearance} / ${scope.density}`;
 record.caption.textContent=caption;record.caption.hidden=!state.compare;record.element.title=record.card.title+' — '+caption;
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
 for(const ref of [...(card.apiHtml?[]:card.apiPaths??[]),...(card.documentationPath&&!card.documentationHtml?[{name:'Описание',path:card.documentationPath}]:[])]){
  const link=document.createElement('a'),url=new URL(ref.path,location.href);for(const[name,value]of Object.entries(state.scope))url.searchParams.set(name,value);
  link.href=url;link.textContent=ref.name==='Описание'?ref.name:'API '+ref.name;if(target.childNodes.length)target.append(document.createTextNode(' · '));target.append(link);
 }
 target.hidden=!target.childNodes.length;
}
function describeCard(card){
 const target=document.getElementById('card-description');
 target.hidden=!card?.documentationHtml&&!card?.apiHtml;
 // Locally generated Markdown and API markup; raw Markdown HTML is disabled and API text is escaped.
 target.innerHTML=(card?.documentationHtml??'')+(card?.apiHtml??'');
 enhanceCodeBlocks(target);
 for(const link of target.querySelectorAll('a[href]')){
  const url=new URL(link.getAttribute('href'),location.href);
  if(url.origin!==location.origin)continue;
  for(const[name,value]of Object.entries(state.scope))url.searchParams.set(name,value);
  link.href=url;
 }
}
function render({restoreSection=false}={}){
 disposeContents();
 // The catalogue keeps its light reading surface; scope settings belong to previews and links.
 renderControls();
 search.value=state.query;drawNavigation();
 const card=cards.find(card=>card.id===state.cardId),error=document.getElementById('card-error');error.hidden=!!card;
 document.querySelector('.catalog-content').classList.toggle('component-page',card?.layout==='component');
 document.querySelector('.catalog-content').classList.toggle('contents-page',card?.layout==='component'||foundationGuides.has(card?.id));
 examplesHeading.hidden=card?.layout!=='component';
 if(card?.layout==='component')viewports.setAttribute('aria-labelledby',examplesHeading.id);else viewports.removeAttribute('aria-labelledby');
 titleStatus.hidden=card?.status!=='deprecated';renderStatus(titleStatusRoot,card);
 describeCard(card);
 disposeContents=()=>{};
 if(!card){document.getElementById('title').textContent='Карточка не найдена';document.getElementById('subtitle').textContent='Выберите карточку в навигации или вернитесь к началу.';document.getElementById('missing-id').textContent=state.cardId;for(const record of frames)record.resizeObserver?.disconnect();viewports.replaceChildren();document.getElementById('reference-links').replaceChildren();frames=[];renderedKey=null;document.getElementById('local-note').hidden=true;return;}
 document.getElementById('title').textContent=card.title;document.getElementById('subtitle').textContent=card.subtitle;document.getElementById('local-note').hidden=card.scopeMode!=='local';referenceLinks(card);
 const key=card.id+'|'+state.compare;
 const documentPreview=['overview','DsBreakpointsDecisions'].includes(card.id)||foundationGuides.has(card.id);
 const responsivePreview=documentPreview||card.layout==='component';
 if(key!==renderedKey){
  for(const record of frames)record.resizeObserver?.disconnect();
  viewports.replaceChildren();frames=[];viewports.className=state.compare?'preview-matrix':'single-preview';
  for(const[index,fixed]of (state.compare?comparisonScopes:[state.scope]).entries()){
   const panel=document.createElement('figure'),caption=document.createElement('figcaption'),scroll=document.createElement('div'),frame=document.createElement('iframe');
   panel.className='preview-panel';scroll.className='preview-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');caption.id='preview-caption-'+index;scroll.setAttribute('aria-labelledby',caption.id);frame.id=state.compare?'preview-'+index:'preview';frame.style.width=card.viewport.width+'px';frame.style.height=card.viewport.height+'px';
   if(responsivePreview){
    panel.classList.add(documentPreview?'document-preview':'component-preview');frame.style.width='100%';
    scroll.removeAttribute('tabindex');scroll.removeAttribute('role');scroll.removeAttribute('aria-labelledby');
   }
   const record={element:frame,caption,fixed,card};frames.push(record);frame.addEventListener('load',()=>{
    panel.classList.toggle('sectioned-preview',card.layout==='component'&&frame.contentDocument.body.hasAttribute('data-ds-examples'));
    scopeFrame(record);
    if(responsivePreview){
     record.resizeObserver?.disconnect();
     const fit=()=>{
      const body=frame.contentDocument.body,css=getComputedStyle(body);
      const height=body.getBoundingClientRect().height+(parseFloat(css.marginTop)||0)+(parseFloat(css.marginBottom)||0);
      frame.style.height=Math.ceil(height+frame.offsetHeight-frame.clientHeight)+'px';
     };
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
 disposeContents=card.layout==='component'||foundationGuides.has(card.id)?createPageContents({
  container:document.querySelector('.catalog-content'),
  headings:[...(card.layout==='component'?[examplesHeading]:[]),...document.querySelectorAll('#card-description h2')],
  previewSectionsSelector:foundationGuides.has(card.id)?'main > section > h2[id]':null,
  scrollRoot:document.querySelector('main'),cardUrl:stateUrl(location.href,state),previewFrame:frames[0]?.element,restoreSection,
 }):()=>{};
}
search.addEventListener('input',()=>{state.query=search.value;save();drawNavigation();});
document.getElementById('return-catalogue').addEventListener('click',()=>{state={...state,cardId:cards[0].id,query:'',unknown:false};save(true);render();});
for(const event of ['popstate','hashchange'])window.addEventListener(event,()=>{state=parseState(new URL(location.href),cards);render({restoreSection:true});});
render({restoreSection:true});
