import assert from 'node:assert/strict';
import {readCards} from '../tools/catalog/index.mjs';
import {searchCards} from '../catalog/search.js';
import {families,familyFor} from '../catalog/families.js';
import {parseState,stateUrl} from '../catalog/state.js';
import {fileURLToPath} from 'node:url';
import {fixtureRoot} from './helpers/build-root.js';
import {mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),cards=readCards(root);
assert.ok(!cards.some(c=>['DsCheck','DsCheckButton','DsSelectBox'].includes(c.id)));
assert.ok(searchCards(cards,'радио').some(c=>c.id==='DsCheckbox'));
assert.ok(searchCards(cards,'ВЫБОР').some(c=>c.id==='DsCheckbox'));
assert.ok(searchCards(cards,'CHECKBOX').some(c=>c.id==='DsCheckbox'));
assert.deepEqual(searchCards(cards,'неизвестно-12345'),[]);
assert.equal(searchCards([{id:'New',title:'Новая карточка',searchText:'loading onClick'}],' ＬＯＡＤＩＮＧ onclick ')[0].id,'New');
assert.equal(searchCards([{id:'New',title:'Новая карточка'}],'новая отсутствует').length,0);
assert.equal(familyFor('DsBulkActionsBar'),null);assert.equal(familyFor('DsSelectionBar'),null);
assert.equal(new Set(families.flatMap(f=>f.cards)).size,families.flatMap(f=>f.cards).length);
const fixture=fixtureRoot();
try{
 mkdirSync(join(fixture,'components/NewCard'));
 writeFileSync(join(fixture,'components/NewCard/preview.html'),'<!-- @dsCard layout="component" group="New" name="New discovery" aliases="fresh|новая" --><html><head></head><body>new</body></html>');
 const discovered=readCards(fixture);assert.equal(discovered.length,3);assert.equal(searchCards(discovered,'новая')[0].id,'NewCard');assert.equal(familyFor('NewCard'),null);
 assert.equal(discovered.find(card=>card.id==='NewCard').layout,'component');
}finally{rmSync(fixture,{recursive:true,force:true});}
const state=parseState(new URL('http://local/index.html?card=DsButton&theme=bad&appearance=bad&density=bad&compare=evil'),cards);
assert.deepEqual(state.scope,{theme:'DEFAULT',appearance:'light',density:'cozy'});assert.equal(state.compare,false);
assert.equal(parseState(new URL('http://local/index.html#DsCheckbox'),cards).cardId,'DsCheckbox');
for(const suffix of ['?card=DsHeader&theme=RED2&appearance=dark&density=compact&compare=1','#DsHeader']){
 const redirected=parseState(new URL('http://local/index.html'+suffix),cards);
 assert.equal(redirected.cardId,'DsAppHeader');assert.equal(redirected.unknown,false);
 if(suffix.startsWith('?')){assert.deepEqual(redirected.scope,{theme:'RED2',appearance:'dark',density:'compact'});assert.equal(redirected.compare,true);}
}
assert.ok(!cards.some(card=>card.id==='DsHeader'));
assert.equal(searchCards(cards,'DsHeader')[0]?.id,'DsAppHeader');
assert.ok(!cards.some(card=>card.id==='DsHeaderChip'));
assert.equal(parseState(new URL('http://local/index.html?card=DsHeaderChip'),cards).unknown,true);
assert.equal(familyFor('DsHeaderChip'),null);
assert.equal(parseState(new URL('http://local/index.html?card=../../secrets'),cards).unknown,true);
for(const theme of ['DEFAULT','RED2'])for(const appearance of ['light','dark'])for(const density of ['cozy','compact']){
 const scope={theme,appearance,density},url=stateUrl(new URL('http://local/index.html'),{...state,scope,query:'выбор',compare:true});
 assert.deepEqual(parseState(url,cards).scope,scope);assert.equal(parseState(url,cards).compare,true);assert.equal(parseState(url,cards).query,'выбор');
}
console.log('catalog-search: aliases, AND/NFKC search, discovery, all eight URL scopes and invalid inputs passed');
