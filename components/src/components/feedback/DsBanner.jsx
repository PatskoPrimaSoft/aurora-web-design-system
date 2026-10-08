import React from 'react';
import { DsIconButton } from '../buttons/DsIconButton.jsx';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
const DsBANNER_ICON={info:'info',success:'check_circle',warning:'warning',danger:'error',neutral:'info'};
import { dsSlots } from '../layout/DsPageLayout.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';
/** Permanent in-page message. Tinted ground, 1px line, no left accent bar. */
export function DsBanner({tone='info',title,children,actions,onClose,compact=false,announcement='off',headingLevel='h2',closeLabel}){
  const S=useDsStrings();
  const [s,body]=dsSlots(children,['actions'],{actions});
  const hasBody=body.some(c=>typeof c==='string'?c.trim():c!=null&&c!==false);
  const role=announcement==='assertive'?'alert':announcement==='polite'?'status':undefined;
  const Heading=headingLevel==='none'?'div':headingLevel;
  return <div data-ds-banner="" role={role} aria-atomic={role?true:undefined} style={{display:'flex',gap:'var(--ds-gap-sm-plus)',alignItems:'flex-start',
    padding:compact?'var(--ds-pad-tight) var(--ds-pad-sm)':'var(--ds-pad-sm) var(--ds-pad-md)',
    background:'var(--ds-'+tone+'-bg)',border:'1px solid var(--ds-'+tone+'-line)',
    borderRadius:'var(--ds-radius-container)',color:'var(--ds-'+tone+'-fg)',minWidth:0,overflowWrap:'anywhere'}}>
    <Icon name={DsBANNER_ICON[tone]} size="var(--ds-icon)" style={{flexShrink:0,height:'calc(var(--ds-text-14) * var(--ds-lh-normal))',color:'var(--ds-'+tone+'-solid)'}}/>
    <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:4}}>
      {title!=null&&title!==false&&title!==''?<Heading style={{margin:0,font:'var(--ds-type-body-strong)',color:'var(--ds-'+tone+'-fg)'}}>{title}</Heading>:null}
      {hasBody?<div data-ds-banner-body="" style={{font:'var(--ds-type-body)',color:'var(--ds-fg)',textWrap:'pretty'}}>{body}</div>:null}
      {s.actions?<div data-ds-banner-actions="" style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'var(--ds-gap-sm)',marginTop:4}}>{s.actions}</div>:null}
    </div>
    {onClose?<DsIconButton icon="close" label={closeLabel||S.close} size="sm" tone="ghost" onClick={onClose}/>:null}
  </div>;
}
