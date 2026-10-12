import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';
const Ds_OVERLAY=(ink,depth)=>{const c='color-mix(in oklab,'+ink+' '+depth+',transparent)';return 'linear-gradient(0deg,'+c+','+c+')'};
/** Interactive chip: selectable filter token or removable value token. */
export function DsChip({children,icon,selected=false,removable=false,onRemove,onClick,disabled=false,count,ariaLabel,maxWidth=240}){
  const S=useDsStrings();
  const [h,setH]=React.useState(false);
  const filter=!!onClick&&!removable;
  const interactive=filter&&!disabled;
  const Root=filter?'button':'span';
  const label=ariaLabel||(typeof children==='string'||typeof children==='number'?String(children):undefined);
  const leading=filter&&selected?'check':icon;
  return <Root type={filter?'button':undefined} disabled={filter?disabled:undefined}
    role={removable?'group':undefined} aria-label={label?label+(filter&&count!=null?' '+count:''):undefined}
    aria-pressed={filter?selected:undefined} onClick={interactive?onClick:undefined}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{display:'inline-flex',alignItems:'center',gap:6,flex:'0 1 auto',minWidth:0,maxWidth:'min(100%, '+maxWidth+'px)',height:'var(--ds-control-h-sm)',
      padding:removable?'0 4px 0 10px':'0 10px',font:'var(--ds-type-ui)',whiteSpace:'nowrap',
      background:disabled?'var(--ds-surface-disabled)':selected?'var(--ds-brand-subtle)':h&&interactive?'var(--ds-surface-hover)':'var(--ds-surface)',
      backgroundImage:selected&&h&&interactive?Ds_OVERLAY('var(--ds-brand-text)','var(--ds-overlay-hover)'):undefined,
      color:disabled?'var(--ds-fg-disabled)':selected?'var(--ds-brand-text)':'var(--ds-fg)',
      border:'1px solid '+(disabled?'var(--ds-border)':selected?'var(--ds-brand-border)':'var(--ds-border)'),
      borderRadius:'var(--ds-radius-pill)',cursor:interactive?'pointer':'default',transition:'var(--ds-transition-control)'}}>
    {leading?<Icon name={leading} size="var(--ds-icon-sm)"/>:null}
    <span title={label} style={{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{children}</span>
    {count!=null?<span style={{font:'var(--ds-type-ui)',fontVariantNumeric:'tabular-nums',flex:'none',background:disabled?'var(--ds-surface-disabled)':'var(--ds-neutral-bg)',color:disabled?'var(--ds-fg-disabled)':'var(--ds-neutral-fg)',borderRadius:'var(--ds-radius-pill)',padding:'1px 6px'}}>{count}</span>:null}
    {removable?<button type="button" data-ds-chip-remove="" disabled={disabled} aria-label={label?S.removeItem(label):S.remove}
      onClick={e=>{e.stopPropagation();if(!disabled)onRemove&&onRemove()}}
      style={{display:'inline-flex',alignItems:'center',justifyContent:'center',flex:'none',width:20,height:20,padding:0,border:'none',
        borderRadius:'50%',color:'inherit',cursor:disabled?'default':'pointer',transition:'var(--ds-transition-control)'}}><Icon name="close" size="var(--ds-icon-xs)"/></button>:null}
  </Root>;
}
