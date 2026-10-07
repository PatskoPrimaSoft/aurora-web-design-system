import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { DsStateIcon } from './DsStateIcon.jsx';
import { dsSlots } from '../layout/DsPageLayout.jsx';
import { usePress } from '../buttons/DsButton.jsx';
import { DsIconButton } from '../buttons/DsIconButton.jsx';

// У кнопок системы подпись показывает строка; второй, нативный tooltip не нужен.
const rowActions=nodes=>React.Children.map(nodes,node=>{
  if(!React.isValidElement(node))return node;
  if(node.type===DsIconButton)return React.cloneElement(node,{title:undefined});
  if((typeof node.type==='string'||node.type===React.Fragment)&&node.props.children)
    return React.cloneElement(node,{},rowActions(node.props.children));
  return node;
});

/** Основная область — кнопка действия или ссылка. Дополнительные действия — её соседи. */
export function DsListRow({title,subtitle,subtitleMono=false,state,course,value,valueMeta,icon,active=false,selected=false,
  onClick,href,target,rel,actions,actionsWidth,badge,children,as='button'}){
  const [sl]=dsSlots(children,['actions','badge'],{actions,badge});
  const link=as!=='div'&&href!=null;
  const clickable=as!=='div'&&(link||!!onClick);
  const Main=link?'a':clickable?'button':'div';
  const [focused,setFocused]=React.useState(false),[tip,setTip]=React.useState(null);
  const titleRef=React.useRef(null),tipRef=React.useRef(null);
  const showTitle=()=>{
    const el=titleRef.current;
    if(el&&el.scrollWidth>el.clientWidth)showTip(el,el.textContent);else hideTip();
  };
  function showTip(el,text){
    if(!text){hideTip();return;}
    const r=el.getBoundingClientRect();
    setTip({text,left:Math.max(4,Math.min(r.left,window.innerWidth-324)),top:r.bottom,above:r.top});
  }
  const hideTip=()=>setTip(null);
  const dismissTip=e=>{if(e.key==='Escape'&&tip){e.preventDefault();hideTip();}};
  const {hover,pressed,handlers,rest:own}=usePress(!clickable,{
    onFocus:showTitle,onBlur:hideTip,
    onKeyDown:dismissTip,
  });
  React.useLayoutEffect(()=>{
    if(!tip||!tipRef.current)return;
    const el=tipRef.current,r=el.getBoundingClientRect();
    el.style.left=Math.max(4,Math.min(tip.left,window.innerWidth-r.width-4))+'px';
    el.style.top=(tip.top+r.height<=window.innerHeight-4?tip.top:Math.max(4,tip.above-r.height))+'px';
  },[tip]);
  React.useEffect(()=>{
    if(!tip)return;
    window.addEventListener('scroll',hideTip,true);window.addEventListener('resize',hideTip);
    return ()=>{window.removeEventListener('scroll',hideTip,true);window.removeEventListener('resize',hideTip);};
  },[tip]);
  const tinted=active||selected;
  const overlay=pressed&&tinted?'linear-gradient(0deg,color-mix(in oklab,var(--ds-brand-text) var(--ds-overlay-press),transparent),color-mix(in oklab,var(--ds-brand-text) var(--ds-overlay-press),transparent))':undefined;
  return <div data-ds-list-row="" onMouseLeave={hideTip}
    onPointerOver={e=>{
      if(e.pointerType!=='mouse'||tipRef.current?.contains(e.target))return;
      const action=e.target.closest('[data-ds-list-actions] button,[data-ds-list-actions] a[href]');
      if(action&&e.currentTarget.contains(action))showTip(action,action.getAttribute('aria-label')||action.getAttribute('title'));
      else if(titleRef.current?.contains(e.target))showTitle();else hideTip();
    }}
    onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget)){setFocused(false);hideTip();}}}
    style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',width:'100%',minWidth:0,
      minHeight:'var(--ds-row-h-lg)',padding:'0 var(--ds-pad-sm)',borderRadius:'var(--ds-radius-md)',
      background:tinted?'var(--ds-surface-selected)':pressed?'var(--ds-surface-active)':clickable&&(hover||focused)?'var(--ds-surface-hover)':'transparent',backgroundImage:overlay,
      boxShadow:active?'inset 2px 0 0 var(--ds-brand)':'none',transition:'var(--ds-transition-control)'}}>
    <Main {...(link?{href,target,rel:rel??(target==='_blank'?'noopener noreferrer':undefined),onClick}:clickable?{type:'button',onClick}:null)}
      {...own} {...handlers} aria-current={active?(link?'page':'true'):undefined}
      style={{flex:1,minWidth:0,display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',alignSelf:'stretch',
        padding:'var(--ds-pad-tight) 0',margin:0,border:'none',background:'transparent',font:'inherit',color:'inherit',textDecoration:'none',
        textAlign:'left',cursor:clickable?'pointer':'default',borderRadius:'var(--ds-radius-sm)'}}>
      {state?<DsStateIcon state={state} course={course} size={28}/>
        :icon?<span style={{flex:'none',display:'inline-flex',alignItems:'center',justifyContent:'center',width:28,height:28,
          borderRadius:'50%',background:'var(--ds-neutral-bg)',color:'var(--ds-fg-muted)'}}><Icon name={icon} size="var(--ds-icon-sm)"/></span>:null}
      <span style={{flex:1,minWidth:0}}>
        <span style={{display:'flex',alignItems:'center',gap:6,minWidth:0}}>
          <span ref={titleRef} data-ds-list-title="" style={{font:'var(--ds-type-body-strong)',color:'var(--ds-fg)',minWidth:0,overflow:'hidden',
            textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</span>
          {sl.badge?<span style={{flex:'none',display:'inline-flex'}}>{sl.badge}</span>:null}</span>
        {subtitle?<span data-ds-list-subtitle="" style={{display:'block',font:'var(--ds-type-caption)',fontFamily:subtitleMono?'var(--ds-font-mono)':undefined,
          color:'var(--ds-fg-subtle)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{subtitle}</span>:null}</span>
      {value!=null?<span style={{flex:'none',textAlign:'right'}}>
        <span style={{display:'block',font:'var(--ds-type-mono)',color:'var(--ds-fg)'}}>{value}</span>
        {valueMeta?<span style={{display:'block',font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)'}}>{valueMeta}</span>:null}</span>:null}
    </Main>
    {sl.actions||actionsWidth!=null?<span data-ds-list-actions=""
      onFocusCapture={e=>showTip(e.target,e.target.getAttribute('aria-label')||e.target.getAttribute('title'))}
      onBlurCapture={hideTip} onKeyDown={dismissTip}
      style={{flex:'none',display:'inline-flex',justifyContent:'flex-end',alignItems:'center',gap:2,width:actionsWidth,minWidth:actionsWidth,color:'var(--ds-fg-muted)'}}>{rowActions(sl.actions)}</span>:null}
    {tip?<span ref={tipRef} role="tooltip" style={{position:'fixed',left:tip.left,top:tip.top,zIndex:1000,maxWidth:'min(320px, calc(100vw - 8px))',
      padding:'var(--ds-pad-tight) var(--ds-pad-sm)',borderRadius:'var(--ds-radius-sm)',background:'var(--ds-surface-inverse)',color:'var(--ds-fg-on-inverse)',
      font:'var(--ds-type-caption)',overflowWrap:'anywhere',boxShadow:'var(--ds-shadow-sm)'}}>{tip.text}</span>:null}
  </div>;
}
