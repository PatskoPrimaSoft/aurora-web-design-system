import React from 'react';
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

/** Retain keyed children during exit, then collapse the space between neighbours. */
export function DsToastStack({children,position='bottom-center'}){
  const current=React.Children.toArray(children);
  const [items,setItems]=React.useState(()=>current.map(child=>({key:child.key,child})));
  React.useLayoutEffect(()=>{
    setItems(previous=>{
      const next=current.map(child=>({key:child.key,child}));
      for(const old of previous)if(!next.some(item=>item.key===old.key))next.splice(Math.min(previous.indexOf(old),next.length),0,{...old,exiting:old.exiting||Date.now()});
      return next;
    });
  },[children]);
  React.useEffect(()=>{
    const leaving=items.filter(item=>item.exiting);
    if(!leaving.length)return;
    const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:200;
    const timer=setTimeout(()=>setItems(previous=>previous.filter(item=>!item.exiting||Date.now()-item.exiting<duration)),Math.max(0,Math.min(...leaving.map(item=>duration-(Date.now()-item.exiting)))));
    return()=>clearTimeout(timer);
  },[items]);
  return <div data-ds-toast-stack="" data-position={position}>
    {items.map(item=><div key={item.key} data-ds-toast-item="" data-exiting={item.exiting?'true':undefined}
      aria-hidden={item.exiting?true:undefined} inert={item.exiting?'':undefined}>
      <div data-ds-toast-clip=""><DsToastExiting.Provider value={!!item.exiting}>{item.child}</DsToastExiting.Provider></div>
    </div>)}
  </div>;
}
