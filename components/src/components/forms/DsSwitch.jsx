import React from 'react';
import { DsSpinner } from '../feedback/DsSpinner.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

/** Controlled setting that takes effect immediately. */
export const DsSwitch=React.forwardRef(function DsSwitch({label,description,checked=false,disabled=false,loading=false,onChange,id,
  'aria-label':ariaLabel,'aria-labelledby':ariaLabelledby,'aria-describedby':ariaDescribedby,onClick,onKeyDown,...rest},ref){
  const generated=React.useId(),S=useDsStrings(),inputId=id??generated,labelId=generated+'-label',descriptionId=generated+'-description';
  const hasLabel=label!=null,blocked=disabled||loading;
  const describedby=[ariaDescribedby,description?descriptionId:null].filter(Boolean).join(' ')||undefined;
  return <label data-ds-switch="" data-checked={checked} data-disabled={disabled} data-loading={loading} htmlFor={inputId}
    style={{position:'relative',display:'inline-flex',alignItems:description?'flex-start':'center',gap:hasLabel?'var(--ds-gap-sm)':0,maxWidth:'100%',cursor:disabled?'not-allowed':loading?'wait':'pointer'}}>
    <input {...rest} ref={ref} id={inputId} type="checkbox" role="switch" checked={checked} disabled={disabled}
      aria-label={ariaLabel} aria-labelledby={ariaLabelledby??(hasLabel&&!ariaLabel?labelId:undefined)} aria-describedby={describedby}
      aria-busy={loading||undefined} aria-disabled={blocked||undefined} readOnly={!onChange||loading}
      onClick={onClick}
      onKeyDown={e=>{onKeyDown?.(e);if(loading&&e.key===' ')e.preventDefault();}}
      onChange={e=>{if(blocked||!onChange)e.target.checked=checked;else onChange(e);}}
      style={{position:'absolute',opacity:0,width:1,height:1,margin:0}}/>
    <span data-ds-switch-hit="" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',flex:'none',minWidth:'max(36px, var(--ds-control-h))',minHeight:'var(--ds-control-h)',borderRadius:'var(--ds-radius-pill)'}}>
      <span data-ds-switch-track="" aria-hidden="true" style={{position:'relative',boxSizing:'border-box',width:36,height:20,borderRadius:'var(--ds-radius-pill)',
        background:disabled?'var(--ds-surface-disabled)':checked?'var(--ds-brand)':'var(--ds-border-control)',
        border:'1px solid '+(disabled?'var(--ds-border-control-disabled)':checked?'var(--ds-brand)':'var(--ds-border-control)'),
        transition:'background-color var(--ds-dur-fast) var(--ds-ease)'}}>
        <span data-ds-switch-thumb="" style={{position:'absolute',top:2,left:checked?18:2,width:14,height:14,borderRadius:'50%',
          background:disabled?'var(--ds-fg-control-disabled)':'var(--ds-on-brand)',color:disabled?'var(--ds-surface-disabled)':'var(--ds-brand)',boxShadow:'var(--ds-shadow-xs)',transition:'left var(--ds-dur-fast) var(--ds-ease)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {loading?<DsSpinner size={10} thickness={2} tone="inverse"/>:null}
        </span>
      </span>
    </span>
    {hasLabel||description?<span style={{minWidth:0,paddingTop:description?'max(0px, calc((var(--ds-control-h) - 20px) / 2))':undefined}}>
      {hasLabel?<span id={labelId} style={{font:'var(--ds-type-body)',color:disabled?'var(--ds-fg-subtle)':'var(--ds-fg)',display:'block',overflowWrap:'anywhere'}}>{label}</span>:null}
      {description?<span id={descriptionId} style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)',display:'block',marginTop:2,overflowWrap:'anywhere'}}>{description}</span>:null}
    </span>:null}
    {loading?<span role="status" style={{position:'absolute',width:1,height:1,overflow:'hidden',clipPath:'inset(50%)',whiteSpace:'nowrap'}}>{S.loading}</span>:null}
  </label>;
});
