import MarkdownIt from 'markdown-it';
import {readFileSync} from 'node:fs';
import {join,posix} from 'node:path';
import {scopeOptions,applyQueryScope} from '../../catalog/state.js';
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderMarkdown({root,path,knownRoutes=new Map()}){
 const md=new MarkdownIt({html:false,linkify:false,typographer:false}),links=[];
 const headings=new Map();
 md.renderer.rules.heading_open=(tokens,idx,options,env,self)=>{
  const text=(tokens[idx+1]?.children??[]).map(token=>token.content).join('');
  const slug=text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu,'').trim().replace(/\s/g,'-');
  const count=headings.get(slug)??0;headings.set(slug,count+1);
  tokens[idx].attrSet('id',slug+(count?'-'+count:''));return self.renderToken(tokens,idx,options);
 };
 const route=url=>{
  links.push(url);
  if(/^(?:[a-z]+:|\/\/|#)/i.test(url))return url;
  const parsed=new URL(url,'http://aurora.local/'+path),target=decodeURIComponent(parsed.pathname).slice(1);
  const known=knownRoutes instanceof Map?knownRoutes.get(target):knownRoutes[target];
  return (known??'/source/'+target)+parsed.search+parsed.hash;
 };
 const link=md.renderer.rules.link_open??((tokens,idx,options,env,self)=>self.renderToken(tokens,idx,options));
 md.renderer.rules.link_open=(tokens,idx,options,env,self)=>{const token=tokens[idx],href=token.attrGet('href');token.attrSet('href',route(href));return link(tokens,idx,options,env,self);};
 const image=md.renderer.rules.image;
 md.renderer.rules.image=(tokens,idx,options,env,self)=>{
  const token=tokens[idx],url=token.attrGet('src');
  if(/^(?:https?:|\/\/)/i.test(url)){links.push(url);return `<a href="${escapeHtml(url)}">${escapeHtml(token.content)}</a>`;}
  token.attrSet('src',route(url));return image(tokens,idx,options,env,self);
 };
 const source=readFileSync(join(root,path),'utf8'),tokens=md.parse(source,{});
 const text=[];const collect=items=>{for(const token of items){if(['text','code_inline','fence','code_block'].includes(token.type))text.push(token.content);if(token.children)collect(token.children);}};collect(tokens);
 return{html:md.renderer.render(tokens,md.options,{}),text:text.join(' '),links};
}
export function renderProps(component){
 const rows=component.props.filter(prop=>!prop.forwarded).map(prop=>`<tr><th scope="row"><code>${escapeHtml(prop.name)}</code></th><td><code>${escapeHtml(prop.type)}</code></td><td>${prop.required?'Да':'Нет'}</td><td>${prop.defaultValue===null?'—':`<code>${escapeHtml(prop.defaultValue)}</code>`}${prop.defaultDescription?`<p>${escapeHtml(prop.defaultDescription)}</p>`:''}</td><td>${escapeHtml(prop.description)}</td></tr>`).join('');
 return `<p>${escapeHtml(component.description)}</p><p>Исходник: <code>${escapeHtml(component.sourcePath)}</code> · декларация: <code>${escapeHtml(component.declarationPath)}</code></p><div class="table-scroll"><table><caption>Props ${escapeHtml(component.name)}</caption><thead><tr><th scope="col">Имя</th><th scope="col">Тип</th><th scope="col">Обязателен</th><th scope="col">Default</th><th scope="col">Описание</th></tr></thead><tbody>${rows}</tbody></table></div>${component.forwardsNativeAttributes?'<p>Остальные native attributes передаются DOM-элементу через rest.</p>':''}`;
}
export function documentPage({title,html,back='/index.html'}){
 return `<!doctype html><html lang="ru" data-ds-theme="DEFAULT" data-ds-appearance="light" data-ds-density="cozy"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} · Aurora</title><script>(${applyQueryScope.toString()})(${JSON.stringify(scopeOptions)})</script><link rel="stylesheet" href="/dist/styles.css"><link rel="stylesheet" href="/styles.css"></head><body><main class="reference"><a href="${escapeHtml(back)}">← Каталог</a><h1>${escapeHtml(title)}</h1>${html}</main></body></html>`;
}
export function renderComponentProps(component){
 if(!component.props.length)return '';
 const name=escapeHtml(component.name),heading='parameters-'+name;
 const rows=component.props.filter(prop=>!prop.forwarded).map(prop=>{
  const defaultNote=prop.defaultDescription&&prop.defaultDescription!==prop.defaultValue?.replace(/^(['"])(.*)\1$/s,'$2')?`<p>${escapeHtml(prop.defaultDescription)}</p>`:'';
  return `<tr><th scope="row"><code>${escapeHtml(prop.name)}</code>${prop.required?'<span class="prop-required">Обязательный</span>':''}</th><td><code>${escapeHtml(prop.type)}</code></td><td>${prop.defaultValue===null?'—':`<code>${escapeHtml(prop.defaultValue)}</code>`}${defaultNote}</td><td>${escapeHtml(prop.description)}</td></tr>`;
 }).join('');
 return `<h2 id="${heading}">Параметры</h2><div class="table-scroll" tabindex="0" role="region" aria-labelledby="${heading}"><table class="component-props" aria-label="Параметры ${name}"><thead><tr><th scope="col">Имя</th><th scope="col">Тип</th><th scope="col">По умолчанию</th><th scope="col">Описание</th></tr></thead><tbody>${rows}</tbody></table></div>${component.forwardsNativeAttributes?'<p>Остальные native attributes передаются DOM-элементу через rest.</p>':''}`;
}
