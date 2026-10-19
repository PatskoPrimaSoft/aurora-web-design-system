import {searchCards} from './search.js';
import {navigationGroups} from './families.js';
import {stateUrl} from './state.js';
export function createCatalogueNavigation(cards,{base=location.href,tokensActive=false,onSelect}={}){
const nav=document.getElementById('cards');
let navigationStatusRoots=[];
function renderStatus(root,card){window.ReactDOM.flushSync(()=>root.render(card?.status==='deprecated'?window.React.createElement(window.AuroraWebDesignSystem_96e210.DsLozenge,{tone:'warning',size:'sm'},'Устарело'):null));}
return function drawNavigation(state){
 const found=searchCards(cards,state.query);
 for(const root of navigationStatusRoots)root.unmount();navigationStatusRoots=[];nav.replaceChildren();
 const tokens=document.createElement('a'),tokensUrl=new URL('api/tokens.html',base);
 for(const[name,value]of Object.entries(state.scope))tokensUrl.searchParams.set(name,value);
 tokens.href=tokensUrl;tokens.textContent='Токены';tokens.className='catalog-tokens-link';if(tokensActive)tokens.setAttribute('aria-current','page');
 document.getElementById('search-empty').hidden=found.length>0;
 for(const group of navigationGroups(found)){
  const groupElement=document.createElement('section');groupElement.dataset.navigationGroup=group.id;nav.append(groupElement);
  const h=document.createElement('h2');h.textContent=group.title;groupElement.append(h);
  for(const section of group.sections){
   if(!section.items.length)continue;
   if(section.title){const heading=document.createElement('h3');heading.textContent=section.title;groupElement.append(heading);}
   for(const card of section.items){const link=document.createElement('a');link.href=stateUrl(base,{...state,cardId:card.id});link.dataset.id=card.id;link.dataset.navigationDepth=section.title?'2':'1';link.textContent=card.title;
   if(card.status==='deprecated'){const status=document.createElement('span');status.className='nav-card-status';link.append(status);const root=window.ReactDOM.createRoot(status);navigationStatusRoots.push(root);renderStatus(root,card);}
   if(!tokensActive&&card.id===state.cardId)link.setAttribute('aria-current','page');
   link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;if(onSelect){event.preventDefault();onSelect(card);}});groupElement.append(link);}
  }
 }
 const start=nav.querySelector('[data-navigation-group="start"]');
 if(start)start.after(tokens);else nav.prepend(tokens);
}

}
