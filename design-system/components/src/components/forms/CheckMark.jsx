import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';

const overlay=()=>{const c='color-mix(in oklab,var(--ds-on-brand) var(--ds-overlay-hover),transparent)';return 'linear-gradient(0deg,'+c+','+c+')'};

// Private drawing; the native input owns semantics and keyboard behavior.
export function CheckMark({state,radio,disabled,hover}){
  const on=state==='checked'||(!radio&&state==='indeterminate');
  return <span aria-hidden="true" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',flex:'none',boxSizing:'border-box',
    width:18,height:18,borderRadius:radio?'50%':'var(--ds-radius-xs)',
    border:'var(--ds-border-width-control) solid '+(disabled?'var(--ds-border-control-disabled)':on?'var(--ds-brand)':hover?'var(--ds-border-control-hover)':'var(--ds-border-control)'),
    backgroundColor:disabled?'var(--ds-surface-disabled)':on?'var(--ds-brand)':'var(--ds-surface)',
    backgroundImage:on&&hover&&!disabled?overlay():undefined,
    color:disabled?'var(--ds-fg-control-disabled)':'var(--ds-on-brand)',transition:'var(--ds-transition-control)'}}>
    {radio?(on?<span style={{width:8,height:8,borderRadius:'50%',background:'currentColor'}}/>:null)
      :on?<Icon name={state==='indeterminate'?'remove':'check'} size={14} style={{fontVariationSettings:"'wght' 600"}}/>:null}
  </span>;
}

