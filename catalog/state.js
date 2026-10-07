export const scopeOptions={theme:['DEFAULT','RED2'],appearance:['light','dark'],density:['cozy','compact']};
export const cardRedirects={DsHeader:'DsAppHeader',BrandLogoMark:'BrandLogoLockup'};
export const comparisonScopes=[
 {theme:'DEFAULT',appearance:'light',density:'cozy'},
 {theme:'DEFAULT',appearance:'dark',density:'compact'},
 {theme:'RED2',appearance:'light',density:'cozy'},
 {theme:'RED2',appearance:'dark',density:'compact'},
];
export function parseState(url,cards){
 let hash='';try{hash=decodeURIComponent(url.hash.slice(1));}catch{}
 const requested=url.searchParams.get('card')||hash||cards[0]?.id;
 const cardId=Object.hasOwn(cardRedirects,requested)?cardRedirects[requested]:requested;
 const scope=Object.fromEntries(Object.entries(scopeOptions).map(([name,options])=>[name,options.includes(url.searchParams.get(name))?url.searchParams.get(name):options[0]]));
 return{cardId,scope,compare:url.searchParams.get('compare')==='1',query:url.searchParams.get('q')??'',unknown:!cards.some(card=>card.id===cardId)};
}
export function stateUrl(current,state){
 const url=new URL(current);url.hash='';
 url.searchParams.set('card',state.cardId);
 for(const[name,value]of Object.entries(state.scope))url.searchParams.set(name,value);
 if(state.compare)url.searchParams.set('compare','1');else url.searchParams.delete('compare');
 if(state.query.trim())url.searchParams.set('q',state.query);else url.searchParams.delete('q');
 return url;
}
export function applyQueryScope(options){
 const params=new URLSearchParams(location.search);
 for(const[name,values]of Object.entries(options))if(params.has(name)){
  const value=params.get(name);document.documentElement.setAttribute('data-ds-'+name,values.includes(value)?value:values[0]);
 }
}
