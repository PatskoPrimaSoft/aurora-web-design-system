import React from 'react';
import { createPortal } from 'react-dom';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { usePress } from './DsButton.jsx';

const Ds_OVERLAY=(ink,depth)=>{const c='color-mix(in oklab,'+ink+' '+depth+',transparent)';return 'linear-gradient(0deg,'+c+','+c+')'};

/** Плавающая кнопка действия; размещение задаёт родитель. */
export function DsFab({icon='add',label,extended=false,tone='primary',size='md',loading=false,disabled=false,onClick,type='button',...rest}){
  const off=disabled||loading;
  const buttonRef=React.useRef(null),labelRef=React.useRef(null),tipRef=React.useRef(null);
  const [tip,setTip]=React.useState(null);
  const tipId=React.useId();
  const hideTip=()=>setTip(null);
  function showTip(){
    if(off||!label)return;
    const text=labelRef.current;
    if(extended&&text&&text.scrollWidth<=text.clientWidth){hideTip();return;}
    const r=buttonRef.current.getBoundingClientRect();
    setTip({left:r.left,top:r.bottom+4,above:r.top-4});
  }
  const {hover:h,pressed:p,handlers,rest:own}=usePress(off,rest);
  React.useEffect(()=>{hideTip();},[off,label,extended]);
  React.useLayoutEffect(()=>{
    if(!tip||!tipRef.current)return;
    const el=tipRef.current,r=el.getBoundingClientRect();
    el.style.left=Math.max(4,Math.min(tip.left,window.innerWidth-r.width-4))+'px';
    el.style.top=(tip.top+r.height<=window.innerHeight-4?tip.top:Math.max(4,tip.above-r.height))+'px';
  },[tip]);
  React.useEffect(()=>{
    if(!tip)return;
    const dismiss=e=>{if(e.key==='Escape'){e.preventDefault();hideTip();}};
    document.addEventListener('keydown',dismiss,true);
    window.addEventListener('scroll',showTip,true);window.addEventListener('resize',showTip);
    return ()=>{
      document.removeEventListener('keydown',dismiss,true);
      window.removeEventListener('scroll',showTip,true);window.removeEventListener('resize',showTip);
    };
  },[tip]);
  const d=size==='sm'?40:size==='lg'?56:48,iconSize=size==='sm'?18:24;
  const bg=tone==='accent'?'var(--ds-accent)':tone==='surface'?'var(--ds-surface)':'var(--ds-brand)';
  const fg=tone==='accent'?'var(--ds-accent-on)':tone==='surface'?'var(--ds-fg)':'var(--ds-on-brand)';
  const ov=(h||p)&&!off?(tone==='surface'?undefined:Ds_OVERLAY(fg,p?'var(--ds-overlay-press)':'var(--ds-overlay-hover)')):undefined;
  function activate(e){
    if(off){e.preventDefault();e.stopPropagation();return;}
    hideTip();onClick?.(e);
  }
  return <>
    <button {...own} {...handlers} onFocus={e=>{showTip();own.onFocus?.(e);}} onBlur={e=>{hideTip();handlers.onBlur(e);}}
      onPointerEnter={e=>{handlers.onPointerEnter(e);if(e.pointerType==='mouse')showTip();}}
      onPointerLeave={e=>{handlers.onPointerLeave(e);if(!tipRef.current?.contains(e.relatedTarget))hideTip();}} ref={buttonRef} type={type} aria-label={label} title={undefined}
      aria-describedby={[own['aria-describedby'],tip?tipId:undefined].filter(Boolean).join(' ')||undefined}
      disabled={disabled} aria-disabled={loading||own['aria-disabled']} aria-busy={loading||own['aria-busy']} onClick={activate}
      style={{boxSizing:'border-box',position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',flex:'none',
        minWidth:extended?0:d,maxWidth:extended?'100%':undefined,height:d,width:extended?'auto':d,padding:extended?'0 '+(d/3)+'px':0,
        borderRadius:extended?'var(--ds-radius-pill)':'var(--ds-radius-circle)',
        border:tone==='surface'?'1px solid var(--ds-border)':'none',
        background:disabled?'var(--ds-surface-disabled)':(tone==='surface'&&(h||p)?(p?'var(--ds-surface-active)':'var(--ds-surface-hover)'):bg),backgroundImage:ov,
        color:disabled?'var(--ds-fg-disabled)':fg,font:'var(--ds-type-body-strong)',cursor:disabled?'not-allowed':loading?'progress':'pointer',
        boxShadow:disabled?'none':h?'var(--ds-shadow-lg)':'var(--ds-shadow-md)',transition:'var(--ds-transition-control)',...own.style}}>
      <span data-ds-fab-content="" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'var(--ds-gap-sm)',minWidth:0,maxWidth:'100%',overflow:'hidden',opacity:loading?0:1}}>
        <Icon name={icon} size={iconSize}/>
        {extended?<span ref={labelRef} data-ds-fab-label="" style={{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{label}</span>:null}
      </span>
      {loading?<span data-ds-fab-spinner="" aria-hidden="true" style={{position:'absolute',left:'50%',top:'50%',width:iconSize,height:iconSize,transform:'translate(-50%,-50%)',display:'grid',placeItems:'center'}}>
        <span style={{boxSizing:'border-box',width:iconSize,height:iconSize,borderRadius:'50%',border:'2px solid currentColor',borderTopColor:'transparent',animation:'ds-spin 700ms linear infinite'}}/>
      </span>:null}
    </button>
    {tip?createPortal(<span ref={tipRef} id={tipId} role="tooltip"
      onPointerLeave={e=>{if(!buttonRef.current?.contains(e.relatedTarget))hideTip();}}
      style={{position:'fixed',left:tip.left,top:tip.top,zIndex:1000,maxWidth:'min(320px, calc(100vw - 8px))',
        padding:'var(--ds-pad-tight) var(--ds-pad-sm)',borderRadius:'var(--ds-radius-sm)',background:'var(--ds-surface-inverse)',color:'var(--ds-fg-on-inverse)',
        font:'var(--ds-type-caption)',overflowWrap:'anywhere',boxShadow:'var(--ds-shadow-sm)'}}>{label}</span>,document.body):null}
  </>;
}
