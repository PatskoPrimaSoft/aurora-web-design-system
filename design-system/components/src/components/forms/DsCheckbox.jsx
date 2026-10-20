import React from 'react';
import { CheckMark } from './CheckMark.jsx';

/** Controlled checkbox / radio, with an optional visible label. */
export function DsCheckbox({state='unchecked',onChange,label,ariaLabel,description,radio=false,disabled=false,name,value,hit='var(--ds-control-h)'}){
  const [hover,setHover]=React.useState(false);
  const box=React.useRef(null),descriptionId=React.useId(),labelId=descriptionId+'-label';
  const mixed=!radio&&state==='indeterminate',checked=state==='checked';
  React.useEffect(()=>{if(box.current)box.current.indeterminate=mixed},[mixed,checked]);
  const hasLabel=label!=null;
  const hitCss=typeof hit==='number'?hit+'px':hit;
  return <label onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    style={{position:'relative',display:'inline-flex',alignItems:description?'flex-start':'center',gap:hasLabel?'var(--ds-gap-sm)':0,
      flex:hasLabel?undefined:'none',cursor:disabled?'not-allowed':'pointer'}}>
    <input ref={box} type={radio?'radio':'checkbox'} name={name} value={value} checked={checked} disabled={disabled}
      aria-label={ariaLabel} aria-labelledby={hasLabel&&!ariaLabel?labelId:undefined}
      aria-describedby={description?descriptionId:undefined} aria-checked={mixed?'mixed':undefined}
      onChange={e=>{
        const next=e.target.checked?'checked':'unchecked';
        // Native activation clears indeterminate; state stays controlled until the parent updates it.
        e.target.indeterminate=mixed;
        if(onChange)onChange(next);
        else e.target.checked=checked;
      }} readOnly={!onChange}
      style={{position:'absolute',opacity:0,width:0,height:0}}/>
    <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',flex:'none',minWidth:hit,minHeight:hit,
      borderRadius:'var(--ds-radius-circle)',background:!hasLabel&&hover&&!disabled?'var(--ds-surface-hover)':'transparent',
      transition:'var(--ds-transition-control)'}}>
      <CheckMark state={state} radio={radio} disabled={disabled} hover={hover}/>
    </span>
    {hasLabel||description?<span style={{minWidth:0,paddingTop:description?'max(0px, calc(('+hitCss+' - 18px) / 2))':undefined}}>
      {hasLabel?<span id={labelId} style={{font:'var(--ds-type-body)',color:disabled?'var(--ds-fg-subtle)':'var(--ds-fg)',display:'block'}}>{label}</span>:null}
      {description?<span id={descriptionId} style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)',display:'block',marginTop:2}}>{description}</span>:null}
    </span>:null}
  </label>;
}
