import React from 'react';
import { createPortal } from 'react-dom';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { usePress } from './DsButton.jsx';
const Ds_OVERLAY=(ink,depth)=>{const c='color-mix(in oklab,'+ink+' '+depth+',transparent)';return 'linear-gradient(0deg,'+c+','+c+')'};
const DsIB_SIZE={sm:'var(--ds-control-h-sm)',md:'var(--ds-control-h)',lg:'var(--ds-control-h-lg)'};

/** Square icon-only button with an accessible name and system tooltip. */
export function DsIconButton({icon,label,tone='ghost',size='md',active,loading=false,disabled=false,dot=false,rotate,onClick,type='button',...rest}){
  const off=disabled||loading;
  const buttonRef=React.useRef(null),tipRef=React.useRef(null);
  const [tip,setTip]=React.useState(null);
  const tipId=React.useId();
  const hideTip=()=>setTip(null);
  function showTip(){
    if(off||!label)return;
    const r=buttonRef.current.getBoundingClientRect();
    setTip({left:r.left,top:r.bottom+4,above:r.top-4});
  }
  const {hover:h,pressed:p,handlers,rest:own}=usePress(off,rest);
  React.useEffect(()=>{hideTip();},[off,label]);
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
  const iconSize=size==='sm'?'var(--ds-icon-sm)':'var(--ds-icon)';
  let bg='transparent',fg='var(--ds-fg-muted)',bd='1px solid transparent';
  if(tone==='secondary'){bg='var(--ds-surface)';bd='1px solid var(--ds-border-field)';fg='var(--ds-fg)'}
  if(tone==='primary'){bg='var(--ds-brand)';fg='var(--ds-on-brand)'}
  if(tone==='danger'){fg='var(--ds-danger-solid)'}
  if(tone==='inverse'){fg='var(--ds-fg-on-inverse)'}
  if(tone==='onHeader'){fg='var(--ds-header-icon-fg)'}
  if(active){bg='var(--ds-brand-subtle)';fg='var(--ds-brand-text)'}
  /* a filled or tinted icon button answers with an overlay in its own ink; the
     unfilled tones still move their ground. */
  let ov;
  const depth=p?'var(--ds-overlay-press)':'var(--ds-overlay-hover)';
  if((h||p)&&!off&&(tone==='primary'||tone==='inverse'||active))ov=Ds_OVERLAY(fg,depth);
  else if((h||p)&&!off&&tone==='onHeader'){bg='var(--ds-header-hover)';if(p)ov=Ds_OVERLAY(fg,depth)}
  else if((h||p)&&!off)bg=p?'var(--ds-surface-active)':'var(--ds-surface-hover)';
  if(disabled){fg='var(--ds-fg-disabled)';bg='transparent'}
  /* `active` — устойчивое выбранное состояние (кнопка-переключатель), не нажатие:
     задан — кнопка объявляет aria-pressed; не задан — это обычная кнопка. */
  function activate(e){
    if(off){e.preventDefault();e.stopPropagation();return;}
    hideTip();onClick?.(e);
  }
  return <><button {...own} {...handlers} ref={buttonRef} type={type} aria-label={undefined} title={undefined}
    onFocus={e=>{showTip();own.onFocus?.(e);}} onBlur={e=>{hideTip();handlers.onBlur(e);}}
    onPointerEnter={e=>{handlers.onPointerEnter(e);if(e.pointerType==='mouse')showTip();}}
    onPointerLeave={e=>{handlers.onPointerLeave(e);if(!e.relatedTarget?.nodeType||!tipRef.current?.contains(e.relatedTarget))hideTip();}}
    aria-describedby={[own['aria-describedby'],tip?tipId:undefined].filter(Boolean).join(' ')||undefined}
    disabled={disabled} aria-disabled={loading||own['aria-disabled']} aria-busy={loading||own['aria-busy']} onClick={activate}
    aria-pressed={active==null?undefined:!!active}
    style={{boxSizing:'border-box',display:'inline-flex',alignItems:'center',justifyContent:'center',flex:'none',
      width:DsIB_SIZE[size],height:DsIB_SIZE[size],padding:0,borderRadius:'var(--ds-radius-icon-button)',border:bd,background:bg,backgroundImage:ov,color:fg,
      position:'relative',cursor:disabled?'not-allowed':loading?'progress':'pointer',transition:'var(--ds-transition-control)',...own.style}}>
    <span data-ds-icon-button-label="" style={{position:'absolute',width:1,height:1,padding:0,margin:-1,overflow:'hidden',clip:'rect(0, 0, 0, 0)',clipPath:'inset(50%)',whiteSpace:'nowrap',border:0}}>{label}</span>
    <span data-ds-icon-button-content="" style={{display:'inline-flex',opacity:loading?0:1}}><Icon name={icon} size={iconSize} rotate={rotate}/></span>
    {loading?<span data-ds-icon-button-spinner="" aria-hidden="true" style={{position:'absolute',left:'50%',top:'50%',width:iconSize,height:iconSize,transform:'translate(-50%,-50%)',display:'grid',placeItems:'center'}}>
      <span style={{boxSizing:'border-box',width:iconSize,height:iconSize,borderRadius:'50%',border:'2px solid currentColor',borderTopColor:'transparent',animation:'ds-spin 700ms linear infinite'}}/>
    </span>:null}
    {dot&&!off?<span aria-hidden="true" style={{position:'absolute',top:5,right:5,width:7,height:7,borderRadius:'50%',
      background:'var(--ds-accent-mark)',border:'1px solid '+(bg==='transparent'?'var(--ds-surface)':bg)}}/>:null}
  </button>
  {tip?createPortal(<span ref={tipRef} id={tipId} role="tooltip"
    onPointerLeave={e=>{if(!e.relatedTarget?.nodeType||!buttonRef.current?.contains(e.relatedTarget))hideTip();}}
    style={{position:'fixed',left:tip.left,top:tip.top,zIndex:1000,maxWidth:'min(320px, calc(100vw - 8px))',
      padding:'var(--ds-pad-tight) var(--ds-pad-sm)',borderRadius:'var(--ds-radius-sm)',background:'var(--ds-surface-inverse)',color:'var(--ds-fg-on-inverse)',
      font:'var(--ds-type-caption)',overflowWrap:'anywhere',boxShadow:'var(--ds-shadow-sm)'}}>{label}</span>,document.body):null}
  </>;
}
