import React from 'react';
import { DsCheck } from '../primitives/DsCheck.jsx';

/** Checkbox / radio. Selected state uses --ds-brand, not accent. */
export function DsCheckbox({label,description,checked=false,indeterminate=false,radio=false,disabled=false,onChange,name,value}){
  const [h,setH]=React.useState(false);
  const box=React.useRef(null);
  /* `indeterminate` is a DOM property, not an attribute: without this the native
     input stays plainly checked/unchecked and a screen reader announces a state the
     decorative DsCheck does not show. */
  React.useEffect(()=>{if(box.current)box.current.indeterminate=!radio&&!!indeterminate},[indeterminate,radio,checked]);
  const state=!radio&&indeterminate?'indeterminate':checked?'checked':'unchecked';
  return <label onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{display:'inline-flex',alignItems:description?'flex-start':'center',gap:'var(--ds-gap-sm)',cursor:disabled?'not-allowed':'pointer',minHeight:'var(--ds-control-h-sm)'}}>
    <input ref={box} type={radio?'radio':'checkbox'} name={name} value={value} checked={!radio&&indeterminate?false:checked} disabled={disabled}
      aria-checked={!radio&&indeterminate?'mixed':undefined}
      onChange={onChange} readOnly={!onChange} style={{position:'absolute',opacity:0,width:0,height:0}}/>
    <DsCheck state={state} radio={radio} disabled={disabled} hover={h} style={{marginTop:description?1:0}}/>
    <span style={{minWidth:0}}>
      <span style={{font:'var(--ds-type-body)',color:disabled?'var(--ds-fg-subtle)':'var(--ds-fg)',display:'block'}}>{label}</span>
      {description?<span style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)',display:'block',marginTop:2}}>{description}</span>:null}
    </span>
  </label>;
}
