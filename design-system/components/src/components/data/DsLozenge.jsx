import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
/** Compact status label. Five theme-independent tones, tint or solid. */
export function DsLozenge({tone='neutral',solid=false,dot=false,icon,children,size='md'}){
  const bg=solid?'var(--ds-'+tone+'-solid)':'var(--ds-'+tone+'-bg)';
  const fg=solid?'var(--ds-on-solid)':'var(--ds-'+tone+'-fg)';
  return <span style={{display:'inline-flex',alignItems:'center',gap:6,flex:'none',
    height:size==='sm'?20:24,padding:size==='sm'?'0 8px':'0 10px',
    font:'var(--ds-type-caption)',fontWeight:'var(--ds-weight-medium)',whiteSpace:'nowrap',
    background:bg,color:fg,border:solid?'1px solid transparent':'1px solid var(--ds-'+tone+'-line)',
    borderRadius:'var(--ds-radius-pill)'}}>
    {dot?<span aria-hidden="true" style={{width:6,height:6,borderRadius:'50%',background:solid?'var(--ds-on-solid)':'var(--ds-'+tone+'-solid)',flex:'none'}}/>:null}
    {icon?<Icon name={icon} size="var(--ds-icon-xs)"/>:null}{children}</span>;
}
