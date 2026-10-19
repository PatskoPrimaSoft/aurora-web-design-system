import React from 'react';
import {CheckMark} from './CheckMark.jsx';
import {useDsStrings} from '../primitives/DsStrings.jsx';

/** Один выбор с нативной семантикой группы и отправкой формы. */
export function DsRadioGroup({label,options=[],value,defaultValue='',onChange,name,form,required=false,disabled=false,hint,error,orientation='vertical',id,style,...rest}){
  const S=useDsStrings(),uid=React.useId(),groupId=id||'ds-radio-'+uid.replace(/:/g,''),groupName=name||groupId;
  const root=React.useRef(null),[local,setLocal]=React.useState(defaultValue),[invalid,setInvalid]=React.useState(false),[hover,setHover]=React.useState(null);
  const current=value===undefined?local:value,message=error||(invalid?S.radio.required:undefined);
  const state=React.useRef();state.current={value,defaultValue};
  React.useEffect(()=>{
    const owner=root.current?.querySelector('input')?.form;if(!owner)return;
    let mounted=true;
    const reset=event=>queueMicrotask(()=>{
      if(!mounted||event.defaultPrevented)return;
      const {value,defaultValue}=state.current,next=value===undefined?defaultValue:value;
      setInvalid(false);if(value===undefined)setLocal(next);
      // Native reset restores mount-time defaultChecked even for controlled radios.
      root.current?.querySelectorAll('input[type="radio"]').forEach(input=>{input.checked=input.value===next});
    });
    owner.addEventListener('reset',reset);return()=>{mounted=false;owner.removeEventListener('reset',reset)};
  },[form,options.length]);
  const help=message||hint,helpId=help?groupId+'-help':undefined;
  return <fieldset {...rest} ref={root} id={groupId} disabled={disabled} aria-describedby={[rest['aria-describedby'],helpId].filter(Boolean).join(' ')||undefined}
    aria-invalid={message?true:undefined} style={{border:0,padding:0,margin:0,minWidth:0,...style}}>
    <legend style={{padding:0,marginBottom:'var(--ds-gap-xs)',font:'var(--ds-type-body-strong)',color:'var(--ds-fg)',overflowWrap:'anywhere'}}>{label}{required?<span aria-hidden="true" style={{color:'var(--ds-danger-solid)'}}> *</span>:null}</legend>
    <div style={{display:'flex',flexDirection:orientation==='horizontal'?'row':'column',flexWrap:'wrap',gap:'var(--ds-gap-sm)'}}>
      {options.map((option,index)=>{
        const off=disabled||option.disabled,descriptionId=option.description?groupId+'-option-'+index:undefined;
        return <label key={option.value} onMouseEnter={()=>setHover(index)} onMouseLeave={()=>setHover(null)}
          style={{position:'relative',display:'flex',alignItems:option.description?'flex-start':'center',gap:'var(--ds-gap-sm)',minWidth:0,maxWidth:'100%',cursor:off?'not-allowed':'pointer'}}>
          <input type="radio" name={groupName} form={form} value={option.value} checked={current===option.value} disabled={off} required={required}
            aria-labelledby={groupId+'-label-'+index} aria-describedby={[descriptionId,helpId].filter(Boolean).join(' ')||undefined} aria-invalid={message?true:undefined}
            onInvalid={()=>setInvalid(true)} onChange={event=>{if(!event.target.checked)return;setInvalid(false);if(value===undefined)setLocal(option.value);onChange?.(option.value,event)}}
            style={{position:'absolute',opacity:0,width:1,height:1}}/>
          <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',flex:'none',minWidth:'var(--ds-control-h)',minHeight:'var(--ds-control-h)',borderRadius:'var(--ds-radius-circle)'}}>
            <CheckMark radio state={current===option.value?'checked':'unchecked'} disabled={off} hover={hover===index&&!off}/>
          </span>
          <span style={{minWidth:0,overflowWrap:'anywhere',paddingTop:option.description?'max(0px, calc((var(--ds-control-h) - 18px) / 2))':undefined}}>
            <span id={groupId+'-label-'+index} style={{display:'block',font:'var(--ds-type-body)',color:off?'var(--ds-fg-subtle)':'var(--ds-fg)'}}>{option.label}</span>
            {option.description?<span id={descriptionId} style={{display:'block',font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)',marginTop:2}}>{option.description}</span>:null}
          </span>
        </label>;
      })}
    </div>
    {help?<div id={helpId} style={{font:'var(--ds-type-caption)',color:message?'var(--ds-danger-fg)':'var(--ds-fg-muted)',marginTop:'var(--ds-gap-xs)',overflowWrap:'anywhere'}}>{help}</div>:null}
  </fieldset>;
}
