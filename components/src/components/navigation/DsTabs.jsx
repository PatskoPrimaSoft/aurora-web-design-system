import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

/* Две модели, выбранные по месту:
   - tone="onHeader" — НАВИГАЦИЯ между разделами продукта: <nav> с кнопками,
     активная — aria-current="page". Каждый раздел — свой Tab-стоп, стрелки не нужны;
     role="tab" здесь был бы неправдой — за разделом не стоит tabpanel этой страницы.
   - underline / segmented — ВКЛАДКИ внутри страницы: role="tablist", один вход
     через Tab (roving tabindex), ← → Home End переводят фокус и выбирают вкладку
     (автоматическая активация). Связь с панелью — через idBase и DsTabPanel:
     вкладка получает aria-controls, панель — aria-labelledby. */
/** Внутри DsAppHeader — его <nav> уже ориентир. */
export const DsInHeader=React.createContext(false);
export function dsTabIds(idBase,id){return {tabId:idBase+'-tab-'+id,panelId:idBase+'-panel-'+id}}

/** Панель вкладки. Скрыта, пока вкладка не выбрана; подписана своей вкладкой. */
export function DsTabPanel({idBase,id,active,children,style,unmountOnHide=false}){
  const [visited,setVisited]=React.useState(active);
  React.useLayoutEffect(()=>{if(active)setVisited(true);},[active]);
  const {tabId,panelId}=dsTabIds(idBase,id);
  return <div role="tabpanel" id={panelId} aria-labelledby={tabId} hidden={!active} tabIndex={active?0:-1} style={style}>{(active||(!unmountOnHide&&visited))?children:null}</div>;
}

/** Tab rail. `onHeader` for the header, `underline` in content, `segmented` for small switches. */
export function DsTabs({items=[],active,onChange,tone='underline',stack=true,idBase,'aria-label':ariaLabel}){
  const S=useDsStrings();
  const inHeader=React.useContext(DsInHeader);
  const listRef=React.useRef(null);
  const viewportRef=React.useRef(null);
  const [indicator,setIndicator]=React.useState(null);
  const reveal=React.useCallback(element=>{
    const viewport=viewportRef.current;if(!viewport||!element)return;
    const bounds=viewport.getBoundingClientRect(),tab=element.getBoundingClientRect();
    const padding=parseFloat(getComputedStyle(viewport).paddingLeft)||0;
    if(tab.width>bounds.width-padding*2||tab.left<bounds.left+padding)viewport.scrollLeft+=tab.left-bounds.left-padding;
    else if(tab.right>bounds.right-padding)viewport.scrollLeft+=tab.right-bounds.right+padding;
  },[]);
  React.useLayoutEffect(()=>{
    const viewport=viewportRef.current;
    const current=listRef.current?.querySelector('[aria-selected="true"],[aria-current="page"]');
    const update=(animate=false)=>{
      reveal(current);
      if(!current||tone==='segmented'){setIndicator(previous=>previous===null?previous:null);return;}
      const inset=tone==='onHeader'?10:0;
      const left=current.offsetLeft+inset,width=Math.max(0,current.offsetWidth-inset*2);
      setIndicator(previous=>previous&&previous.left===left&&previous.width===width?previous:{left,width,animate:animate&&previous!==null});
    };
    update(true);
    const resize=()=>update(false);
    if(typeof ResizeObserver==='undefined'){window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);}
    const observer=new ResizeObserver(resize);observer.observe(viewport);
    listRef.current?.querySelectorAll('button').forEach(tab=>observer.observe(tab,{box:'border-box'}));
    return()=>observer.disconnect();
  },[active,items,tone,reveal]);
  const onHeader=tone==='onHeader';
  const ids=id=>idBase?dsTabIds(idBase,id):{};
  const onKey=e=>{
    const tabs=Array.from(listRef.current.querySelectorAll('[role="tab"]'));
    const i=tabs.indexOf(e.target);if(i<0)return;
    let n=null;
    if(e.key==='ArrowRight')n=(i+1)%tabs.length;
    else if(e.key==='ArrowLeft')n=(i-1+tabs.length)%tabs.length;
    else if(e.key==='Home')n=0;
    else if(e.key==='End')n=tabs.length-1;
    if(n==null)return;
    e.preventDefault();tabs[n].focus({preventScroll:true});reveal(tabs[n]);
    if(onChange)onChange(items[n].id);
  };
  const hasActive=items.some(it=>it.id===active);
  const tabProps=it=>{const on=it.id===active,{tabId,panelId}=ids(it.id);
    return {role:'tab','aria-selected':on,tabIndex:on||(!hasActive&&it===items[0])?0:-1,id:tabId,'aria-controls':panelId}};
  const focusSpace='calc(var(--ds-focus-width) + var(--ds-focus-offset))';
  const viewportStyle={minWidth:0,maxWidth:'100%',width:tone==='segmented'?'fit-content':undefined,
    overflowX:'auto',padding:focusSpace,scrollbarWidth:'thin',scrollbarColor:'var(--ds-border-strong) var(--ds-surface)'};
  const wrap=content=><div ref={viewportRef} data-ds-tabs-viewport="" style={viewportStyle}
    onFocusCapture={event=>{if(event.target.matches('button'))reveal(event.target);}}>{content}</div>;
  if(tone==='segmented')return wrap(<div ref={listRef} role="tablist" aria-label={ariaLabel} onKeyDown={onKey} style={{display:'inline-flex',gap:2,padding:2,
    background:'var(--ds-bg-sunken)',border:'1px solid var(--ds-border)',borderRadius:'var(--ds-radius-control)'}}>
    {items.map(it=><Tab key={it.id} it={it} on={it.id===active} segmented onChange={onChange} a11y={tabProps(it)}/>)}
  </div>);
  const movingIndicator=indicator?<span data-ds-tabs-indicator="" aria-hidden="true" style={{
    position:'absolute',pointerEvents:'none',bottom:0,left:indicator.left,width:indicator.width,height:tone==='onHeader'?3:2,
    borderRadius:'var(--ds-radius-pill)',background:tone==='onHeader'?'var(--ds-header-indicator)':'var(--ds-brand)',
    transition:indicator.animate?'left var(--ds-dur-fast) var(--ds-ease), width var(--ds-dur-fast) var(--ds-ease)':'none',
  }}/>:null;
  const stacked=onHeader&&stack;
  const rail={position:'relative',display:'flex',alignItems:'stretch',gap:onHeader?2:'var(--ds-gap-md)',width:'max-content',minWidth:'100%',
    height:onHeader?'calc(var(--ds-header-h) - 2 * (var(--ds-focus-width) + var(--ds-focus-offset)))':undefined,borderBottom:onHeader?'none':'1px solid var(--ds-border)'};
  /* В шапке ориентир <nav> ставит DsAppHeader; вне шапки — ставим его сами. */
  if(onHeader){const Wrap=inHeader?'div':'nav';
    return wrap(<Wrap ref={listRef} data-ds-animated-tabs={indicator?'':undefined} aria-label={inHeader?undefined:(ariaLabel||S.tabs.nav)} style={rail}>
    {items.map(it=><Tab key={it.id} it={it} on={it.id===active} onHeader stacked={stacked} onChange={onChange}
      a11y={{'aria-current':it.id===active?'page':undefined}}/>)}
    {movingIndicator}
  </Wrap>);}
  return wrap(<div ref={listRef} data-ds-animated-tabs={indicator?'':undefined} role="tablist" aria-label={ariaLabel} onKeyDown={onKey} style={rail}>
    {items.map(it=><Tab key={it.id} it={it} on={it.id===active} onHeader={false} stacked={false} onChange={onChange} a11y={tabProps(it)}/>)}
    {movingIndicator}
  </div>);
}
function Tab({it,on,onHeader=false,stacked=false,segmented=false,onChange,a11y}){
  const fg=onHeader?(on?'var(--ds-header-tab-fg-active)':'var(--ds-header-fg-muted)'):(on?(segmented?'var(--ds-fg-strong)':'var(--ds-brand-text)'):'var(--ds-fg-muted)');
  const badgeBg=onHeader?'var(--ds-header-badge-bg)':'var(--ds-surface-active)';
  const badgeFg=onHeader?'var(--ds-header-badge-fg)':'var(--ds-fg)';
  /* icon-only ink rule from the header band: a glyph carries no text mass, so an
     unselected tab's glyph gets --ds-header-icon-fg, not the muted label value. */
  const iconFg=onHeader&&!on?'var(--ds-header-icon-fg)':undefined;
  const icon=it.icon?<Icon name={it.icon} size={segmented?"var(--ds-icon-sm)":"var(--ds-icon)"} style={{color:iconFg}}/>:null;
  return <button type="button" {...a11y} data-ds-tab={onHeader?'header':segmented?'segmented':'underline'} data-ds-selected={on?'true':'false'} onClick={()=>onChange&&onChange(it.id)}
    style={{position:'relative',display:'inline-flex',flexDirection:stacked?'column':'row',
      alignItems:'center',justifyContent:'center',gap:stacked?2:'var(--ds-gap-sm)',flex:'none',
      padding:stacked?'0 10px':(onHeader?'0 14px':segmented?'0 12px':'6px 0 10px'),height:onHeader?'100%':segmented?'var(--ds-control-h-sm)':undefined,
      border:'none',borderRadius:segmented?'calc(var(--ds-radius-control) - 2px)':undefined,
      '--tab-background':onHeader&&on?'var(--ds-header-hover)':segmented&&on?'var(--ds-surface)':'transparent',
      background:'var(--tab-feedback, var(--tab-background))',boxShadow:segmented&&on?'var(--ds-shadow-xs)':'none',
      font:stacked?'var(--ds-type-caption)':'var(--ds-type-ui)',lineHeight:stacked?1.1:undefined,
      color:'var(--tab-feedback-fg, '+fg+')',cursor:'pointer',whiteSpace:'nowrap',transition:'var(--ds-transition-control)'}}>
    {stacked&&icon?<span style={{position:'relative',display:'inline-flex',flex:'none'}}>{icon}
      {it.badge!=null?<span data-ds-tab-count="" style={{position:'absolute',top:-5,left:'58%',height:14,minWidth:14,padding:'0 3px',
        display:'grid',placeItems:'center',borderRadius:'var(--ds-radius-pill)',font:'var(--ds-type-eyebrow)',lineHeight:1,
        background:badgeBg,color:badgeFg,boxSizing:'content-box'}}>{it.badge}</span>:null}</span>:icon}
    {it.label}
    {it.badge!=null&&!(stacked&&icon)?<span data-ds-tab-count="" style={{font:'var(--ds-type-eyebrow)',minWidth:16,padding:'1px 5px',textAlign:'center',
      borderRadius:'var(--ds-radius-pill)',background:badgeBg,color:badgeFg}}>{it.badge}</span>:null}
    <span data-ds-tab-indicator="" aria-hidden="true" style={{position:'absolute',left:onHeader?10:0,right:onHeader?10:0,bottom:0,height:onHeader?3:2,
      borderRadius:onHeader?'var(--ds-radius-pill) var(--ds-radius-pill) 0 0':'var(--ds-radius-pill)',
      background:'var(--tab-preview-indicator, '+(on?(onHeader?'var(--ds-header-indicator)':'var(--ds-brand)'):'transparent')+')',display:segmented?'none':undefined}}/>
  </button>;
}
