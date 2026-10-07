import React from 'react';
import { DsButton } from '../buttons/DsButton.jsx';
import { dsSlots } from '../layout/DsPageLayout.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

/** Contextual toolbar for what you can do with N selected rows. Absent at rest. */
export function DsBulkBar({count=0,total,noun,onSelectAll,onClear,actions,children,floating=true,style}){
  const S=useDsStrings();
  const [s]=dsSlots(children,['actions'],{actions});
  if(!count)return null;
  const all=total!=null&&count>=total;
  const selected=noun!=null?count+' '+noun:S.objects(count);
  const clear=onClear||(onSelectAll?()=>onSelectAll(false):undefined);
  return <div role="toolbar" aria-label={S.bulk.toolbar(noun!=null?count+' '+noun:S.objects(count))}
    style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',flex:'none',minWidth:0,maxWidth:'100%',
      padding:'var(--ds-pad-tight) var(--ds-pad-sm)',background:floating?'var(--ds-surface-raised)':'var(--ds-surface)',
      border:'1px solid '+(floating?'var(--ds-border-strong)':'var(--ds-border)'),
      borderRadius:'var(--ds-radius-container)',boxShadow:floating?'var(--ds-shadow-lg)':'none',...style}}>
    <span style={{display:'inline-flex',alignItems:'center',minHeight:'var(--ds-control-h-sm)',font:'var(--ds-type-ui)',fontWeight:400,color:'var(--ds-fg)',whiteSpace:'nowrap',flex:'none'}}>
      <span>{all?S.bulk.allSelected(selected):<>{S.bulk.selected} <strong style={{fontWeight:'var(--ds-weight-medium)',fontVariantNumeric:'tabular-nums'}}>{count}</strong>{noun!=null?' '+noun:' '+S.objects(count).slice(String(count).length+1)}</>}</span>
    </span>
    {onSelectAll&&total&&!all?<DsButton size="sm" tone="ghost" onClick={()=>onSelectAll(true)}>{S.bulk.selectAll(total)}</DsButton>:null}
    {s.actions?<span aria-hidden="true" style={{flex:'none',width:1,alignSelf:'stretch',margin:'0 var(--ds-gap-2xs)',background:'var(--ds-border)'}}/>:null}
    {s.actions?<span style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',minWidth:0}}>{s.actions}</span>:null}
    {clear?<span style={{display:'inline-flex',marginLeft:'auto',flex:'none'}}>
      <DsButton size="sm" tone="ghost" onClick={clear}>{S.bulk.deselectAll}</DsButton>
    </span>:null}
  </div>;
}
