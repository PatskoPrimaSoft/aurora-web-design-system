import React from 'react';
import { createPortal } from 'react-dom';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { DsCheckbox } from '../forms/DsCheckbox.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';
import { usePress } from '../buttons/DsButton.jsx';
function initials(s){return String(s||'').trim().split(/[\s-]+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()}
const tint=depth=>{const c='color-mix(in oklab,var(--ds-brand-text) '+depth+',transparent)';return 'linear-gradient(0deg,'+c+','+c+')'};

/** Раскрытие, открытие и групповой выбор — самостоятельные соседние контролы. */
export function DsTreeRow({title,meta,icon,avatarSrc,avatar=false,level=0,expanded=true,onToggle,
  selected,total,select,onSelectChange,selectDisabled=false,unread=0,onClick,active=false,
  expandLabel,collapseLabel}){
  const S=useDsStrings();
  const [focused,setFocused]=React.useState(false),[toggleFocused,setToggleFocused]=React.useState(false);
  const [tip,setTip]=React.useState(null),[clipped,setClipped]=React.useState(false);
  const titleRef=React.useRef(null),mainRef=React.useRef(null),tipRef=React.useRef(null),tipId=React.useId();
  const hideTip=()=>setTip(null);
  const showTitle=()=>{
    const el=titleRef.current;
    if(!el||el.scrollWidth<=el.clientWidth){hideTip();return;}
    const r=el.getBoundingClientRect();
    setTip({text:el.textContent,left:Math.max(4,Math.min(r.left,window.innerWidth-324)),top:r.bottom,above:r.top});
  };
  React.useLayoutEffect(()=>{
    const el=titleRef.current;
    const measure=()=>setClipped(!!el&&el.scrollWidth>el.clientWidth);
    measure();
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(measure):null;
    if(el)observer?.observe(el);
    return ()=>observer?.disconnect();
  },[title,meta,unread,total]);
  React.useLayoutEffect(()=>{
    if(!tip||!tipRef.current)return;
    const el=tipRef.current,r=el.getBoundingClientRect();
    el.style.left=Math.max(4,Math.min(tip.left,window.innerWidth-r.width-4))+'px';
    el.style.top=(tip.top+r.height<=window.innerHeight-4?tip.top:Math.max(4,tip.above-r.height))+'px';
  },[tip]);
  React.useEffect(()=>{
    if(!tip)return;
    const escape=e=>{if(e.key==='Escape'){e.preventDefault();hideTip();}};
    const refresh=()=>{if(mainRef.current===document.activeElement)showTitle();else hideTip();};
    window.addEventListener('keydown',escape,true);
    window.addEventListener('scroll',refresh,true);window.addEventListener('resize',refresh);
    return ()=>{window.removeEventListener('keydown',escape,true);window.removeEventListener('scroll',refresh,true);window.removeEventListener('resize',refresh);};
  },[tip]);
  const splitToggle=!!(onClick&&onToggle),act=!!(onClick||onToggle);
  const mainPress=usePress(!act,{onFocus:()=>{setFocused(true);showTitle();},onBlur:()=>{setFocused(false);hideTip();}});
  const togglePress=usePress(!splitToggle,{onFocus:()=>setToggleFocused(true),onBlur:()=>setToggleFocused(false)});
  const badge=unread>0?(unread>99?'99+':String(unread)):null,av=avatar||avatarSrc;
  const plain={margin:0,border:'none',font:'inherit',color:'inherit',padding:0,textAlign:'left',borderRadius:'var(--ds-radius-sm)',transition:'var(--ds-transition-control)'};
  const slot={flex:'none',width:'var(--ds-control-h-sm)',minHeight:'var(--ds-control-h-sm)',display:'inline-flex',alignItems:'center',justifyContent:'center'};
  const chevron=onToggle?<Icon name={expanded?'expand_more':'chevron_right'} size="var(--ds-icon)" style={{color:'var(--ds-fg-subtle)'}}/>:null;
  const toggle=()=>onToggle?.(!expanded);
  const Main=act?'button':'div';
  const mainProps=onClick?{type:'button',onClick}:onToggle?{type:'button',onClick:toggle,'aria-expanded':expanded}:{tabIndex:clipped?0:undefined};
  const feedback=(press,focus)=>({
    backgroundColor:press.pressed?'var(--ds-surface-active)':press.hover||focus?'var(--ds-surface-hover)':'transparent',
    backgroundImage:undefined
  });
  const mainFeedback=active?{backgroundColor:'transparent',backgroundImage:mainPress.pressed||mainPress.hover||focused?tint(mainPress.pressed?'var(--ds-overlay-press)':'var(--ds-overlay-hover)'):undefined}:feedback(mainPress,focused);
  return <div data-ds-tree-row="" style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',minHeight:'var(--ds-row-h)',
    padding:'0 var(--ds-pad-sm)',paddingLeft:'calc(var(--ds-pad-sm) + '+level*20+'px)',
    userSelect:'none',minWidth:0,borderRadius:'var(--ds-radius-md)',
    background:active?'var(--ds-surface-selected)':'transparent',
    boxShadow:active?'inset 2px 0 0 var(--ds-brand)':'none',transition:'var(--ds-transition-control)'}}>
    {splitToggle?<button type="button" data-ds-tree-chevron="" aria-expanded={expanded}
      aria-label={expanded?(collapseLabel?collapseLabel+' «'+title+'»':S.collapse(title)):(expandLabel?expandLabel+' «'+title+'»':S.expand(title))}
      onClick={toggle} {...togglePress.rest} {...togglePress.handlers}
      style={{...plain,...slot,...feedback(togglePress,toggleFocused),cursor:'pointer'}}>{chevron}</button>:null}
    <Main ref={mainRef} {...mainProps} {...mainPress.rest} {...mainPress.handlers}
      aria-current={active?'true':undefined} aria-describedby={tip?tipId:undefined}
      onMouseEnter={showTitle} onMouseLeave={e=>{if(!tipRef.current?.contains(e.relatedTarget))hideTip();}}
      style={{...plain,flex:1,minWidth:0,display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',
        alignSelf:'stretch',padding:'var(--ds-pad-tight) 0',cursor:act?'pointer':'default',...mainFeedback}}>
      {splitToggle?null:<span data-ds-tree-chevron="" aria-hidden="true" style={slot}>{chevron}</span>}
      {av?<span aria-hidden="true" style={{flex:'none',display:'flex',alignItems:'center',justifyContent:'center',width:30,height:30,
        borderRadius:'var(--ds-radius-circle)',overflow:'hidden',background:'var(--ds-brand-subtle)',
        color:'var(--ds-brand-text)',font:'var(--ds-type-ui)'}}>
        {avatarSrc?<img src={avatarSrc} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:initials(title)}</span>
        :icon?<Icon name={icon} size="var(--ds-icon-sm)" style={{color:'var(--ds-fg-muted)',flex:'none'}}/>:null}
      <span style={{flex:1,minWidth:0,display:'flex',alignItems:'center',gap:6}}>
        <span ref={titleRef} data-ds-tree-title="" style={{font:'var(--ds-type-body-strong)',color:'var(--ds-fg)',
          minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</span>
        {badge?<span data-ds-tree-unread="" role="img" aria-label={S.unread(unread)} style={{flex:'none',minWidth:16,height:16,padding:'0 5px',
          borderRadius:'var(--ds-radius-pill)',background:'var(--ds-accent-mark)',color:'var(--ds-accent-mark-on)',
          font:'var(--ds-type-eyebrow)',display:'flex',alignItems:'center',justifyContent:'center'}}>{badge}</span>:null}
        {meta?<span style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)',flex:'0 1000 auto',minWidth:0,maxWidth:'40%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{meta}</span>:null}
      </span>
      {total!=null?<span data-ds-tree-count="" role="img" aria-label={S.tree.selected(selected||0,total)}
        style={{flex:'none',font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)',fontVariantNumeric:'tabular-nums'}}>{(selected||0)+' / '+total}</span>:null}
    </Main>
    {select?<span style={{flex:'none',marginRight:-8}}>
      <DsCheckbox state={select} disabled={selectDisabled} ariaLabel={S.selectAllIn(title)} onChange={onSelectChange}/></span>:null}
    {tip?createPortal(<span ref={tipRef} id={tipId} role="tooltip" onMouseLeave={hideTip} onClick={e=>e.stopPropagation()}
      style={{position:'fixed',left:tip.left,top:tip.top,zIndex:1000,maxWidth:'min(320px, calc(100vw - 8px))',
        padding:'var(--ds-pad-tight) var(--ds-pad-sm)',borderRadius:'var(--ds-radius-sm)',background:'var(--ds-surface-inverse)',
        color:'var(--ds-fg-on-inverse)',font:'var(--ds-type-caption)',overflowWrap:'anywhere',boxShadow:'var(--ds-shadow-sm)'}}>{tip.text}</span>,document.body):null}
  </div>;
}
