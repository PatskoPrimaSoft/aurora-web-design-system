import React from 'react';
import { useDsStrings } from '../primitives/DsStrings.jsx';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';

/** Text / number / select / textarea field. Static top label, no floating notch. */
export const DsField=React.forwardRef(function DsField({label,hint,error,required=false,as='input',type='text',value,defaultValue,onChange,placeholder,options=[],icon,suffix,mono=false,disabled=false,rows=3,width,id,labelMode='top',readOnly=false,autoResize=false,maxHeight,showCount=false,onFocus,onBlur,'aria-describedby':describedBy,...rest},ref){
  const uid=React.useId(),rid=id||'dsf-'+uid.replace(/:/g,'');
  const S=useDsStrings(),nativeRef=React.useRef(null);
  const [length,setLength]=React.useState(()=>String(defaultValue??'').length);
  const counter=showCount&&as==='textarea';
  const count=value!==undefined?String(value??'').length:length;
  const setRef=React.useCallback(node=>{nativeRef.current=node;if(typeof ref==='function')ref(node);else if(ref)ref.current=node},[ref]);
  const resize=React.useCallback(()=>{
    const node=nativeRef.current;if(as!=='textarea'||!autoResize||!node)return;
    node.style.height='0px';
    const css=getComputedStyle(node),line=parseFloat(css.lineHeight)||parseFloat(css.fontSize)*1.5;
    const minimum=Math.max(1,rows)*line+parseFloat(css.paddingTop)+parseFloat(css.paddingBottom);
    node.style.height=Math.ceil(Math.max(minimum,node.scrollHeight))+'px';
    node.style.overflowY=node.scrollHeight>node.clientHeight?'auto':'hidden';
  },[as,autoResize,rows,labelMode]);
  React.useLayoutEffect(()=>{
    const node=nativeRef.current;if(as!=='textarea'||autoResize||!node)return;
    const height=rest.style?.height;node.style.height=typeof height==='number'?height+'px':height||'';
    node.style.overflowY=rest.style?.overflowY||'';
  },[as,autoResize]);
  React.useLayoutEffect(resize,[resize,value,defaultValue,maxHeight]);
  React.useEffect(()=>{
    const node=nativeRef.current;if(!node)return;
    let observer,width=node.getBoundingClientRect().width;
    if(as==='textarea'&&autoResize&&typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(()=>{const next=node.getBoundingClientRect().width;if(next!==width){width=next;resize()}});observer.observe(node)}
    const reset=()=>queueMicrotask(()=>{setLength(node.value.length);setDirty(node.value!=='');resize()});
    node.form?.addEventListener('reset',reset);
    return()=>{observer?.disconnect();node.form?.removeEventListener('reset',reset)};
  },[as,autoResize,resize]);
  const [foc,setFoc]=React.useState(false);
  const [dirty,setDirty]=React.useState(()=>String(defaultValue??'')!=='');
  const filled=value!==undefined?String(value)!=='':dirty;
  const notch=labelMode==='notch'&&!!label;
  // select and date inputs always render a value box, so their label can never sit centred
  const alwaysUp=as==='select'||type==='date'||type==='time'||type==='datetime-local'||type==='month';
  const up=notch&&(foc||filled||alwaysUp||!!placeholder);
  const bg=disabled?'var(--ds-surface-disabled)':readOnly&&as!=='select'?'var(--ds-bg)':'var(--ds-surface)';
  const shell={boxSizing:'border-box',display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',position:'relative',
    minHeight:as==='textarea'?undefined:'var(--ds-field-h)',padding:as==='textarea'?'8px 10px':'0 10px',
    background:bg,minWidth:0,transition:'var(--ds-transition-control)',color:disabled?'var(--ds-fg-disabled)':'var(--ds-fg)'};
  const inner={flex:1,width:'100%',minWidth:0,border:'none',outline:'none',background:'transparent',color:'inherit',
    font:mono?'var(--ds-type-mono)':'var(--ds-type-body)',padding:0,margin:0,appearance:as==='select'?'none':undefined,cursor:disabled?'not-allowed':as==='select'?'pointer':'text'};
  const description=[...new Set([describedBy,(error||hint)?rid+'-d':null,suffix&&as!=='select'?rid+'-suffix':null,counter?rid+'-count':null].filter(Boolean).join(' ').split(/\s+/).filter(Boolean))].join(' ')||undefined;
  const common={...rest,id:rid,ref:setRef,value,defaultValue,disabled,required,readOnly:as==='select'?undefined:readOnly,
    style:{...inner,...rest.style},placeholder:notch&&!up?undefined:placeholder,
    onChange:e=>{setDirty(e.target.value!=='');setLength(e.target.value.length);resize();onChange&&onChange(e)},
    onFocus:e=>{setFoc(true);onFocus&&onFocus(e)},onBlur:e=>{setFoc(false);onBlur&&onBlur(e)},
    'aria-invalid':error?true:rest['aria-invalid'],'aria-describedby':description};
  const baseLeft=icon?34:9;
  const notchLabel={position:'absolute',pointerEvents:'none',whiteSpace:'nowrap',maxWidth:'calc(100% - 20px)',overflow:'hidden',textOverflow:'ellipsis',
    left:up?baseLeft:baseLeft+4,padding:up?'0 4px':0,background:up?bg:'transparent',zIndex:1,
    top:up?0:(as==='textarea'?11:'50%'),transform:up?'translateY(-50%)':(as==='textarea'?'none':'translateY(-50%)'),
    font:up?'var(--ds-type-caption)':(mono?'var(--ds-type-mono)':'var(--ds-type-body)'),
    color:error?'var(--ds-danger-fg)':foc?'var(--ds-brand-text)':'var(--ds-fg-muted)',
    transition:'var(--ds-transition-control)'};
  return <div style={{display:'flex',flexDirection:'column',gap:6,width:width||'100%',minWidth:0}}>
    {label&&!notch?<label htmlFor={rid} style={{font:'var(--ds-type-caption)',fontWeight:'var(--ds-weight-medium)',color:'var(--ds-fg-muted)'}}>
      {label}{required?<span aria-hidden="true" style={{color:'var(--ds-danger-solid)',marginLeft:3}}>*</span>:null}</label>:null}
    <div data-ds-field={error?'error':'default'} data-ds-field-disabled={disabled||undefined} data-ds-field-readonly={readOnly&&as!=='select'||undefined} style={shell}>
      {notch?<label htmlFor={rid} style={notchLabel}>{label}{required?<span aria-hidden="true" style={{color:'var(--ds-danger-solid)',marginLeft:3}}>*</span>:null}</label>:null}
      {icon?<Icon name={icon} size="var(--ds-icon)" style={{color:'var(--ds-fg-subtle)',flex:'none'}}/>:null}
      {as==='textarea'?<textarea rows={rows} {...common} style={{...inner,resize:autoResize?'none':'vertical',lineHeight:1.5,paddingTop:notch?6:0,maxHeight:as==='textarea'?maxHeight:undefined,...rest.style}}/>
        :as==='select'?<select {...common}>{options.map(o=>{const v=typeof o==='string'?o:o.value,l=typeof o==='string'?o:o.label;return <option key={v} value={v}>{l}</option>})}</select>
        :<input type={type} {...common}/>}
      {as==='select'?<Icon name="expand_more" size="var(--ds-icon)" style={{color:'var(--ds-fg-subtle)',flex:'none'}}/>
        :suffix?<span id={rid+'-suffix'} style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)',flex:'none'}}>{suffix}</span>:null}
    </div>
    {error||hint||counter?<div style={{display:'flex',flexWrap:'wrap',alignItems:'baseline',gap:'var(--ds-gap-sm)'}}>{error||hint?<span id={rid+'-d'} style={{font:'var(--ds-type-caption)',color:error?'var(--ds-danger-fg)':'var(--ds-fg-subtle)'}}>{error||hint}</span>:null}
      {counter?<span id={rid+'-count'} style={{marginLeft:'auto',font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)'}}>{S.field.count(count,rest.maxLength)}</span>:null}
    </div>:null}
  </div>;
});
