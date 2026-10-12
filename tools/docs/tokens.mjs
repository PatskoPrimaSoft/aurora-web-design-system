import {escapeHtml} from './markdown.mjs';

const categories = [
 ['text','Текст'],['surface','Поверхности'],['action','Действия'],['border','Границы'],
 ['status','Статусы'],['palette','Базовая палитра'],['spacing','Отступы'],
 ['density','Размеры и плотность'],['radius','Скругления'],['shadow','Тени'],
 ['type','Типографические роли'],['fontSize','Размер шрифта'],['fontWeight','Начертание'],
 ['tracking','Межбуквенный интервал'],['lineHeight','Межстрочный интервал'],
 ['motion','Движение'],['layout','Брейкпоинты'],['content','Ширина контента']
];
const densityCategories = new Set(['spacing','density']);
const singleCategories = new Set(['radius','type','fontSize','fontWeight','tracking','lineHeight','motion','layout','content']);

function category(name, section) {
 if(section==='type')return 'type';
 if(section==='fontSize')return 'fontSize';
 if(section==='fontWeight')return 'fontWeight';
 if(section==='letterSpacing')return 'tracking';
 if(section==='radius')return 'radius';
 if(section==='shadow')return 'shadow';
 if(section==='spacing') {
  if(/(?:gap|pad)/.test(name))return 'spacing';
  if(/(?:border-width|focus-width|focus-offset)/.test(name))return 'border';
  if(/(?:overlay)/.test(name))return 'action';
  return 'density';
 }
 if(section==='other') {
  if(/(?:dur|ease|transition)/.test(name))return 'motion';
  if(name.includes('lh-'))return 'lineHeight';
  if(name.startsWith('ds-content-'))return 'content';
  return 'layout';
 }
 if(/^(?:ds-n-|ds-w-|ds-series-|ds-map-|ds-chart-(?:plot|axis|grid|label|crosshair|marker|zoom|mark|threshold|nodata))/.test(name))return 'palette';
 if(/^(?:ds-fg|ds-on-|ds-header-fg|ds-header-icon|ds-chart-tooltip-(?:fg|muted))/.test(name))return 'text';
 if(/^(?:ds-bg|ds-surface|ds-skeleton|ds-header-(?:bg|hover|plate|chip-bg|env-bg|badge-bg)|ds-chart-tooltip-bg)/.test(name))return 'surface';
 if(/(?:border|divider|line$)/.test(name))return 'border';
 if(/^(?:ds-brand|ds-accent|ds-focus-color|ds-header-(?:indicator|tab)|ds-fg-action)/.test(name))return 'action';
 return 'status';
}

function resolved(value, set) {
 let current=value;
 for(let depth=0;depth<12&&current.includes('var(');depth++)current=current.replace(/var\((--[\w-]+)\)/g,(_,name)=>set[name]??'');
 return current;
}

function breakpointRanges(set) {
 const m=parseInt(set['--ds-bp-m']),l=parseInt(set['--ds-bp-l']),xl=parseInt(set['--ds-bp-xl']);
 return [['S',`до ${m-1} px`],['M',`${m}–${l-1} px`],['L',`${l}–${xl-1} px`],['XL',`от ${xl} px`]];
}

function breakpointSample(entry,value) {
 const max=entry.name.endsWith('-max');
 const ranges=breakpointRanges(entry.sets['DEFAULT.light']);
 const name=entry.name.replace('--ds-bp-','').replace('-max','').toUpperCase();
 const index=ranges.findIndex(([label])=>label===name)-(max?0:1);
 const before=ranges[index][0],after=ranges[index+1][0],boundary=parseInt(value)+(max?1:0);
 const window=(label,width,selected)=>`<span class="token-breakpoint-window${selected?' is-boundary':''}"><i aria-hidden="true"><b></b><b></b><b></b></i><span>${label} · ${width} px</span></span>`;
 return `<span class="token-breakpoint">${window(before,boundary-1,max)}<span class="token-breakpoint-arrow" aria-hidden="true">→</span>${window(after,boundary,!max)}<strong>${max?'Последний размер '+before:'Начало '+after}</strong></span>`;
}

function sample(entry,value,dark=false,red2=false) {
 const safe=escapeHtml(value), kind=entry.category;
 const context=entry.name.includes('on-inverse')||entry.name.startsWith('--ds-chart-tooltip-')?'--ds-surface-inverse':entry.name==='--ds-on-brand'?'--ds-brand':entry.name==='--ds-on-solid'?'--ds-danger-solid':entry.name==='--ds-accent-on'?'--ds-accent':entry.name==='--ds-accent-mark-on'?'--ds-accent-mark':/^--ds-(neutral|info|success|warning|danger)-fg$/.test(entry.name)?entry.name.replace(/-fg$/,'-bg'):null;
 const stage=`<span class="token-sample${dark?' token-sample-dark':''}" data-ds-theme="${red2?'RED2':'DEFAULT'}" data-ds-appearance="${dark?'dark':'light'}"${context?` style="background:var(${context})"`:''}>`;
 if(kind==='text'||entry.name==='--ds-brand-text'||kind==='status'&&entry.name.includes('-fg')||context)return `${stage}<span class="token-sample-text" style="color:${safe}">Aa Пример текста</span></span>`;
 if(kind==='border'||kind==='status'&&entry.name.endsWith('-line'))return `${stage}<span class="token-sample-border" style="${/^[\d.]+px$/.test(value)?'border-width':'border-color'}:${safe}"></span></span>`;
 if(kind==='spacing')return entry.name.includes('pad')?`${stage}<span class="token-sample-padding" style="padding:${safe}"><i></i></span></span>`:`${stage}<span class="token-sample-gap" style="gap:${safe}"><i></i><i></i></span></span>`;
 if(kind==='density')return entry.name.includes('-w')?`${stage}<span class="token-sample-width"><i></i></span></span>`:entry.name.includes('icon')?`${stage}<span class="token-sample-icon" style="width:${safe};height:${safe}"></span></span>`:`${stage}<span class="token-sample-size" style="height:${safe}">Контрол</span></span>`;
 if(kind==='action'&&value.endsWith('%'))return `${stage}<span class="token-sample-overlay" style="opacity:${parseFloat(value)/100}"></span></span>`;
 if(kind==='radius')return `${stage}<span class="token-sample-radius" style="border-radius:${safe}"></span></span>`;
 if(kind==='shadow')return `${stage}<span class="token-sample-shadow" style="box-shadow:${safe}"></span></span>`;
 if(kind==='type')return `${stage}<span class="token-sample-type" style="${entry.name.startsWith('--ds-font-')?'font-family':'font'}:${safe}">${escapeHtml(entry.sample??'Обзор парка')}</span></span>`;
 if(kind==='fontSize')return `${stage}<span style="font-size:${safe}">Водитель назначен</span></span>`;
 if(kind==='fontWeight')return `${stage}<span style="font-weight:${safe}">Заголовок панели</span></span>`;
 if(kind==='tracking')return `${stage}<span style="letter-spacing:${safe}">ОБЪЕКТ</span></span>`;
 if(kind==='lineHeight')return `${stage}<span style="line-height:${safe}">Водитель назначен.<br>Маршрут построен.</span></span>`;
 if(kind==='motion')return /^\d+(?:\.\d+)?ms$/.test(value)?`${stage}<button class="token-motion" type="button" data-duration="${safe}">Воспроизвести</button><span class="token-motion-dot"></span></span>`:`${stage}<span class="token-sample-type">Переход контрола</span></span>`;
 if(kind==='layout')return `${stage}${breakpointSample(entry,value)}</span>`;
 if(kind==='content')return `${stage}<span class="token-content-example${entry.name.endsWith('-prose')?' token-content-prose':''}"><span class="token-content-frame" aria-hidden="true"><i><b></b><b></b><b></b></i></span><span>${entry.name.endsWith('-prose')?'Текстовая колонка':'Контент по центру, поля по краям'} · максимум ${safe}</span></span></span>`;
 return `${stage}<span class="token-swatch" style="background:${safe}"></span></span>`;
}

function cell(entry, value, mode, dark=false) {
 const display=resolved(value,entry.sets[mode]??entry.sets['DEFAULT.light']);
 const attribute=singleCategories.has(entry.category)?'data-constant-value':mode.includes('.')?`data-theme-value="${mode}"`:`data-density-value="${mode}"`;
 return `<div class="token-variant" ${attribute}>${sample(entry,display,dark,mode.startsWith('RED2'))}<code class="token-value">${escapeHtml(display)}</code></div>`;
}

function row(entry) {
 const name=escapeHtml(entry.name),id=escapeHtml(entry.name.slice(2));
 const aliases=entry.aliases.length?`<div class="token-aliases">Основа: ${entry.aliases.map(alias=>`<a href="#${escapeHtml(alias.slice(2))}">${escapeHtml(alias)}</a>`).join(', ')}</div>`:'';
 const summary=entry.usage.split(/(?<=\.)\s+/u)[0];
 const more=summary!==entry.usage?`<details class="token-details"><summary>Подробнее</summary><p>${escapeHtml(entry.usage)}</p></details>`:'';
 const first=`<th scope="row"><button class="token-copy" type="button" data-copy="${name}" aria-label="Скопировать var(${name})">${name}</button><p class="token-usage">${escapeHtml(summary)}</p>${more}${aliases}</th>`;
 const variants=densityCategories.has(entry.category)
  ?`<td>${cell(entry,entry.density.cozy,'cozy')}</td><td>${cell(entry,entry.density.compact,'compact')}</td>`
  :singleCategories.has(entry.category)
  ?`<td colspan="2">${cell(entry,entry.values['DEFAULT.light'],'DEFAULT.light')}</td>`
  :`<td>${cell(entry,entry.values['DEFAULT.light'],'DEFAULT.light')}${cell(entry,entry.values['RED2.light'],'RED2.light')}</td><td>${cell(entry,entry.values['DEFAULT.dark'],'DEFAULT.dark',true)}${cell(entry,entry.values['RED2.dark'],'RED2.dark',true)}</td>`;
 return `<tr id="${id}" data-token-row data-search="${escapeHtml((entry.name+' '+entry.usage).toLowerCase())}">${first}${variants}</tr>`;
}

export function renderTokenReference(model){
 const sourceEntries=new Map();
 for(const[section,sectionValue]of Object.entries(model.source))for(const token of sectionValue?.tokens??[])sourceEntries.set('--'+token.name,{section,usage:token.usage??''});
 for(const group of model.source.type.groups)for(const style of group.styles)sourceEntries.set('--'+style.name,{section:'type',usage:style.usage,sample:style.sample});
 for(const name of Object.keys(model.source.type.families))sourceEntries.set('--'+name,{section:'type',usage:'Семейство шрифта для типографических ролей.'});
 const entries=model.names.map(name=>{
  const source=sourceEntries.get(name)??{section:'type',usage:'Типографическая роль.'};
  return{name,usage:source.usage,category:category(name.slice(2),source.section),sample:source.sample,
   values:Object.fromEntries(Object.entries(model.sets).map(([scope,values])=>[scope,values[name]])),
   sets:model.sets,aliases:model.aliases[name],density:{cozy:model.density.cozy[name]??null,compact:model.density.compact[name]??null}};
 });
 const sections=categories.map(([id,label])=>{
  const list=entries.filter(entry=>entry.category===id);
  const headers=densityCategories.has(id)?['Cozy','Compact']:singleCategories.has(id)?['Пример и значение']:['Light','Dark'];
  const guide=id==='layout'?`<div class="token-breakpoint-scale" aria-label="Диапазоны ширины окна">${breakpointRanges(model.sets['DEFAULT.light']).map(([range,width])=>`<div><strong>${range}</strong><span>${width}</span></div>`).join('')}</div><p class="token-range-note">Ширина окна в px. Миниатюры показывают границу диапазонов; адаптивное поведение задаёт приложение.</p>`:'';
  return `<section class="token-section" id="token-${id}" data-category="${id}"><h2>${label}</h2>${guide}<div class="token-table-scroll"><table aria-label="${label}"><thead><tr><th scope="col">Токен и назначение</th>${headers.map(h=>`<th scope="col"${headers.length===1?' colspan="2"':''}>${h}</th>`).join('')}</tr></thead><tbody>${list.map(row).join('')}</tbody></table></div></section>`;
 }).join('');
 const options=categories.map(([id,label])=>`<option value="${id}">${label}</option>`).join('');
 const contents=categories.map(([id,label])=>`<a href="#token-${id}" data-category-link="${id}">${label}</a>`).join('');
 return{entries,html:`<link rel="stylesheet" href="/token-reference.css"><div class="token-reference"><p class="token-intro">Выбирайте токен по назначению. Значения и образцы показывают, как он работает в разных оформлениях и плотностях.</p><div class="token-tab" aria-current="page">Все токены</div><div class="token-columns"><div class="token-catalog"><h2>Все категории</h2><label class="token-search"><span class="sr-only">Поиск токенов</span><input type="search" aria-label="Поиск токенов" placeholder="Найти по имени или назначению"></label><div class="token-filters"><select aria-label="Категория"><option value="all">Все категории</option>${options}</select><select aria-label="Бренд"><option value="DEFAULT">DEFAULT</option><option value="RED2">RED2</option></select></div><p class="token-count" role="status"></p><div class="token-sections">${sections}</div><p class="token-empty" hidden>Ничего не найдено. Попробуйте другое название.</p><p class="token-copy-status" role="status">Нажмите на имя токена, чтобы скопировать CSS-переменную.</p></div><aside class="token-contents" aria-label="На этой странице"><strong>На этой странице</strong>${contents}</aside></div></div><script type="module" src="/token-reference.js"></script>`};
}
