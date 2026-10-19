import React from 'react';
import {useDsLayer} from '../layout/DsDialog.jsx';
import {anchoredStyle,useAnchoredLayer} from './anchoredLayer.js';

/** Text-only, supplementary information for an interactive trigger. */
export function DsTooltip({content,children,placement='bottom',disabled=false}){
  const anchor=React.useRef(null),panel=React.useRef(null),timer=React.useRef(null);
  const focused=React.useRef(false),hovered=React.useRef(false);
  const [shown,setShown]=React.useState(false),id=React.useId();
  const usable=!disabled&&typeof content==='string'&&content.trim().length>0;
  const open=usable&&shown;
  const cancel=()=>{clearTimeout(timer.current);timer.current=null};
  const dismiss=()=>{cancel();hovered.current=false;setShown(false)};
  const show=event=>{
    anchor.current=event.currentTarget;cancel();
    if(usable&&!event.currentTarget.disabled&&event.currentTarget.getAttribute('aria-disabled')!=='true')setShown(true);
  };
  const leave=()=>{cancel();timer.current=setTimeout(()=>{if(!focused.current&&!hovered.current)setShown(false)},120)};
  useDsLayer(open,dismiss);
  const position=useAnchoredLayer(open,anchor,panel,placement,'start',320);
  React.useEffect(()=>{dismiss()},[disabled,content]);
  React.useEffect(()=>()=>clearTimeout(timer.current),[]);
  if(!React.isValidElement(children))return null;
  const props=children.props;
  const trigger=React.cloneElement(children,{
    'aria-describedby':[props['aria-describedby'],open?id:undefined].filter(Boolean).join(' ')||undefined,
    onFocus:event=>{props.onFocus?.(event);focused.current=true;if(!event.defaultPrevented)show(event)},
    onBlur:event=>{props.onBlur?.(event);focused.current=false;if(!hovered.current)dismiss()},
    onKeyDown:event=>{
      if(open&&event.key==='Escape'){
        event.preventDefault();event.stopPropagation();dismiss();
      }
      props.onKeyDown?.(event);
    },
    onPointerEnter:event=>{props.onPointerEnter?.(event);if(event.pointerType==='mouse'){hovered.current=true;if(!event.defaultPrevented)show(event)}},
    onPointerLeave:event=>{props.onPointerLeave?.(event);hovered.current=false;leave()},
    onClick:event=>{dismiss();props.onClick?.(event)},
  });
  return <>{trigger}{open?<span ref={panel} id={id} role="tooltip" popover="manual"
    onPointerEnter={()=>{hovered.current=true;cancel()}} onPointerLeave={()=>{hovered.current=false;leave()}}
    style={{...anchoredStyle,...position,width:'max-content',maxWidth:'min(320px, calc(100vw - 16px))',overflowY:'auto',
      padding:'var(--ds-pad-tight) var(--ds-pad-sm)',border:0,borderRadius:'var(--ds-radius-sm)',
      background:'var(--ds-surface-inverse)',color:'var(--ds-fg-on-inverse)',font:'var(--ds-type-caption)',boxShadow:'var(--ds-shadow-sm)'}}>{content}</span>:null}</>;
}
