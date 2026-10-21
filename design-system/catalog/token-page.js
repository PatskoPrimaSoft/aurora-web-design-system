import {mountCatalogueShell} from './shell.js';
import {createCatalogueNavigation} from './navigation.js';
import {parseState} from './state.js';

mountCatalogueShell('catalog-content reference token-page-content');
const cards=await(await fetch(new URL('./cards.json',import.meta.url))).json();
const state=parseState(new URL(location.href),cards);
state.query='';
const drawNavigation=createCatalogueNavigation(cards,{
 base:new URL('./index.html',import.meta.url),tokensActive:true,
});
drawNavigation(state);
document.getElementById('search').addEventListener('input',event=>{
 state.query=event.target.value;drawNavigation(state);
});
await import('./token-reference.js');
document.querySelector('select[aria-label="Бренд"]').addEventListener('change',event=>{
 state.scope.theme=event.target.value;drawNavigation(state);
});
