import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { dsSlots } from './DsPageLayout.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';
const DsDLG_W={sm:420,md:560,lg:760,xl:960};

/* Слои оверлеев. Escape закрывает только ВЕРХНИЙ слой: меню поверх диалога,
   фильтр поверх страницы. Раньше каждый оверлей слушал Escape на document сам,
   и меню внутри диалога закрывалось вместе с диалогом. Слушатель один, в фазе
   всплытия: если Escape уже обработал сам контрол (preventDefault), слои его не
   трогают. Верхний слой без обработчика (диалог с dismissable=false) Escape
   поглощает — нижние слои его не получают. */
const dsLayers=[];
function dsLayerKey(e){
  if(e.key!=='Escape'||e.defaultPrevented||!dsLayers.length)return;
  const top=dsLayers[dsLayers.length-1];
  e.preventDefault();
  if(top.current)top.current(e);
}
export function useDsLayer(active,onEscape){
  const ref=React.useRef(onEscape);ref.current=onEscape;
  React.useEffect(()=>{if(!active)return;
    if(!dsLayers.length)document.addEventListener('keydown',dsLayerKey);
    dsLayers.push(ref);
    return()=>{const i=dsLayers.lastIndexOf(ref);if(i>=0)dsLayers.splice(i,1);
      if(!dsLayers.length)document.removeEventListener('keydown',dsLayerKey)};},[active]);
}

/** Modal dialog. Scrim + centred sheet, right-aligned actions. */
const DsDLG_FOCUSABLE='button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
export function DsDialog({open=true,title,description,children,actions,onClose,size='md',tone,scroll=true,dismissable=true,'aria-label':ariaLabel}){
  const S=useDsStrings();
  const [s,body]=dsSlots(children,['actions'],{actions});
  /* Whitespace text nodes from static markup must not open an empty body band. */
  const hasBody=body.some(c=>typeof c==='string'?c.trim():c!=null&&c!==false);
  const sheet=React.useRef(null);
  useDsLayer(open,dismissable&&onClose?()=>onClose():null);
  /* Имя диалога — его видимый заголовок, строкой или JSX, через aria-labelledby.
     Без заголовка имя обязано прийти в aria-label. */
  const uid=React.useId(),titleId=uid+'-title',descId=uid+'-desc';
  const hasTitle=title!=null&&title!==false&&title!=='';
  if(!hasTitle&&!ariaLabel&&open&&typeof console!=='undefined')
    console.error('DsDialog: без title нужен aria-label — иначе у диалога нет доступного имени.');
  /* aria-modal is a promise to the screen reader that nothing outside is reachable —
     so the dialog takes focus, keeps Tab inside itself, and hands focus back. */
  React.useEffect(()=>{if(!open)return;
    const node=sheet.current,prev=document.activeElement;
    if(!node)return;
    const list=()=>Array.from(node.querySelectorAll(DsDLG_FOCUSABLE)).filter(el=>el.offsetWidth||el.offsetHeight||el.getClientRects().length);
    (list()[0]||node).focus();
    const trap=e=>{
      if(e.key!=='Tab')return;
      const f=list();
      if(!f.length){e.preventDefault();node.focus();return}
      const first=f[0],last=f[f.length-1];
      if(!node.contains(document.activeElement)){e.preventDefault();first.focus()}
      else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    };
    document.addEventListener('keydown',trap,true);
    return()=>{document.removeEventListener('keydown',trap,true);if(prev&&prev.focus)prev.focus()};},[open]);
  if(!open)return null;
  return <div style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',
    padding:'var(--ds-pad-xl)',background:'var(--ds-n-a60)'}}
    onClick={dismissable&&onClose?e=>{if(e.target===e.currentTarget)onClose()}:undefined}>
    <div ref={sheet} tabIndex={-1} role="dialog" aria-modal="true"
      aria-labelledby={hasTitle?titleId:undefined} aria-label={hasTitle?undefined:ariaLabel}
      aria-describedby={description?descId:undefined}
      style={{display:'flex',flexDirection:'column',minHeight:0,width:'100%',maxWidth:DsDLG_W[size],maxHeight:'min(90vh,760px)',
        background:'var(--ds-surface)',border:'1px solid var(--ds-border)',borderRadius:'var(--ds-radius-xl)',
        boxShadow:'var(--ds-shadow-lg)',overflow:'hidden'}}>
      <header style={{flex:'none',display:'flex',alignItems:'flex-start',gap:'var(--ds-gap-sm-plus)',
        padding:'var(--ds-pad-md) var(--ds-pad-lg)',borderBottom:'1px solid var(--ds-border)'}}>
        {tone?<span style={{flex:'none',display:'inline-flex',alignItems:'center',justifyContent:'center',
          width:32,height:32,borderRadius:'var(--ds-radius-md)',background:'var(--ds-'+tone+'-bg)',color:'var(--ds-'+tone+'-solid)'}}>
          <Icon name={tone==='danger'?'error':tone==='warning'?'warning':'info'} size="var(--ds-icon)"/></span>:null}
        <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:3}}>
          <h2 id={titleId} style={{margin:0,font:'var(--ds-type-title)',color:'var(--ds-fg-strong)',letterSpacing:'var(--ds-tracking-tight)'}}>{title}</h2>
          {description?<p id={descId} style={{margin:0,font:'var(--ds-type-body)',color:'var(--ds-fg-muted)',textWrap:'pretty'}}>{description}</p>:null}
        </div>
        {onClose?<button type="button" aria-label={S.close} onClick={onClose} style={{flex:'none',display:'flex',
          alignItems:'center',justifyContent:'center',width:28,height:28,padding:0,border:'none',background:'transparent',
          color:'var(--ds-fg-muted)',cursor:'pointer',borderRadius:'var(--ds-radius-xs)'}}><Icon name="close" size="var(--ds-icon)"/></button>:null}
      </header>
      {hasBody?<div style={{flex:1,minHeight:0,padding:'var(--ds-pad-lg)',
        overflowY:scroll?'auto':'visible',overflowX:scroll?'hidden':'visible'}}>{body}</div>:null}
      {s.actions?<footer style={{flex:'none',display:'flex',alignItems:'center',justifyContent:'flex-end',
        gap:'var(--ds-gap-sm)',padding:'var(--ds-pad-sm) var(--ds-pad-lg)',borderTop:'1px solid var(--ds-border)',
        background:'var(--ds-bg)'}}>{s.actions}</footer>:null}
    </div></div>;
}
