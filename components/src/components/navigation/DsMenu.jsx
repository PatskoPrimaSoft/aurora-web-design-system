import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { useDsLayer } from '../layout/DsDialog.jsx';

const MENU_ITEMS='[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"]';
const FOCUSABLE='button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Меню действий и выбора. Escape закрывает только верхний слой. */
export function DsMenu({trigger,items=[],onSelect,align='start',width=240,header,footer,open:openProp,onOpenChange,menuLabel}){
  const [openState,setOpenState]=React.useState(false);
  const open=openProp!=null?openProp:openState;
  const setOpen=v=>{if(openProp==null)setOpenState(v);onOpenChange&&onOpenChange(v)};
  const ref=React.useRef(null),menuRef=React.useRef(null),focusAt=React.useRef('first');
  const search=React.useRef({text:'',at:0});
  const [position,setPosition]=React.useState({left:0,top:0,maxHeight:320});
  const uid=React.useId(),menuId=uid+'-menu';
  const triggerId=React.isValidElement(trigger)&&trigger.props.id||uid+'-trigger';
  const triggerEl=()=>ref.current&&ref.current.querySelector('[aria-haspopup="menu"]');
  const itemEls=()=>menuRef.current?Array.from(menuRef.current.querySelectorAll(MENU_ITEMS)).filter(el=>!el.disabled):[];
  const close=restore=>{setOpen(false);search.current={text:'',at:0};if(restore)triggerEl()?.focus()};
  useDsLayer(open,()=>close(true));

  // Верхний слой сохраняет панель внутри DOM диалога и снимает обрезание overflow.
  React.useLayoutEffect(()=>{
    if(!open||!menuRef.current)return;
    const panel=menuRef.current;
    if(panel.showPopover)panel.showPopover();
    const place=()=>{
      const button=triggerEl();if(!button)return;
      const r=button.getBoundingClientRect(),viewW=document.documentElement.clientWidth||window.innerWidth;
      const viewH=window.innerHeight,edge=8,gap=6;
      const below=Math.max(0,viewH-r.bottom-gap-edge),above=Math.max(0,r.top-gap-edge);
      const desired=Math.min(320,panel.scrollHeight||320),up=below<desired&&above>below;
      const maxHeight=Math.min(320,up?above:below);
      const height=Math.min(desired,maxHeight),panelWidth=panel.getBoundingClientRect().width;
      const left=Math.max(edge,Math.min(align==='end'?r.right-panelWidth:r.left,viewW-panelWidth-edge));
      const top=Math.max(edge,up?r.top-gap-height:r.bottom+gap);
      setPosition(prev=>prev.left===left&&prev.top===top&&prev.maxHeight===maxHeight?prev:{left,top,maxHeight});
    };
    place();
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(place):null;
    observer?.observe(panel);if(triggerEl())observer?.observe(triggerEl());
    window.addEventListener('resize',place);document.addEventListener('scroll',place,true);
    return()=>{observer?.disconnect();window.removeEventListener('resize',place);document.removeEventListener('scroll',place,true);if(panel.hidePopover&&panel.matches(':popover-open'))panel.hidePopover()};
  },[open,align,width]);

  React.useEffect(()=>{
    if(!open)return;
    const els=itemEls();(focusAt.current==='last'?els[els.length-1]:els[0])?.focus();focusAt.current='first';
    const away=e=>{if(ref.current&&!ref.current.contains(e.target))close(false)};
    document.addEventListener('pointerdown',away);document.addEventListener('mousedown',away);
    return()=>{document.removeEventListener('pointerdown',away);document.removeEventListener('mousedown',away)};
  },[open]);
  const onTriggerKey=e=>{
    if(e.defaultPrevented||e.currentTarget.disabled||e.currentTarget.getAttribute('aria-disabled')==='true')return;
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();focusAt.current=e.key==='ArrowUp'?'last':'first';setOpen(true)}
  };
  const triggerNode=React.isValidElement(trigger)
    ?React.cloneElement(trigger,{id:triggerId,'aria-haspopup':'menu','aria-expanded':open,'aria-controls':open?menuId:undefined,
      onKeyDown:e=>{trigger.props.onKeyDown?.(e);onTriggerKey(e)}}):trigger;
  const onMenuKey=e=>{
    if(e.defaultPrevented)return;
    const els=itemEls(),i=els.indexOf(document.activeElement);
    const go=n=>{e.preventDefault();els[(n+els.length)%els.length]?.focus()};
    if(e.key==='Tab'){
      // Сначала находим соседний контрол: пункты меню исключены из Tab-порядка.
      const button=triggerEl(),scope=button?.closest('[role="dialog"]')||document;
      const controls=Array.from(scope.querySelectorAll(FOCUSABLE)).filter(el=>!menuRef.current?.contains(el)&&(el.offsetWidth||el.offsetHeight||el.getClientRects().length));
      const index=controls.indexOf(button),next=controls[index+(e.shiftKey?-1:1)];
      close(false);if(next){e.preventDefault();next.focus()}else if(scope!==document){e.preventDefault();(e.shiftKey?controls[controls.length-1]:controls[0])?.focus()}
      return;
    }
    if(!els.length)return;
    if(e.key==='ArrowDown')go(i+1);
    else if(e.key==='ArrowUp')go(i<0?els.length-1:i-1);
    else if(e.key==='Home')go(0);
    else if(e.key==='End')go(els.length-1);
    else if(e.key.length===1&&e.key!==' '&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
      const now=Date.now(),letter=e.key.toLocaleLowerCase();
      const text=now-search.current.at>700?letter:search.current.text+letter;
      search.current={text,at:now};
      const prefix=Array.from(text).every(char=>char===letter)?letter:text;
      const start=prefix.length===1?i+1:Math.max(i,0);
      const target=Array.from({length:els.length},(_,offset)=>els[(start+offset)%els.length]).find(el=>(el.getAttribute('data-ds-menu-label')||'').toLocaleLowerCase().startsWith(prefix));
      e.preventDefault();target?.focus();
    }
  };
  const hasIcons=items.some(it=>!it.divider&&it.icon);
  return <span ref={ref} style={{position:'relative',display:'inline-flex',maxWidth:'100%'}}>
    <span onClick={e=>{if(e.defaultPrevented||triggerEl()?.disabled||triggerEl()?.getAttribute('aria-disabled')==='true')return;setOpen(!open)}} style={{display:'inline-flex'}}>{triggerNode}</span>
    {open?<div ref={menuRef} id={menuId} role="menu" popover="manual" aria-label={menuLabel||undefined} aria-labelledby={menuLabel?undefined:triggerId}
      onKeyDown={onMenuKey} style={{position:'fixed',inset:'auto',left:position.left,top:position.top,zIndex:60,margin:0,
        width:width=== 'auto'?'max-content':width,minWidth:'min(160px, calc(100vw - 16px))',maxWidth:'calc(100vw - 16px)',maxHeight:position.maxHeight,overflowY:'auto',
        padding:'var(--ds-gap-xs)',background:'var(--ds-surface-raised)',border:'1px solid var(--ds-border)',
        borderRadius:'var(--ds-radius-md)',boxShadow:'var(--ds-shadow-md)',color:'var(--ds-fg)'}}>
      {header?<div style={{padding:'var(--ds-pad-tight) var(--ds-pad-sm)',borderBottom:'1px solid var(--ds-divider)',marginBottom:'var(--ds-gap-xs)'}}>{header}</div>:null}
      {items.map((it,i)=>it.divider?<span key={'d'+i} role="separator" style={{display:'block',height:1,background:'var(--ds-divider)',margin:'var(--ds-gap-xs) 0'}}/>
        :<MenuItem key={it.id||i} it={it} hasIcons={hasIcons} onSelect={()=>{
          if(it.closeOnSelect??it.type!=='checkbox')close(true);
          onSelect&&onSelect(it);it.onClick&&it.onClick();
        }}/>)}
      {footer?<div style={{padding:'var(--ds-pad-tight) var(--ds-pad-sm)',borderTop:'1px solid var(--ds-divider)',marginTop:'var(--ds-gap-xs)'}}>{footer}</div>:null}
    </div>:null}
  </span>;
}
function MenuItem({it,hasIcons,onSelect}){
  const [hover,setHover]=React.useState(false),[focus,setFocus]=React.useState(false);
  const danger=it.tone==='danger',choice=it.type==='radio'||it.type==='checkbox';
  const labelRef=React.useRef(null),buttonRef=React.useRef(null);
  React.useLayoutEffect(()=>{buttonRef.current?.setAttribute('data-ds-menu-label',labelRef.current?.textContent?.trim()||'')},[it.label]);
  return <button ref={buttonRef} type="button" role={choice?'menuitem'+it.type:'menuitem'} aria-checked={choice?!!it.checked:undefined}
    tabIndex={-1} disabled={it.disabled} onClick={it.disabled?undefined:onSelect}
    onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',width:'100%',textAlign:'left',
      minHeight:'var(--ds-control-h)',padding:'0 var(--ds-pad-sm)',border:'none',borderRadius:'var(--ds-radius-sm)',
      background:(hover||focus)&&!it.disabled?(danger?'var(--ds-danger-bg)':'var(--ds-surface-hover)'):'transparent',
      color:it.disabled?'var(--ds-fg-disabled)':danger?'var(--ds-danger-fg)':'var(--ds-fg)',font:'var(--ds-type-ui)',cursor:it.disabled?'not-allowed':'pointer'}}>
    {hasIcons?<span data-ds-menu-icon-slot="" aria-hidden="true" style={{display:'inline-flex',flex:'none',width:'var(--ds-icon)',height:'var(--ds-icon)'}}>
      {it.icon?<Icon name={it.icon} size="var(--ds-icon)" style={{color:it.disabled||danger?undefined:'var(--ds-fg-muted)'}}/>:null}</span>:null}
    <span ref={labelRef} style={{flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.label}</span>
    {it.shortcut?<span style={{flex:'none',font:'var(--ds-type-caption)',fontFamily:'var(--ds-font-mono)',color:it.disabled?'var(--ds-fg-disabled)':'var(--ds-fg-subtle)'}}>{it.shortcut}</span>:null}
    {choice||it.checked?<span aria-hidden="true" style={{display:'inline-flex',flex:'none',width:'var(--ds-icon-sm)',height:'var(--ds-icon-sm)'}}>
      {it.checked?<Icon name="check" size="var(--ds-icon-sm)" style={{color:it.disabled?'var(--ds-fg-disabled)':'var(--ds-brand)'}}/>:null}</span>:null}
  </button>;
}

/** The header user pill plus its menu. */
export function DsUserMenu({name,email,avatarSrc,items=[],onSelect}){
  return <DsMenu align="end" width={260} onSelect={onSelect}
    header={<div style={{display:'flex',flexDirection:'column',gap:2}}>
      <span style={{font:'var(--ds-type-body-strong)',color:'var(--ds-fg)'}}>{name}</span>
      {email?<span style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)'}}>{email}</span>:null}</div>}
    items={items}
    trigger={<button type="button"
      style={{display:'inline-flex',alignItems:'center',gap:'var(--ds-gap-sm)',height:'var(--ds-control-h-sm)',
        padding:avatarSrc?'0 6px 0 2px':'0 4px 0 10px',background:'var(--ds-surface-hover)',
        border:'1px solid var(--ds-border)',borderRadius:'var(--ds-radius-pill)',
        font:'var(--ds-type-ui)',color:'var(--ds-fg-strong)',cursor:'pointer',whiteSpace:'nowrap',
        margin:0,appearance:'none',textAlign:'left'}}>
      {avatarSrc?<img src={avatarSrc} alt="" style={{width:'var(--ds-icon-lg)',height:'var(--ds-icon-lg)',borderRadius:'var(--ds-radius-circle)',objectFit:'cover'}}/>:null}
      {name}<Icon name="expand_more" size="var(--ds-icon-sm)"/>
    </button>}/>;
}
