import React from 'react';
import { createPortal } from 'react-dom';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { DsButton } from '../buttons/DsButton.jsx';
import { DsIconButton } from '../buttons/DsIconButton.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';
const DsToastExiting=React.createContext(false);
const DsTOAST_ICON={neutral:'info',info:'info',success:'check_circle',warning:'warning',danger:'error'};

/** Transient message. Timing is opt-in; critical messages remain until dismissed. */
export function DsToast({tone='neutral',children,action,actionLabel,onClose,icon,announcement='polite',autoDismiss=0,closeLabel}){
  const exiting=React.useContext(DsToastExiting);
  const interaction=React.useRef({hover:false,focus:false});
  const S=useDsStrings(),closeRef=React.useRef(onClose),timerControl=React.useRef(null);
  closeRef.current=onClose;
  const canClose=!!onClose;
  React.useEffect(()=>{
    if(exiting||!canClose||!Number.isFinite(autoDismiss)||autoDismiss<=0||tone==='warning'||tone==='danger')return;
    let remaining=Math.max(8000,autoDismiss),started,timer,finished=false;
    const paused=interaction.current;
    const start=()=>{if(finished||Object.values(paused).some(Boolean))return;started=Date.now();timer=setTimeout(()=>{finished=true;closeRef.current?.();},remaining);};
    const pause=kind=>{if(!Object.values(paused).some(Boolean)&&!finished){clearTimeout(timer);remaining=Math.max(0,remaining-(Date.now()-started));}paused[kind]=true;};
    const resume=kind=>{if(!paused[kind])return;paused[kind]=false;start();};
    timerControl.current={pause,resume};start();
    return()=>{clearTimeout(timer);timerControl.current=null;};
  },[autoDismiss,tone,canClose,exiting]);
  const pause=kind=>{timerControl.current?.pause(kind);interaction.current[kind]=true;};
  const resume=kind=>{if(timerControl.current)timerControl.current.resume(kind);else interaction.current[kind]=false;};
  const role=announcement==='assertive'?'alert':announcement==='polite'?'status':undefined;
  const accent=tone==='neutral'?'var(--ds-fg-on-inverse)':'var(--ds-'+tone+'-fg-on-inverse)';
  return <div data-ds-toast="" role={role} aria-atomic={role?true:undefined}
    onPointerEnter={e=>{if(e.pointerType==='mouse')pause('hover');}}
    onPointerLeave={()=>resume('hover')}
    onFocusCapture={()=>pause('focus')}
    onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))resume('focus');}}
    style={{boxSizing:'border-box',minWidth:0,width:'100%',minHeight:'var(--ds-control-h-lg)',maxWidth:520,
      padding:'var(--ds-pad-tight) var(--ds-pad-sm) var(--ds-pad-tight) var(--ds-pad-md)',
      background:'var(--ds-surface-inverse)',color:'var(--ds-fg-on-inverse)',borderRadius:'var(--ds-radius-md)',boxShadow:'var(--ds-shadow-lg)'}}>
    {tone!=='neutral'||icon?<span data-ds-toast-icon=""><Icon name={icon||DsTOAST_ICON[tone]} size="var(--ds-icon)" style={{color:accent}}/></span>:null}
    <span data-ds-toast-body="">{children}</span>
    {action?<span data-ds-toast-action=""><DsButton tone="inverse" size="sm" onClick={action} style={{whiteSpace:'normal',height:'auto',minHeight:'var(--ds-control-h-sm)',padding:'4px 8px',textDecoration:'underline',textUnderlineOffset:2}}><span style={{whiteSpace:'normal',overflowWrap:'anywhere'}}>{actionLabel||S.undo}</span></DsButton></span>:null}
    {onClose?<span data-ds-toast-close=""><DsIconButton icon="close" label={closeLabel||S.close} tone="inverse" size="md" onClick={onClose}/></span>:null}
  </div>;
}

const DsTOAST_FOCUSABLE='button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Only admitted children mount: queued notifications neither announce nor run timers. */
export function DsToastStack({children,position='bottom-center',label,maxVisible=3,order='oldest-first',portal=false,container,returnFocusRef}){
  const S=useDsStrings(),uid=React.useId(),root=React.useRef(null),focused=React.useRef(null),origin=React.useRef(null);
  const current=React.useMemo(()=>React.Children.toArray(children).filter(React.isValidElement),[children]);
  const limit=Number.isFinite(maxVisible)&&maxVisible>=1?Math.floor(maxVisible):3;
  const [items,setItems]=React.useState(()=>current.slice(0,limit).map(child=>({key:child.key,child})));
  React.useLayoutEffect(()=>{
    setItems(previous=>{
      const eligible=current.slice(0,limit);
      const next=previous.map(old=>{
        const child=eligible.find(child=>child.key===old.key);
        return child?{key:old.key,child}:{...old,exiting:old.exiting||Date.now()};
      });
      // Exiting entries reserve their slots until their animations finish.
      for(const child of eligible){if(next.length>=limit)break;if(!next.some(item=>item.key===child.key))next.push({key:child.key,child});}
      return next.length===previous.length&&next.every((item,i)=>item.key===previous[i].key&&item.child===previous[i].child&&item.exiting===previous[i].exiting)?previous:next;
    });
  },[current,limit,items]);
  React.useEffect(()=>{
    const leaving=items.filter(item=>item.exiting);
    if(!leaving.length)return;
    const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:200;
    const timer=setTimeout(()=>setItems(previous=>previous.filter(item=>!item.exiting||Date.now()-item.exiting<duration)),Math.max(0,Math.min(...leaving.map(item=>duration-(Date.now()-item.exiting)))));
    return()=>clearTimeout(timer);
  },[items]);
  const displayed=order==='newest-first'?[...items].reverse():items;
  React.useLayoutEffect(()=>{
    const node=root.current;
    if(!node)return;
    const doc=node.ownerDocument;
    if(!items.length&&!current.length){origin.current=null;focused.current=null;return;}
    if(!origin.current&&items.length)origin.current=doc.activeElement;
    const last=focused.current;
    if(!last)return;
    if(items.some(item=>item.key===last.key&&!item.exiting)){last.index=displayed.findIndex(item=>item.key===last.key);return;}
    const active=doc.activeElement;
    if(active!==last.node&&active!==doc.body&&!active?.closest('[data-ds-toast-item][data-exiting="true"]')){focused.current=null;return;}
    const neighbours=Array.from(node.querySelectorAll('[data-ds-toast-item]:not([data-exiting="true"])'));
    const neighbour=neighbours[Math.min(last.index,neighbours.length-1)];
    if(neighbour){
      const target=Array.from(neighbour.querySelectorAll(DsTOAST_FOCUSABLE)).find(el=>el.getClientRects().length&&!el.closest('[inert]'))||neighbour;
      target.focus({preventScroll:true});
    }else if(!current.length){
      focused.current=null;
      const target=returnFocusRef?.current||origin.current;
      if(target?.isConnected&&!target.closest('[inert]'))target.focus({preventScroll:true});
      origin.current=null;
    }
  },[items,current,order,returnFocusRef]);
  // Keep the empty root through exit/focus restoration; expose no empty landmark.
  const content=<div ref={root} data-ds-toast-stack="" data-position={position}
    role={items.length?'region':undefined} aria-labelledby={items.length?uid:undefined}
    onBlurCapture={e=>{if(e.relatedTarget&&!e.currentTarget.contains(e.relatedTarget)&&!e.target.closest('[data-ds-toast-item][data-exiting="true"]'))focused.current=null;}}>
    {items.length?<h2 id={uid} data-ds-toast-label="">{label||S.toast.label}</h2>:null}
    {displayed.map((item,index)=><div key={item.key} data-ds-toast-item="" data-exiting={item.exiting?'true':undefined}
      tabIndex={-1} aria-hidden={item.exiting?true:undefined} inert={item.exiting?'':undefined}
      onFocusCapture={e=>{focused.current={key:item.key,node:e.target,index};}}>
      <div data-ds-toast-clip=""><DsToastExiting.Provider value={!!item.exiting}>{item.child}</DsToastExiting.Provider></div>
    </div>)}
  </div>;
  const target=container||(portal&&typeof document!=='undefined'?document.body:null);
  return target?createPortal(content,target):content;
}
