import {searchCards} from './search.js';
import {familyFor} from './families.js';
import {stateUrl} from './state.js';
export function createCatalogueNavigation(cards,{base=location.href,tokensActive=false,onSelect}={}){
const nav=document.getElementById('cards');
let navigationStatusRoots=[];
function renderStatus(root,card){window.ReactDOM.flushSync(()=>root.render(card?.status==='deprecated'?window.React.createElement(window.AuroraWebDesignSystem_96e210.DsLozenge,{tone:'warning',size:'sm'},'Устарело'):null));}
return function drawNavigation(state){
 const found=searchCards(cards,state.query),groups=new Map();
 for(const root of navigationStatusRoots)root.unmount();navigationStatusRoots=[];nav.replaceChildren();
 const tokens=document.createElement('a'),tokensUrl=new URL('api/tokens.html',base);
 for(const[name,value]of Object.entries(state.scope))tokensUrl.searchParams.set(name,value);
 tokens.href=tokensUrl;tokens.textContent='Токены';tokens.className='catalog-tokens-link';if(tokensActive)tokens.setAttribute('aria-current','page');nav.append(tokens);
 document.getElementById('search-empty').hidden=found.length>0;
 for(const card of found){
  const family=card.group==='2 · Основы'?null:familyFor(card.id);
  const name=family?card.group.split(' · ').slice(0,2).join(' · ')+' · '+family.title.toLocaleLowerCase('ru'):card.group;
  if(!groups.has(name))groups.set(name,[]);groups.get(name).push(card);
 }
 const orderedGroups=[...groups].sort(([nameA],[nameB])=>nameA.localeCompare(nameB,'ru',{numeric:true}));
 for(const[name,items]of orderedGroups){const h=document.createElement('h2');h.textContent=name;nav.append(h);
  for(const card of items){const link=document.createElement('a');link.href=stateUrl(base,{...state,cardId:card.id});link.dataset.id=card.id;link.textContent=card.title;
   if(card.status==='deprecated'){const status=document.createElement('span');status.className='nav-card-status';link.append(status);const root=window.ReactDOM.createRoot(status);navigationStatusRoots.push(root);renderStatus(root,card);}
   if(!tokensActive&&card.id===state.cardId)link.setAttribute('aria-current','page');
   link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;if(onSelect){event.preventDefault();onSelect(card);}});nav.append(link);}
 }
}

}
