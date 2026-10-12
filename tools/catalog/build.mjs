import { readFileSync, writeFileSync, mkdirSync, readdirSync,existsSync } from 'node:fs';
import { join, dirname, resolve, relative, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCards } from './index.mjs';
import { renderPreview } from './preview.mjs';
import { previewAssets, assetPath, copyAsset } from './assets.mjs';
import { buildComponents } from '../build-components.mjs';
import { writeTokenOutputs } from '../tokens/build.mjs';
import {readTokenModel} from '../tokens/model.mjs';
import {extractApi} from '../docs/api.mjs';
import {renderMarkdown,renderProps,renderComponentProps,documentPage} from '../docs/markdown.mjs';
import {renderTokenReference} from '../docs/tokens.mjs';
import {validateLinks} from '../docs/links.mjs';
import {cardRedirects} from '../../catalog/state.js';
const hasInlineDescription = card => card.layout === 'component' || ['2 · Основы','3 · Миграция','4 · Бренд (общее)','6 · Карта'].includes(card.group);
export async function buildCatalogue({ root, outDir }) {
  if (resolve(root) === resolve(outDir)) throw new Error('Catalogue output must not replace source root');
  const cards = readCards(root);
  const css = writeTokenOutputs({ root });
  const api=extractApi({root}),knownRoutes=new Map();
  const guides=readdirSync(root).filter(name=>name.endsWith('.md'));
  for(const guide of guides)knownRoutes.set(guide,`/docs/${guide.slice(0,-3)}.html`);
  for(const card of cards){knownRoutes.set(card.previewPath,'/'+card.previewPath);if(card.readmePath)knownRoutes.set(card.readmePath,hasInlineDescription(card)?`/index.html?card=${card.id}`:`/docs/cards/${card.id}.html`);}
  const redirects=Object.entries(cardRedirects).filter(([,target])=>cards.some(card=>card.id===target));
  for(const[old,target]of redirects){
    knownRoutes.set(`components/${old}/README.md`,knownRoutes.get(`components/${target}/README.md`)??`/index.html?card=${target}`);
    knownRoutes.set(`components/${old}/preview.html`,`/index.html?card=${target}`);
  }
  const apiDescriptions=cards.map(card=>join(dirname(card.previewPath),'API.md')).filter(path=>existsSync(join(root,path)));
  const documents=[...guides,...cards.map(card=>card.readmePath).filter(Boolean),...apiDescriptions],documentAssets=new Set();
  for(let index=0;index<documents.length;index++)for(const link of renderMarkdown({root,path:documents[index]}).links){
    if(/^(?:[a-z]+:|\/\/|#)/i.test(link))continue;
    const url=new URL(link,'http://aurora.local/'+documents[index]),target=decodeURIComponent(url.pathname).slice(1);
    if(target.endsWith('.md')&&existsSync(join(root,target))&&!knownRoutes.has(target)){
      knownRoutes.set(target,'/docs/source/'+target.slice(0,-3)+'.html');documents.push(target);
    }else if(!knownRoutes.has(target))documentAssets.add(assetPath(root,documents[index],link));
  }
  const writePage=(path,html)=>{mkdirSync(dirname(join(outDir,path)),{recursive:true});writeFileSync(join(outDir,path),html);};
  for(const guide of guides){const document=renderMarkdown({root,path:guide,knownRoutes});writePage(`docs/${guide.slice(0,-3)}.html`,documentPage({title:guide,html:document.html}));}
  for(const path of documents.filter(path=>!guides.includes(path)&&knownRoutes.get(path)?.startsWith('/docs/source/'))){const document=renderMarkdown({root,path,knownRoutes});writePage(knownRoutes.get(path).slice(1),documentPage({title:path,html:document.html}));}
  for(const path of documentAssets)if(path){const target=join(outDir,'source',path);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,readFileSync(join(root,path)));}
  for(const doc of api){
    const card=cards.find(card=>card.id===doc.name)??cards.find(card=>card.id===doc.declarationPath.split('/')[1]);
    const readme=card?.readmePath;
    const markdown=readme?renderMarkdown({root,path:readme,knownRoutes}):null;
    const apiDescription=card?join(dirname(card.previewPath),'API.md'):null;
    const apiMarkdown=apiDescription&&existsSync(join(root,apiDescription))?renderMarkdown({root,path:apiDescription,knownRoutes}):null;
    const props=card?.layout==='component'?renderComponentProps(doc):renderProps(doc);
    const content=card?.layout==='component'?(markdown?.html??'')+props+(apiMarkdown?.html??''):props+(markdown?.html??'')+(apiMarkdown?.html??'');
    writePage(`api/components/${doc.name}.html`,documentPage({title:doc.name,html:content,back:card?`/index.html?card=${card.id}`:'/index.html'}));
  }
  const reference=renderTokenReference(readTokenModel(css.source));
  const tokenPage=readFileSync(new URL('../../catalog/index.html',import.meta.url),'utf8')
    .replace('<title>Aurora Design</title>','<title>Дизайн-токены · Aurora</title>')
    .replace('src="app.js"','src="token-page.js"')
    .replace(/(href|src)="(?![a-z]+:|\/|#)([^"]+)"/g,'$1="/$2"')
    .replace(/<main>[\s\S]*?<\/main>/,'<main><h1>Дизайн-токены</h1>'+reference.html.replace('<script type="module" src="/token-reference.js"></script>','')+'</main>');
  writePage('api/tokens.html',tokenPage);
  for(const card of cards){
    const contracts=api.filter(doc=>doc.name===card.id||(doc.declarationPath.split('/')[1]===card.id&&!cards.some(own=>own.id===doc.name))).sort((a,b)=>Number(b.name===card.id)-Number(a.name===card.id));
    card.apiPaths=contracts.map(doc=>({name:doc.name,path:`api/components/${doc.name}.html`}));
    if(card.layout==='component'){
      const descriptionPath=join(dirname(card.previewPath),'API.md');
      const description=existsSync(join(root,descriptionPath))?renderMarkdown({root,path:descriptionPath,knownRoutes}).html:'';
      card.apiHtml=contracts.map((doc,index)=>{
        const props=renderComponentProps(doc);
        return index===0?props:props.replace(/<h2([^>]*)>Параметры<\/h2>/,`<h3$1>${doc.name}</h3>`);
      }).join('')+description;
    }
    card.declarationPaths=[...new Set(contracts.map(doc=>doc.declarationPath))];
    const document=card.readmePath?renderMarkdown({root,path:card.readmePath,knownRoutes}):null;
    card.documentationPath=document?`docs/cards/${card.id}.html`:null;
    // Render from the same Markdown source as the standalone documentation.
    if(document&&hasInlineDescription(card))card.documentationHtml=document.html.replace(/^<h1\b[^>]*>[\s\S]*?<\/h1>\s*/,'');
    card.searchText=[card.id,card.title,card.subtitle,document?.text??'',...contracts.flatMap(doc=>doc.props.map(prop=>prop.name))].join(' ');
    if(document)writePage(card.documentationPath,documentPage({title:card.title,html:document.html,back:`/index.html?card=${card.id}`}));
  }
  await buildComponents({ root, outDir });
  mkdirSync(join(outDir, 'dist'), { recursive: true });
  writeFileSync(join(outDir, 'dist/styles.css'), css.styles);
  const assets = new Set();
  for (const m of css.styles.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) assets.add(assetPath(root, 'dist/styles.css', m[1]));
  for (const card of cards) {
    const html = await renderPreview({ root, card, mode: 'current', standalone: true,
      scope: { theme: 'DEFAULT', appearance: 'light', density: 'cozy' } });
    for (const path of previewAssets(root, card.previewPath, html, ['dist/styles.css','runtime.js','components.js'])) assets.add(path);
    mkdirSync(dirname(join(outDir, card.previewPath)), { recursive: true });
    writeFileSync(join(outDir, card.previewPath), html);
  }
  for(const[old,target]of redirects)for(const[path,destination]of [
    [`components/${old}/preview.html`,'index.html'],
    [`docs/cards/${old}.html`,`docs/cards/${target}.html`],
    [`api/components/${old}.html`,api.some(doc=>doc.name===target)?`api/components/${target}.html`:'index.html'],
  ]){
    const href=posix.relative(posix.dirname(path),destination);
    writePage(path,`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Открыть ${target}</title></head><body><a href="${href}?card=${target}">Открыть ${target}</a><script>const target=new URL(${JSON.stringify(href)},location.href);target.search=location.search;target.searchParams.set('card',${JSON.stringify(target)});location.replace(target.href);</script></body></html>`);
  }
  for (const path of assets) if (path && !['dist/styles.css', 'components/bundle.js', 'components/lib/react.production.min.js', 'components/lib/react-dom.production.min.js'].includes(path.replaceAll('\\','/'))) copyAsset({ root, outDir, path });
  writeFileSync(join(outDir, 'cards.json'), JSON.stringify(cards, null, 2) + '\n');
  for (const file of ['index.html', 'app.js', 'styles.css','code-blocks.css','search.js','families.js','state.js','documentation.js','token-reference.css','token-reference.js','token-page.js','shell.js','navigation.js']) writeFileSync(join(outDir, file), readFileSync(new URL(`../../catalog/${file}`, import.meta.url)));
  const problems=validateLinks({root,siteRoot:outDir});
  if(problems.length)throw Error(problems.map(p=>`${p.source}: ${p.target}: ${p.reason}`).join('\n'));
  return cards;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  console.log(`Catalogue: ${(await buildCatalogue({ root, outDir: join(root, 'site') })).length} cards`);
}
