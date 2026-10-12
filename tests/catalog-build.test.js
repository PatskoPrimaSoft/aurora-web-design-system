import assert from'node:assert/strict';import{readFileSync,writeFileSync,rmSync,mkdirSync}from'node:fs';import{join}from'node:path';import{fileURLToPath}from'node:url';
import{buildCatalogue}from'../tools/catalog/build.mjs';import{readCards}from'../tools/catalog/index.mjs';import{renderPreview}from'../tools/catalog/preview.mjs';import{fixtureRoot}from'./helpers/build-root.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const discovered=readCards(root);
assert.equal(discovered.filter(card=>card.id==='overview').length,1);
assert.equal(new Set(discovered.map(card=>card.id)).size,discovered.length);
assert.deepEqual(JSON.parse(readFileSync(join(root,'site/cards.json'),'utf8')).map(card=>card.id),discovered.map(card=>card.id));
const fixture=fixtureRoot();try{
 const cards=await buildCatalogue({root:fixture,outDir:join(fixture,'site')});assert.equal(cards.length,2);
 assert.match(readFileSync(join(fixture,'site/components/Example/preview.html'),'utf8'),/<title>Example<\/title>/);
 assert.match(readFileSync(join(fixture,'site/overview.html'),'utf8'),/window\.__DS_CARD_COUNT__=2/);
 const examplePath=join(fixture,'components/Example/preview.html'),exampleOriginal=readFileSync(examplePath,'utf8');
 writeFileSync(examplePath,'<!-- @dsCard group="Example" --><html><head></head><body data-ds-examples><script type="application/json" id="example-code-sources" data-ds-example-sources="examples.json"></script></body></html>');
 writeFileSync(join(fixture,'components/Example/examples.json'),JSON.stringify({basic:'const label = "Example";'}));
 const exampleCards=await buildCatalogue({root:fixture,outDir:join(fixture,'site')});
 const compiled=readFileSync(join(fixture,'site/components/Example/preview.html'),'utf8');
 assert.doesNotMatch(compiled,/data-ds-example-sources=/);
 const repeated=await renderPreview({root:join(fixture,'site'),card:exampleCards.find(card=>card.id==='Example'),mode:'current'});
 assert.match(repeated,/const label/);
 writeFileSync(examplePath,exampleOriginal);
 mkdirSync(join(fixture,'components/DsAppHeader'),{recursive:true});
 writeFileSync(join(fixture,'components/DsAppHeader/preview.html'),'<!-- @dsCard group="Navigation" --><html><head></head><body>header</body></html>');
 writeFileSync(join(fixture,'components/DsAppHeader/README.md'),'# Header');
 await buildCatalogue({root:fixture,outDir:join(fixture,'site')});
 for(const path of ['components/DsHeader/preview.html','docs/cards/DsHeader.html','api/components/DsHeader.html']){
  const html=readFileSync(join(fixture,'site',path),'utf8');
  assert.match(html,/location\.replace\(target.href\)/);assert.match(html,/target.search=location.search/);assert.match(html,/DsAppHeader/);
 }
 rmSync(join(fixture,'components/DsAppHeader/preview.html'));rmSync(join(fixture,'components/DsAppHeader/README.md'));
 // Убираем созданные страницы редиректов перед последующими сборками без целевой карточки.
 for(const path of ['components/DsHeader/preview.html','docs/cards/DsHeader.html','api/components/DsHeader.html'])rmSync(join(fixture,'site',path));
 writeFileSync(join(fixture,'guide name.md'),'# Linked guide');writeFileSync(join(fixture,'components/Example/doc-icon.svg'),'<svg xmlns="http://www.w3.org/2000/svg"></svg>');
 writeFileSync(join(fixture,'components/Example/README.md'),'[Guide](../../guide%20name.md#linked-guide)\n![Icon](doc-icon.svg)');
 await buildCatalogue({root:fixture,outDir:join(fixture,'site')});
 assert.match(readFileSync(join(fixture,'site/docs/cards/Example.html'),'utf8'),/\/docs\/guide name.html#linked-guide/);
 assert.ok(readFileSync(join(fixture,'site/source/components/Example/doc-icon.svg')).length);
 const path=join(fixture,'components/Example/preview.html');const original=readFileSync(path,'utf8');
 writeFileSync(path,original.replace('</body>','<script>const label="filename.svg";</script></body>'));
 await buildCatalogue({root:fixture,outDir:join(fixture,'site')});
 writeFileSync(join(fixture,'components/Example/icon.svg'),'<svg xmlns="http://www.w3.org/2000/svg"></svg>');
 writeFileSync(path,original.replace('</body>','<img src="icon.svg?v=1#part"></body>'));
 await buildCatalogue({root:fixture,outDir:join(fixture,'site')});assert.ok(readFileSync(join(fixture,'site/components/Example/icon.svg')).length);
 const rendered=readFileSync(join(fixture,'site/components/Example/preview.html'),'utf8');assert.ok(rendered.includes('icon.svg?v=1#part'));assert.ok(!rendered.includes('unpkg.com'));
 writeFileSync(join(fixture,'components/Example/nested.css'),'@import "example.css"; .icon {background:url(icon.svg?v=2#part)}');
 writeFileSync(join(fixture,'components/Example/example.css'),'@import "nested.css";');
 writeFileSync(path,original.replace('</head>','<link rel="stylesheet" href="example.css"></head>'));
 rmSync(join(fixture,'site/components/Example/icon.svg'));
 await buildCatalogue({root:fixture,outDir:join(fixture,'site')});assert.ok(readFileSync(join(fixture,'site/components/Example/icon.svg')).length);
 rmSync(join(fixture,'components/Example/icon.svg'));
 await assert.rejects(buildCatalogue({root:fixture,outDir:join(fixture,'site')}),/missing.*icon.svg/);
 writeFileSync(join(fixture,'components/Example/nested.css'),'@import "https://example.com/external.css";');
 await assert.rejects(buildCatalogue({root:fixture,outDir:join(fixture,'site')}),/external asset/);
 writeFileSync(path,original);
 writeFileSync(join(fixture,'components/Example/README.md'),'');await buildCatalogue({root:fixture,outDir:join(fixture,'site')});
 writeFileSync(path,original.replace('</body>','<img src="missing.svg"></body>'));await assert.rejects(buildCatalogue({root:fixture,outDir:join(fixture,'site')}),/missing.*missing.svg/);
 writeFileSync(path,original.replace('height=180','viewport="bad"'));assert.throws(()=>readCards(fixture),/invalid viewport/);
 writeFileSync(path,original.replace('height=180','id="overview"'));assert.throws(()=>readCards(fixture),/duplicate/i);
}finally{rmSync(fixture,{recursive:true,force:true});}
console.log('catalog-build: discovery, metadata, assets with query/hash, empty docs and errors passed');
