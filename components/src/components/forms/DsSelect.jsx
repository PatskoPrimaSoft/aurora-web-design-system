import React from 'react';
import { DsIcon } from '../primitives/DsIcon.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';
import { useDsLayer } from '../layout/DsDialog.jsx';

/** Выбор одного значения из системного списка. */
export const DsSelect=React.forwardRef(function DsSelect({label,options=[],value,defaultValue='',onChange,placeholder,hint,error,disabled=false,required=false,name,form,id,width,maxHeight=320,onFocus,onBlur,onKeyDown,'aria-label':ariaLabel,'aria-labelledby':labelledBy,'aria-describedby':describedBy,...rest},ref){
  const S=useDsStrings(),uid=React.useId(),rid=id||'ds-select-'+uid.replace(/:/g,''),listId=rid+'-list';
  const opts=options.map(option=>typeof option==='string'?{value:option,label:option}:option);
  const enabled=opts.filter(option=>!option.disabled);
  const [local,setLocal]=React.useState(defaultValue),selected=value===undefined?local:value;
  const current=opts.find(option=>option.value===selected);
  const [expanded,setExpanded]=React.useState(false),open=expanded&&!disabled;
  const [active,setActive]=React.useState(null),[invalid,setInvalid]=React.useState(false);
  const root=React.useRef(null),trigger=React.useRef(null),panel=React.useRef(null),native=React.useRef(null),search=React.useRef({text:'',at:0});
  const [position,setPosition]=React.useState({left:0,top:0,width:240,maxHeight});
  const message=error||(invalid?S.selectField.required:undefined),emptyLabel=placeholder??S.selectField.placeholder;
  const labelIds=labelledBy||(!ariaLabel&&label?rid+'-label':undefined);
  const description=[...new Set([describedBy,(message||hint)?rid+'-description':null].filter(Boolean).join(' ').split(/\s+/).filter(Boolean))].join(' ')||undefined;
  const activeOption=enabled.find(option=>option.value===active);
  const setRef=React.useCallback(node=>{trigger.current=node;if(typeof ref==='function')ref(node);else if(ref)ref.current=node},[ref]);
  const close=()=>{setExpanded(false);search.current={text:'',at:0}};
  const choose=option=>{if(!option||option.disabled)return;setInvalid(false);if(value===undefined)setLocal(option.value);if(option.value!==selected)onChange?.(option.value,option);close()};
  const show=last=>{const option=enabled.find(item=>item.value===selected)||(last?enabled[enabled.length-1]:enabled[0]);setActive(option?.value??null);setExpanded(true)};
  useDsLayer(open,close);
  React.useEffect(()=>{if(disabled)close()},[disabled]);
  React.useEffect(()=>{if(!open)return;if(!activeOption)setActive((enabled.find(option=>option.value===selected)||enabled[0])?.value??null)},[open,active,selected,options]);
  React.useEffect(()=>{
    const node=native.current;if(!node?.form)return;
    const reset=()=>queueMicrotask(()=>{if(value===undefined)setLocal(defaultValue);node.value=value===undefined?defaultValue:value;setInvalid(false);close()});
    node.form.addEventListener('reset',reset);return()=>node.form?.removeEventListener('reset',reset);
  },[value,defaultValue,form]);
  React.useEffect(()=>{
    if(!open)return;const away=event=>{if(!root.current?.contains(event.target))close()};
    document.addEventListener('pointerdown',away);return()=>document.removeEventListener('pointerdown',away);
  },[open]);
  React.useLayoutEffect(()=>{
    if(!open||!panel.current)return;const node=panel.current;if(node.showPopover)node.showPopover();
    const place=()=>{
      const rect=trigger.current?.getBoundingClientRect();if(!rect)return;
      const viewWidth=document.documentElement.clientWidth||window.innerWidth,edge=8,gap=6;
      const below=Math.max(0,window.innerHeight-rect.bottom-gap-edge),above=Math.max(0,rect.top-gap-edge);
      const desired=Math.min(maxHeight,node.scrollHeight||maxHeight),up=below<desired&&above>below;
      const cap=Math.min(maxHeight,up?above:below),width=Math.min(Math.max(rect.width,160),viewWidth-2*edge);
      const next={left:Math.max(edge,Math.min(rect.left,viewWidth-width-edge)),top:Math.max(edge,up?rect.top-gap-Math.min(desired,cap):rect.bottom+gap),width,maxHeight:cap};
      setPosition(previous=>Object.keys(next).every(key=>previous[key]===next[key])?previous:next);
    };
    place();const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(place):null;
    observer?.observe(node);observer?.observe(trigger.current);window.addEventListener('resize',place);document.addEventListener('scroll',place,true);
    return()=>{observer?.disconnect();window.removeEventListener('resize',place);document.removeEventListener('scroll',place,true);if(node.hidePopover&&node.matches(':popover-open'))node.hidePopover()};
  },[open,maxHeight]);
  React.useLayoutEffect(()=>{
    if(!open||!activeOption)return;const index=opts.findIndex(option=>option.value===active);
    panel.current?.querySelector('[id="'+rid+'-option-'+index+'"]')?.scrollIntoView({block:'nearest'});
  },[open,active]);
  const key=event=>{
    onKeyDown?.(event);if(event.defaultPrevented||disabled)return;
    const index=enabled.findIndex(option=>option.value===active);
    const move=index=>setActive(enabled[Math.max(0,Math.min(enabled.length-1,index))]?.value??null);
    if(event.key==='Escape'&&open){event.preventDefault();close();return}
    if(event.key==='Tab'){if(open){if(activeOption)choose(activeOption);else close()}return}
    if(event.key==='Enter'||event.key===' '){event.preventDefault();if(open){if(activeOption)choose(activeOption);else close()}else show(false);return}
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();if(event.altKey&&event.key==='ArrowUp'&&open){choose(activeOption);return}
      if(!open)show(event.key==='ArrowUp');else if(!event.altKey)move(index+(event.key==='ArrowDown'?1:-1));return;
    }
    if(event.key==='Home'||event.key==='End'||event.key==='PageDown'||event.key==='PageUp'){
      event.preventDefault();if(!open)setExpanded(true);move(event.key==='Home'?0:event.key==='End'?enabled.length-1:index+(event.key==='PageDown'?10:-10));return;
    }
    if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){
      event.preventDefault();const now=Date.now(),letter=event.key.toLocaleLowerCase(),text=now-search.current.at>700?letter:search.current.text+letter;
      search.current={text,at:now};const prefix=Array.from(text).every(char=>char===letter)?letter:text;
      const start=prefix.length===1?(open?index:enabled.findIndex(option=>option.value===selected))+1:Math.max(0,index);
      const option=Array.from({length:enabled.length},(_,offset)=>enabled[(start+offset+enabled.length)%enabled.length]).find(option=>option.label.toLocaleLowerCase().startsWith(prefix));
      if(option){setActive(option.value);setExpanded(true)}
    }
  };
  return <div ref={root} style={{position:'relative',display:'flex',flexDirection:'column',gap:6,minWidth:0,width:width??'100%'}}>
    {label?<label id={rid+'-label'} htmlFor={rid} style={{font:'var(--ds-type-caption)',fontWeight:'var(--ds-weight-medium)',color:'var(--ds-fg-muted)'}}>{label}{required?<span aria-hidden="true" style={{color:'var(--ds-danger-solid)',marginLeft:3}}>*</span>:null}</label>:null}
    <div data-ds-field={message?'error':'default'} data-ds-field-disabled={disabled||undefined} style={{minWidth:0,background:disabled?'var(--ds-surface-disabled)':'var(--ds-surface)',transition:'var(--ds-transition-control)'}}>
      <button {...rest} ref={setRef} id={rid} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={open?listId:undefined}
        aria-activedescendant={open&&activeOption?rid+'-option-'+opts.findIndex(option=>option.value===active):undefined}
        aria-label={ariaLabel} aria-labelledby={labelIds} aria-describedby={description} aria-invalid={message?true:rest['aria-invalid']} aria-required={required||undefined} disabled={disabled}
        onKeyDown={key} onFocus={onFocus} onBlur={event=>{if(!root.current?.contains(event.relatedTarget))close();onBlur?.(event)}}
        onClick={event=>{rest.onClick?.(event);if(event.defaultPrevented)return;if(open)close();else show(false)}}
        style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',width:'100%',minWidth:0,minHeight:'var(--ds-field-h)',border:0,borderRadius:'var(--ds-radius-field)',padding:'0 10px',background:'transparent',outline:'none',font:'var(--ds-type-body)',textAlign:'left',color:disabled?'var(--ds-fg-disabled)':current?'var(--ds-fg)':'var(--ds-fg-muted)',cursor:disabled?'not-allowed':'pointer',...rest.style}}>
        <span style={{flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{current?.label||emptyLabel}</span><DsIcon name="expand_more" size="var(--ds-icon)"/>
      </button>
    </div>
    <select ref={native} tabIndex={-1} aria-hidden="true" name={name} form={form} required={required} disabled={disabled} value={selected} onChange={event=>choose(opts.find(option=>option.value===event.target.value))}
      onInvalid={event=>{event.preventDefault();setInvalid(true);trigger.current?.focus()}} style={{display:'none'}}>
      <option value="">{emptyLabel}</option>{opts.map(option=><option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
    </select>
    {message||hint?<span id={rid+'-description'} style={{font:'var(--ds-type-caption)',color:message?'var(--ds-danger-fg)':'var(--ds-fg-subtle)'}}>{message||hint}</span>:null}
    {open?<div ref={panel} id={listId} role="listbox" aria-labelledby={labelIds} aria-label={labelIds?undefined:ariaLabel||emptyLabel} popover="manual"
      style={{position:'fixed',inset:'auto',left:position.left,top:position.top,width:position.width,maxWidth:'calc(100vw - 16px)',maxHeight:position.maxHeight,overflowY:'auto',margin:0,zIndex:60,padding:'var(--ds-gap-xs)',background:'var(--ds-surface-raised)',color:'var(--ds-fg)',border:'1px solid var(--ds-border)',borderRadius:'var(--ds-radius-md)',boxShadow:'var(--ds-shadow-md)'}}>
      {opts.map((option,index)=><div key={option.value} id={rid+'-option-'+index} role="option" aria-selected={selected===option.value} aria-disabled={option.disabled||undefined} data-ds-select-option="" data-ds-active={!option.disabled&&active===option.value||undefined} data-ds-selected={selected===option.value||undefined}
        onPointerDown={event=>event.preventDefault()} onMouseEnter={()=>{if(!option.disabled)setActive(option.value)}} onClick={()=>{if(!option.disabled){choose(option);trigger.current?.focus()}}} style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',minHeight:'var(--ds-control-h)',padding:'var(--ds-pad-tight) var(--ds-pad-sm)',borderRadius:'var(--ds-radius-xs)',font:'var(--ds-type-body)',cursor:option.disabled?'not-allowed':'pointer',color:option.disabled?'var(--ds-fg-disabled)':'var(--ds-fg)'}}>
        <span style={{flex:1,minWidth:0,overflowWrap:'anywhere'}}>{option.label}</span>{selected===option.value?<DsIcon name="check" size="var(--ds-icon-sm)"/>:null}
      </div>)}
      {!opts.length?<div style={{padding:'var(--ds-pad-sm)',font:'var(--ds-type-caption)',color:'var(--ds-fg-muted)'}}>{S.selectField.empty}</div>:null}
    </div>:null}
  </div>;
});
