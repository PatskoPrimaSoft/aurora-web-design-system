import React from 'react';
import { DsCheckbox } from '../forms/DsCheckbox.jsx';
import { dsSlots } from '../layout/DsPageLayout.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

/** Strip above the object tree: actions for the current selection, the counter, select-all. */
export function DsSelectionBar({selected=0,total=0,onSelectAll,onClear,actions,children,rule=true}){
  const S=useDsStrings();
  const [s]=dsSlots(children,['actions'],{actions});
  const state=selected===0?'unchecked':selected>=total?'checked':'indeterminate';
  return <div style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-2xs)',flex:'none',
    padding:'0 var(--ds-pad-md) var(--ds-gap-xs) var(--ds-pad-sm)',
    borderBottom:rule?'2px solid var(--ds-brand)':'none'}}>
    {selected>0?s.actions:null}
    <span style={{flex:1}}/>
    {selected>0&&onClear?<button type="button" onClick={onClear} title={S.clearSelection} aria-label={S.clearSelection}
      style={{flex:'none',display:'inline-flex',alignItems:'center',justifyContent:'center',width:'var(--ds-control-h-sm)',
        height:'var(--ds-control-h-sm)',border:'none',borderRadius:'var(--ds-radius-circle)',background:'transparent',
        color:'var(--ds-brand-text)',cursor:'pointer'}}>
      <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:'var(--ds-icon-sm)',lineHeight:1}}>remove_done</span>
    </button>:null}
    <span style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-muted)',fontVariantNumeric:'tabular-nums'}}>{selected} / {total}</span>
    <span style={{marginRight:-8}}><DsCheckbox state={state} ariaLabel={S.selectAllObjects}
      onChange={next=>onSelectAll&&onSelectAll(next==='checked')}/></span>
  </div>;
}
