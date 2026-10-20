import React from 'react';
import {useDsLayer} from '../layout/DsDialog.jsx';
import {anchoredStyle,focusableIn,useAnchoredLayer} from './anchoredLayer.js';

/** Anchored, nonmodal dialog for small interactive tasks. */
export function DsPopover({trigger,children,label,open:openProp,defaultOpen=false,onOpenChange,placement='bottom',align='start',width=320}){
  const [openState,setOpenState]=React.useState(defaultOpen);
  const [layerReady,setLayerReady]=React.useState(false);
  const open=openProp??openState;
  const host=React.useRef(null),anchor=React.useRef(null),panel=React.useRef(null),restore=React.useRef(true);
  const id=React.useId();
  const change=next=>{if(openProp==null)setOpenState(next);onOpenChange?.(next)};
  const close=(returnFocus=true)=>{restore.current=returnFocus;change(false)};
  const latestClose=React.useRef(close);latestClose.current=close;
  useDsLayer(open&&layerReady,()=>close(true));
  // Find the rendered trigger instead of replacing consumer refs or requiring forwardRef.
  React.useLayoutEffect(()=>{anchor.current=host.current?.querySelector('[data-ds-popover-trigger]')||null});
  const position=useAnchoredLayer(open,anchor,panel,placement,align,width);
  React.useEffect(()=>{
    if(!open||layerReady)return;
    let cancelled=false;
    // Wait for an initially open parent dialog to register its layer first.
    queueMicrotask(()=>{if(!cancelled)setLayerReady(true)});
    return()=>{cancelled=true};
  },[open,layerReady]);
  React.useEffect(()=>{
    if(!open||!layerReady||!panel.current)return;
    const node=panel.current;
    // useDsLayer has registered this panel before focus can open a child tooltip.
    (focusableIn(node)[0]||node).focus();
    const away=event=>{if(!host.current?.contains(event.target))latestClose.current(false)};
    const focusAway=event=>{if(!host.current?.contains(event.target))latestClose.current(false)};
    document.addEventListener('pointerdown',away);document.addEventListener('focusin',focusAway);
    return()=>{
      document.removeEventListener('pointerdown',away);document.removeEventListener('focusin',focusAway);
      if(restore.current&&anchor.current?.isConnected)anchor.current.focus();
      restore.current=true;
    };
  },[open,layerReady]);
  const triggerProps={
    'data-ds-popover-trigger':id,'aria-haspopup':'dialog','aria-expanded':open,'aria-controls':open?id:undefined,
    onClick:event=>{if(event.defaultPrevented||event.currentTarget.disabled||event.currentTarget.getAttribute('aria-disabled')==='true')return;restore.current=true;change(!open)},
  };
  const triggerNode=typeof trigger==='function'?trigger(triggerProps):React.isValidElement(trigger)?React.cloneElement(trigger,{
    ...triggerProps,onClick:event=>{trigger.props.onClick?.(event);triggerProps.onClick(event)},
  }):null;
  const onKeyDown=event=>{
    if(event.key!=='Tab'||event.defaultPrevented)return;
    const node=panel.current,controls=focusableIn(node),active=document.activeElement;
    const atStart=active===node||active===controls[0],atEnd=active===node||active===controls[controls.length-1];
    if(event.shiftKey&&atStart){event.preventDefault();close(false);anchor.current?.focus()}
    else if(!event.shiftKey&&atEnd){
      const scope=anchor.current?.closest('[role="dialog"]')||document;
      const outside=focusableIn(scope).filter(el=>!node.contains(el));
      const index=outside.indexOf(anchor.current),next=outside[index+1]||(scope!==document?outside[0]:null);
      close(false);
      if(next){event.preventDefault();next.focus()}
      else anchor.current?.focus();
    }
  };
  return <span ref={host} style={{display:'inline-flex',maxWidth:'100%',minWidth:0}}>
    {triggerNode}
    {open?<div ref={panel} id={id} role="dialog" aria-label={label} tabIndex={-1} popover="manual" onKeyDown={onKeyDown}
      style={{...anchoredStyle,...position,width:width==='auto'?'max-content':width,overflowY:'auto',
        padding:'var(--ds-pad-md)',border:'1px solid var(--ds-border)',borderRadius:'var(--ds-radius-md)',
        background:'var(--ds-surface-raised)',color:'var(--ds-fg)',font:'var(--ds-type-body)',boxShadow:'var(--ds-shadow-md)'}}>
      {typeof children==='function'?children({close:()=>close(true)}):children}
    </div>:null}
  </span>;
}
