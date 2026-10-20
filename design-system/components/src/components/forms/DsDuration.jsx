import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

/** Duration field — days / hours / minutes as three segments in one control. */
export function DsDuration({label,value={},onChange,hint,error,warning,showDays=true,disabled=false,width}){
  const S=useDsStrings();
  const set=(k,v)=>{const n=v.replace(/[^0-9]/g,'').slice(0,k==='d'?3:2);onChange&&onChange({...value,[k]:n})};
  const seg={width:34,border:'none',outline:'none',background:'transparent',textAlign:'center',
    font:'var(--ds-type-mono)',color:'inherit',padding:0};
  const unit={font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)',flex:'none'};
  return <div style={{display:'flex',flexDirection:'column',gap:6,width:width||'auto',minWidth:0}}>
    {label?<span style={{font:'var(--ds-type-caption)',fontWeight:'var(--ds-weight-medium)',color:'var(--ds-fg-muted)'}}>{label}</span>:null}
    <div data-ds-field={error?'error':warning?'warning':'default'}
      style={{display:'inline-flex',alignItems:'center',gap:4,height:'var(--ds-field-h)',padding:'0 10px',alignSelf:'flex-start',
        background:disabled?'var(--ds-surface-disabled)':'var(--ds-surface)',
        color:disabled?'var(--ds-fg-disabled)':'var(--ds-fg)',
        transition:'var(--ds-transition-control)'}}>
      <Icon name="schedule" size="var(--ds-icon-sm)" style={{color:'var(--ds-fg-subtle)',marginRight:2}}/>
      {showDays?<><input inputMode="numeric" aria-label={S.duration.days} placeholder="00" disabled={disabled}
        value={value.d||''} onChange={e=>set('d',e.target.value)} style={seg}/><span style={unit}>{S.duration.d}</span></>:null}
      <input inputMode="numeric" aria-label={S.duration.hours} placeholder="00" disabled={disabled}
        value={value.h||''} onChange={e=>set('h',e.target.value)} style={seg}/><span style={unit}>{S.duration.h}</span>
      <span aria-hidden="true" style={{color:'var(--ds-fg-subtle)'}}>:</span>
      <input inputMode="numeric" aria-label={S.duration.minutes} placeholder="00" disabled={disabled}
        value={value.m||''} onChange={e=>set('m',e.target.value)} style={seg}/><span style={unit}>{S.duration.m}</span>
    </div>
    {error||warning||hint?<span style={{font:'var(--ds-type-caption)',
      color:error?'var(--ds-danger-fg)':warning?'var(--ds-warning-fg)':'var(--ds-fg-subtle)'}}>{error||warning||hint}</span>:null}
  </div>;
}
