import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
/* Doctrine A, adopted Sept 2026: filled and tinted tones react with an overlay in
   their own ink; only the two unfilled tones move their ground, because an overlay
   over transparent is invisible and ghost must match the row hover. */
const Ds_OVERLAY=(ink,depth)=>{const c='color-mix(in oklab,'+ink+' '+depth+',transparent)';return 'linear-gradient(0deg,'+c+','+c+')'};
const DsBTN_TONES={
  inverse:{background:'transparent',color:'var(--ds-fg-action-on-inverse)',border:'1px solid transparent',overlay:true},
  primary:{background:'var(--ds-brand)',color:'var(--ds-on-brand)',border:'1px solid transparent',overlay:true},
  accent:{background:'var(--ds-accent)',color:'var(--ds-accent-on)',border:'1px solid transparent',overlay:true},
  danger:{background:'var(--ds-danger-solid)',color:'var(--ds-on-solid)',border:'1px solid transparent',overlay:true},
  secondary:{background:'var(--ds-surface)',color:'var(--ds-fg)',border:'1px solid var(--ds-border-field)',hover:'var(--ds-surface-hover)',active:'var(--ds-surface-active)'},
  subtle:{background:'var(--ds-brand-subtle)',color:'var(--ds-brand-text)',border:'1px solid transparent',overlay:true},
  ghost:{background:'transparent',color:'var(--ds-fg-muted)',border:'1px solid transparent',hover:'var(--ds-surface-hover)',active:'var(--ds-surface-active)'}
};
const DsBTN_H={sm:'var(--ds-control-h-sm)',md:'var(--ds-control-h)',lg:'var(--ds-control-h-lg)'};

/** Hover и временное нажатие кнопки — одно правило для DsButton, DsIconButton, DsFab.
 *  Нажатие видно на время жеста любым способом: мышь, touch, перо (pointer-события),
 *  Space и Enter с клавиатуры. Hover — только от мыши: на touch он «залипает».
 *  Отключённая кнопка не реагирует. Обработчики потребителя из `rest` не теряются:
 *  хук вызывает их после своих. Устойчивое выбранное состояние — не нажатие,
 *  его несёт проп `active` / `aria-pressed`, а не этот хук. */
export function usePress(disabled,rest={}){
  const [hover,setHover]=React.useState(false),[pressed,setPressed]=React.useState(false);
  React.useEffect(()=>{if(disabled){setHover(false);setPressed(false)}},[disabled]);
  const chain=(name,fn)=>e=>{if(!disabled)fn(e);if(rest[name])rest[name](e)};
  const handlers={
    onPointerEnter:chain('onPointerEnter',e=>{if(e.pointerType==='mouse')setHover(true)}),
    onPointerLeave:chain('onPointerLeave',()=>{setHover(false);setPressed(false)}),
    onPointerDown:chain('onPointerDown',e=>{if(e.pointerType!=='mouse'||e.button===0)setPressed(true)}),
    onPointerUp:chain('onPointerUp',()=>setPressed(false)),
    onPointerCancel:chain('onPointerCancel',()=>setPressed(false)),
    onKeyDown:chain('onKeyDown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat)setPressed(true)}),
    onKeyUp:chain('onKeyUp',e=>{if(e.key===' '||e.key==='Enter')setPressed(false)}),
    onBlur:chain('onBlur',()=>setPressed(false)),
  };
  const own={};for(const k of Object.keys(rest))if(!(k in handlers))own[k]=rest[k];
  return {hover:hover&&!disabled,pressed:pressed&&!disabled,handlers,rest:own};
}

/** Button. One component, seven tones, three sizes, all sized from density tokens. */
export function DsButton({tone='primary',size='md',icon,iconRight,loading=false,disabled=false,fullWidth=false,children,onClick,type='button',...rest}){
  const t=DsBTN_TONES[tone]||DsBTN_TONES.primary;
  const off=disabled||loading;
  const {hover:h,pressed:a,handlers,rest:own}=usePress(off,rest);
  const iconSize=size==='sm'?'var(--ds-icon-sm)':'var(--ds-icon)';
  const style={boxSizing:'border-box',position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',
    minWidth:0,maxWidth:'100%',height:DsBTN_H[size],padding:size==='sm'?'0 10px':'0 var(--ds-control-pad-x)',width:fullWidth?'100%':'auto',
    font:size==='lg'?'var(--ds-type-body-strong)':'var(--ds-type-ui)',whiteSpace:'nowrap',
    borderRadius:'var(--ds-radius-md)',border:t.border,background:disabled?'var(--ds-surface-disabled)':(t.overlay?t.background:(a?t.active:h?t.hover:t.background)),
    backgroundImage:!off&&t.overlay&&(a||h)?Ds_OVERLAY(t.color,a?'var(--ds-overlay-press)':'var(--ds-overlay-hover)'):undefined,
    color:disabled?'var(--ds-fg-disabled)':t.color,cursor:disabled?'not-allowed':loading?'progress':'pointer',transition:'var(--ds-transition-control)'};
  if(disabled&&(tone==='secondary'||tone==='ghost')){style.background='transparent';style.border='1px solid var(--ds-border)'}
  function activate(e){
    if(off){e.preventDefault();e.stopPropagation();return}
    if(onClick)onClick(e);
  }
  return <button type={type} {...own} style={{...style,...own.style}} {...handlers}
    disabled={disabled} aria-disabled={loading||own['aria-disabled']} aria-busy={loading||own['aria-busy']} onClick={activate}>
    <span data-ds-button-content="" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'var(--ds-gap-sm)',minWidth:0,maxWidth:'100%',overflow:'hidden',opacity:loading?0:1}}>
      {icon?<Icon name={icon} size={iconSize}/>:null}
      {children!=null?<span data-ds-button-label="" style={{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{children}</span>:null}
      {iconRight?<Icon name={iconRight} size={iconSize}/>:null}
    </span>
    {loading?<span data-ds-button-spinner="" aria-hidden="true" style={{position:'absolute',left:'50%',top:'50%',width:iconSize,height:iconSize,transform:'translate(-50%,-50%)',display:'grid',placeItems:'center'}}>
      <span style={{boxSizing:'border-box',width:iconSize,height:iconSize,borderRadius:'50%',border:'2px solid currentColor',borderTopColor:'transparent',animation:'ds-spin 700ms linear infinite'}}/>
    </span>:null}
  </button>;
}
