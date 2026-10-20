import {familyFor,foundationSectionFor} from './families.js';
const normalize=value=>String(value??'').normalize('NFKC').trim().toLowerCase();
export function searchCards(cards,query){
 const terms=normalize(query).split(/\s+/).filter(Boolean);
 return cards.filter(card=>{
  const family=familyFor(card.id);
  const text=normalize([card.id,card.title,card.subtitle,card.searchText,...(card.aliases??[]),family?.title,...(family?.aliases??[]),foundationSectionFor(card)?.title].join(' '));
  return terms.every(term=>text.includes(term));
 });
}
