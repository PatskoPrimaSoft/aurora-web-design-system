import assert from 'node:assert/strict';
import {readCards} from '../tools/catalog/index.mjs';
import {searchCards} from '../design-system/catalog/search.js';
import {families,familyFor,navigationGroups} from '../design-system/catalog/families.js';
import {parseState,stateUrl} from '../design-system/catalog/state.js';
import {fileURLToPath} from 'node:url';
import {fixtureRoot} from './helpers/build-root.js';
import {mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),cards=readCards(root);
assert.equal(cards.find(card=>card.id==='DsScoreBar').title,'ScoreBar');
assert.equal(searchCards(cards,'DsScoreBar')[0]?.id,'DsScoreBar');
assert.equal(searchCards(cards,'ScoreBar')[0]?.id,'DsScoreBar');
assert.equal(cards.find(card=>card.id==='DsChart').title,'Интеграция ECharts');
assert.ok(!cards.some(c=>['DsCheck','DsCheckButton','DsSelectBox'].includes(c.id)));
assert.ok(searchCards(cards,'радио').some(c=>c.id==='DsCheckbox'));
assert.ok(searchCards(cards,'ВЫБОР').some(c=>c.id==='DsCheckbox'));
assert.ok(searchCards(cards,'CHECKBOX').some(c=>c.id==='DsCheckbox'));
assert.deepEqual(searchCards(cards,'неизвестно-12345'),[]);
assert.equal(searchCards([{id:'New',title:'Новая карточка',searchText:'loading onClick'}],' ＬＯＡＤＩＮＧ onclick ')[0].id,'New');
assert.equal(searchCards([{id:'New',title:'Новая карточка'}],'новая отсутствует').length,0);
assert.equal(familyFor('DsBulkActionsBar').id,'data');
assert.equal(new Set(families.flatMap(f=>f.cards)).size,families.flatMap(f=>f.cards).length);
const fixture=fixtureRoot();
try{
 mkdirSync(join(fixture,'design-system/components/NewCard'));
 writeFileSync(join(fixture,'design-system/components/NewCard/preview.html'),'<!-- @dsCard layout="component" group="New" name="New discovery" aliases="fresh|новая" --><html><head></head><body>new</body></html>');
 const discovered=readCards(fixture);assert.equal(discovered.length,3);assert.equal(searchCards(discovered,'новая')[0].id,'NewCard');assert.equal(familyFor('NewCard'),null);
 assert.equal(discovered.find(card=>card.id==='NewCard').layout,'component');
}finally{rmSync(fixture,{recursive:true,force:true});}
assert.equal(Object.hasOwn(parseState(new URL('http://local/?card=DsButton&compare=1'),cards),'compare'),false);
const state=parseState(new URL('http://local/index.html?card=DsButton&theme=bad&appearance=bad&density=bad&compare=evil'),cards);
assert.deepEqual(state.scope,{theme:'DEFAULT',appearance:'light',density:'cozy'});assert.equal(Object.hasOwn(state,'compare'),false);
assert.equal(parseState(new URL('http://local/index.html#DsCheckbox'),cards).cardId,'DsCheckbox');
for(const suffix of ['?card=DsHeader&theme=RED2&appearance=dark&density=compact&compare=1','#DsHeader']){
 const redirected=parseState(new URL('http://local/index.html'+suffix),cards);
 assert.equal(redirected.cardId,'DsAppHeader');assert.equal(redirected.unknown,false);
 if(suffix.startsWith('?')){assert.deepEqual(redirected.scope,{theme:'RED2',appearance:'dark',density:'compact'});assert.equal(Object.hasOwn(redirected,'compare'),false);}
}
assert.ok(!cards.some(card=>card.id==='DsHeader'));
assert.equal(searchCards(cards,'DsHeader')[0]?.id,'DsAppHeader');
assert.ok(!cards.some(card=>card.id==='DsHeaderChip'));
assert.equal(parseState(new URL('http://local/index.html?card=DsHeaderChip'),cards).unknown,true);
assert.equal(familyFor('DsHeaderChip'),null);
assert.equal(parseState(new URL('http://local/index.html?card=../../secrets'),cards).unknown,true);
for(const theme of ['DEFAULT','RED2'])for(const appearance of ['light','dark'])for(const density of ['cozy','compact']){
 const scope={theme,appearance,density},url=stateUrl(new URL('http://local/index.html'),{...state,scope,query:'выбор',compare:true});
 assert.deepEqual(parseState(url,cards).scope,scope);assert.equal(url.searchParams.has('compare'),false);assert.equal(parseState(url,cards).query,'выбор');
}
console.log('catalog-search: aliases, AND/NFKC search, discovery, all eight URL scopes and invalid inputs passed');

const groups=navigationGroups(cards);
assert.deepEqual(groups.map(group=>group.title),['Начало','Основы','Компоненты','Карта','Примеры экранов','Миграция']);
const links=groups.flatMap(group=>group.sections.flatMap(section=>section.items.map(card=>card.id)));
assert.equal(links.length,cards.length);assert.equal(new Set(links).size,cards.length);
assert.deepEqual(groups.find(group=>group.id==='components').sections.map(section=>section.title),families.map(family=>family.title));
assert.deepEqual(groups.find(group=>group.id==='foundations').sections.at(-1).items.map(card=>card.id),['DsBrandThemes','DsBrandPick','BrandLogoLockup']);
assert.ok(searchCards(cards,'бренд и темы').some(card=>card.id==='BrandLogoLockup'));
assert.equal(navigationGroups([{id:'New',group:'5 · Компоненты · новые'}])[0].sections[0].title,'Другие компоненты');
assert.equal(navigationGroups([{id:'New',group:'New group'}])[0].sections[0].items[0].id,'New');
