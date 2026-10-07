import React from 'react';
import { DsIcon as Icon } from './DsIcon.jsx';
import { useDsStrings } from './DsStrings.jsx';
const Ds_OVERLAY=(ink,depth)=>{const c='color-mix(in oklab,'+ink+' '+depth+',transparent)';return 'linear-gradient(0deg,'+c+','+c+')'};

/** The drawn selection box — the single source of the checked / indeterminate / unchecked look.
 *  Decorative by itself: whatever wraps it owns the semantics. */
export function DsCheck({state='unchecked',radio=false,disabled=false,hover=false,size=18,style}){
  const on=state==='checked'||(!radio&&state==='indeterminate');
  // Match the outer diameter's parity so centering adds no half-pixel inset.
  const dot=size-2*Math.round(size*0.3);
  return <span aria-hidden="true" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',flex:'none',boxSizing:'border-box',
    width:size,height:size,borderRadius:radio?'50%':'var(--ds-radius-xs)',
    border:'var(--ds-border-width-control) solid '+(disabled?'var(--ds-border-control-disabled)':on?'var(--ds-brand)':hover?'var(--ds-border-control-hover)':'var(--ds-border-control)'),
    background:disabled?'var(--ds-surface-disabled)':on?'var(--ds-brand)':'var(--ds-surface)',
    backgroundImage:on&&hover&&!disabled?Ds_OVERLAY('var(--ds-on-brand)','var(--ds-overlay-hover)'):undefined,
    color:disabled?'var(--ds-fg-control-disabled)':'var(--ds-on-brand)',transition:'var(--ds-transition-control)',...style}}>
    {radio?(on?<span style={{width:dot,height:dot,borderRadius:'50%',background:'currentColor'}}/>:null)
      :on?<Icon name={state==='indeterminate'?'remove':'check'} size={Math.round(size*0.78)} style={{fontVariationSettings:"'wght' 600"}}/>:null}
  </span>;
}

/** The same box with its own hit area. A real button, so Enter / Space and the
 *  focus ring come from the platform instead of from a hand-written key handler. */
export function DsCheckButton({state='unchecked',label,disabled=false,onChange,hit='var(--ds-control-h)',size=18}){
  const S=useDsStrings();
  const [h,setH]=React.useState(false);
  return <button type="button" role="checkbox" aria-checked={state==='indeterminate'?'mixed':state==='checked'}
    aria-label={label??S.select} title={label??S.select} disabled={disabled}
    onClick={e=>{e.stopPropagation();if(onChange)onChange(state==='checked'?'unchecked':'checked')}}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{flex:'none',display:'inline-flex',alignItems:'center',justifyContent:'center',
      width:hit,height:hit,padding:0,border:'none',borderRadius:'var(--ds-radius-circle)',
      background:h&&!disabled?'var(--ds-surface-hover)':'transparent',
      cursor:disabled?'not-allowed':'pointer',transition:'var(--ds-transition-control)'}}>
    <DsCheck state={state} disabled={disabled} hover={h} size={size}/></button>;
}
