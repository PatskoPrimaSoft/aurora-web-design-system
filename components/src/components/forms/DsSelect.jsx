import React from 'react';
import { DsIcon } from '../primitives/DsIcon.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';
import { DsChip } from '../data/DsChip.jsx';
import { CheckMark } from './CheckMark.jsx';
import { DsSpinner } from '../feedback/DsSpinner.jsx';
import { useDsLayer } from '../layout/DsDialog.jsx';

/** Выбор одного или нескольких значений из системного списка. */
export const DsSelect=React.forwardRef(function DsSelect({label,options=[],value,defaultValue='',onChange,placeholder,hint,error,disabled=false,required=false,name,form,id,width,maxHeight=320,searchable=false,clearable=false,loading=false,multiple=false,onFocus,onBlur,onKeyDown,'aria-label':ariaLabel,'aria-labelledby':labelledBy,'aria-describedby':describedBy,...rest},ref){
  const S=useDsStrings(),uid=React.useId(),rid=id||'ds-select-'+uid.replace(/:/g,''),listId=rid+'-list';
  const normalize=option=>typeof option==='string'?{value:option,label:option}:option;
  const groups=options.map((item,index)=>item.options?{label:item.label,id:index,options:item.options.map(normalize)}:{id:index,options:[normalize(item)]});
  const opts=groups.flatMap(group=>group.options);
  const [query,setQuery]=React.useState(''),[keyboard,setKeyboard]=React.useState(false),[fullText,setFullText]=React.useState('');
  const filtered=groups.map(group=>({...group,options:group.options.filter(option=>option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))})).filter(group=>group.options.length);
  const visible=filtered.flatMap(group=>group.options);
  const enabled=loading?[]:visible.filter(option=>!option.disabled);
  const initial=multiple?(Array.isArray(defaultValue)?defaultValue:[]):defaultValue;
  const [local,setLocal]=React.useState(initial),selected=value===undefined?local:value;
  const selectedValues=multiple?(Array.isArray(selected)?selected:[]):selected?[selected]:[];
  const hasSelection=selectedValues.length>0,isSelected=option=>selectedValues.includes(option.value);
  const selectedOptions=selectedValues.map(value=>opts.find(option=>option.value===value)||{value,label:value});
  const current=opts.find(option=>option.value===selected);
  const [expanded,setExpanded]=React.useState(false),open=expanded&&!disabled;
  const [active,setActive]=React.useState(null),[invalid,setInvalid]=React.useState(false);
  const root=React.useRef(null),trigger=React.useRef(null),panel=React.useRef(null),native=React.useRef(null),search=React.useRef({text:'',at:0}),searchInput=React.useRef(null),valueText=React.useRef(null),field=React.useRef(null);
  const [position,setPosition]=React.useState({left:0,top:0,width:240,maxHeight});
  const message=error||(invalid?S.selectField.required:undefined),emptyLabel=placeholder??S.selectField.placeholder;
  const labelIds=labelledBy||(!ariaLabel&&label?rid+'-label':undefined);
  const description=[...new Set([describedBy,multiple?rid+'-selection':null,(message||hint)?rid+'-description':null].filter(Boolean).join(' ').split(/\s+/).filter(Boolean))].join(' ')||undefined;
  const activeOption=enabled.find(option=>option.value===active)||(open?(enabled.find(isSelected)||enabled[0]):undefined);
  const setRef=React.useCallback(node=>{trigger.current=node;if(typeof ref==='function')ref(node);else if(ref)ref.current=node},[ref]);
  const close=()=>{setExpanded(false);setQuery('');setFullText('');search.current={text:'',at:0}};
  const reveal=node=>setFullText(node&&node.scrollWidth>node.clientWidth?node.textContent:'');
  const update=next=>{setInvalid(false);if(value===undefined)setLocal(next);onChange?.(next,multiple?next.map(value=>opts.find(option=>option.value===value)||{value,label:value}):opts.find(option=>option.value===next)||null)};
  const clear=()=>{update(multiple?[]:'');close();trigger.current?.focus()};
  const remove=option=>{if(disabled||loading)return;update(selectedValues.filter(value=>value!==option.value));if(open&&searchable)searchInput.current?.focus();else trigger.current?.focus()};
  const choose=option=>{if(!option||option.disabled||loading)return;if(multiple){update(isSelected(option)?selectedValues.filter(value=>value!==option.value):[...selectedValues,option.value]);if(searchable)searchInput.current?.focus();else trigger.current?.focus()}else{if(option.value!==selected)update(option.value);close();trigger.current?.focus()}};
  const show=last=>{const option=enabled.find(isSelected)||(last?enabled[enabled.length-1]:enabled[0]);setActive(option?.value??null);setKeyboard(false);setExpanded(true)};
  useDsLayer(open,close);
  React.useEffect(()=>{if(disabled)close()},[disabled]);
  React.useEffect(()=>{if(!open)return;if(!enabled.some(option=>option.value===active))setActive((enabled.find(isSelected)||enabled[0])?.value??null)},[open,active,selected,options,query,loading]);
  React.useEffect(()=>{
    const node=native.current;if(!node?.form)return;
    let resetTimer;const owner=node.form;
    // Native reset completes after dispatch; synchronize values in the following task.
    const reset=event=>{clearTimeout(resetTimer);resetTimer=setTimeout(()=>{if(event.defaultPrevented||native.current!==node)return;const next=value===undefined?initial:value;if(value===undefined)setLocal(next);if(multiple){for(const option of node.options)option.selected=next.includes(option.value)}else node.value=next;setInvalid(false);close()},0)};
    owner.addEventListener('reset',reset);return()=>{clearTimeout(resetTimer);owner.removeEventListener('reset',reset)};
  },[value,defaultValue,form,multiple]);
  React.useEffect(()=>{
    if(!open)return;const away=event=>{if(!root.current?.contains(event.target))close()};
    document.addEventListener('pointerdown',away);return()=>document.removeEventListener('pointerdown',away);
  },[open]);
  React.useLayoutEffect(()=>{
    if(!open||!panel.current)return;const node=panel.current;if(node.showPopover)node.showPopover();if(searchable)searchInput.current?.focus();
    const place=()=>{
      const rect=field.current?.getBoundingClientRect();if(!rect)return;
      const viewWidth=document.documentElement.clientWidth||window.innerWidth,edge=8,gap=6;
      const below=Math.max(0,window.innerHeight-rect.bottom-gap-edge),above=Math.max(0,rect.top-gap-edge);
      const desired=Math.min(maxHeight,node.scrollHeight||maxHeight),up=below<desired&&above>below;
      const cap=Math.min(maxHeight,up?above:below),width=Math.min(Math.max(rect.width,160),viewWidth-2*edge);
      const next={left:Math.max(edge,Math.min(rect.left,viewWidth-width-edge)),top:Math.max(edge,up?rect.top-gap-Math.min(desired,cap):rect.bottom+gap),width,maxHeight:cap};
      setPosition(previous=>Object.keys(next).every(key=>previous[key]===next[key])?previous:next);
    };
    place();const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(place):null;
    observer?.observe(node);observer?.observe(field.current);window.addEventListener('resize',place);document.addEventListener('scroll',place,true);
    return()=>{observer?.disconnect();window.removeEventListener('resize',place);document.removeEventListener('scroll',place,true);if(node.hidePopover&&node.matches(':popover-open'))node.hidePopover()};
  },[open,maxHeight,searchable]);
  React.useLayoutEffect(()=>{
    if(!open||!activeOption)return;const index=opts.findIndex(option=>option.value===activeOption.value);
    panel.current?.querySelector('[id="'+rid+'-option-'+index+'"]')?.scrollIntoView({block:'nearest'});
  const text=panel.current?.querySelector('[id="'+rid+'-option-'+index+'"] [data-ds-select-label]');if(keyboard)reveal(text);
  },[open,active,keyboard,query]);
  const key=event=>{
    onKeyDown?.(event);if(event.defaultPrevented||disabled)return;
    const searching=event.target===searchInput.current;
    const index=enabled.findIndex(option=>option.value===active);
    const move=index=>(setKeyboard(true),setActive(enabled[Math.max(0,Math.min(enabled.length-1,index))]?.value??null));
    if(event.key==='Escape'&&!open&&fullText){event.preventDefault();setFullText('');return}
    if(event.key==='Escape'&&open){event.preventDefault();close();trigger.current?.focus();return}
    if(event.key==='Tab'){if(open){if(!multiple&&activeOption)choose(activeOption);else{close();if(searching)trigger.current?.focus()}}return}
    if(event.key==='Enter'||(event.key===' '&&!searching)){event.preventDefault();if(open){if(activeOption)choose(activeOption);else close()}else show(false);return}
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();if(event.altKey&&event.key==='ArrowUp'&&open){if(multiple){close();trigger.current?.focus()}else choose(activeOption);return}
      if(!open){show(event.key==='ArrowUp');setKeyboard(true)}else if(!event.altKey)move(index+(event.key==='ArrowDown'?1:-1));return;
    }
    if(!searching&&(event.key==='Home'||event.key==='End'||event.key==='PageDown'||event.key==='PageUp')){
      event.preventDefault();if(!open)setExpanded(true);move(event.key==='Home'?0:event.key==='End'?enabled.length-1:index+(event.key==='PageDown'?10:-10));return;
    }
    if(!searching&&!open&&multiple&&hasSelection&&event.key==='Backspace'&&!loading){event.preventDefault();remove(selectedOptions[selectedOptions.length-1]);return}
    if(!searching&&!open&&clearable&&hasSelection&&(event.key==='Delete'||event.key==='Backspace')&&!loading){event.preventDefault();clear();return}
    if(!searching&&event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){
      event.preventDefault();const now=Date.now(),letter=event.key.toLocaleLowerCase(),text=now-search.current.at>700?letter:search.current.text+letter;
      search.current={text,at:now};const prefix=Array.from(text).every(char=>char===letter)?letter:text;
      const start=prefix.length===1?(open?index:enabled.findIndex(isSelected))+1:Math.max(0,index);
      const option=Array.from({length:enabled.length},(_,offset)=>enabled[(start+offset+enabled.length)%enabled.length]).find(option=>option.label.toLocaleLowerCase().startsWith(prefix));
      if(option){setActive(option.value);setKeyboard(true);setExpanded(true)}
    }
  };
  return <div ref={root} style={{position:'relative',display:'flex',flexDirection:'column',gap:6,minWidth:0,width:width??'100%'}}>
    {label?<label id={rid+'-label'} htmlFor={rid} style={{font:'var(--ds-type-caption)',fontWeight:'var(--ds-weight-medium)',color:'var(--ds-fg-muted)'}}>{label}{required?<span aria-hidden="true" style={{color:'var(--ds-danger-solid)',marginLeft:3}}>*</span>:null}</label>:null}
    <div ref={field} data-ds-field={message?'error':'default'} data-ds-field-disabled={disabled||undefined} style={{display:'flex',alignItems:'center',minWidth:0,background:disabled?'var(--ds-surface-disabled)':'var(--ds-surface)',transition:'var(--ds-transition-control)'}}>
      <div style={{display:'flex',alignItems:'center',flexWrap:multiple?'wrap':'nowrap',gap:'var(--ds-gap-xs)',flex:1,minWidth:0,padding:multiple?'var(--ds-gap-xs) 0 var(--ds-gap-xs) var(--ds-gap-sm)':undefined}}>
      {multiple?selectedOptions.map(option=><DsChip key={option.value} removable disabled={disabled||loading} ariaLabel={option.label} onRemove={()=>remove(option)}>{option.label}</DsChip>):null}
      <button {...rest} ref={setRef} id={rid} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={open?listId:undefined}
        aria-activedescendant={open&&activeOption?rid+'-option-'+opts.findIndex(option=>option.value===activeOption.value):undefined}
        aria-label={ariaLabel} aria-labelledby={labelIds} aria-describedby={description} aria-invalid={message?true:rest['aria-invalid']} aria-required={required||undefined} disabled={disabled}
        onKeyDown={key} onMouseEnter={()=>{if(!open)reveal(valueText.current)}} onMouseLeave={()=>setFullText('')} onFocus={event=>{if(!open)reveal(valueText.current);onFocus?.(event)}} onBlur={event=>{if(!root.current?.contains(event.relatedTarget)){close();onBlur?.(event)}}}
        onClick={event=>{rest.onClick?.(event);if(event.defaultPrevented)return;if(open)close();else show(false)}}
        style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',flex:1,width:'auto',minWidth:multiple&&!hasSelection?80:0,minHeight:multiple?'var(--ds-control-h-sm)':'var(--ds-field-h)',border:0,borderRadius:'var(--ds-radius-field)',padding:'0 10px',background:'transparent',outline:'none',font:'var(--ds-type-body)',textAlign:'left',color:disabled?'var(--ds-fg-disabled)':current?'var(--ds-fg)':'var(--ds-fg-muted)',cursor:disabled?'not-allowed':'pointer',...rest.style}}>
        <span ref={valueText} style={{flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{multiple?(hasSelection?'':emptyLabel):current?.label||emptyLabel}</span>
      </button>
      </div>
      {clearable&&hasSelection&&!disabled&&!loading?<button type="button" tabIndex={-1} aria-label={S.selectField.clear} onPointerDown={event=>event.preventDefault()} onClick={clear} data-ds-select-clear="" style={{display:'flex',alignItems:'center',justifyContent:'center',flex:'none',width:'var(--ds-control-h)',height:'var(--ds-control-h)',border:0,borderRadius:'var(--ds-radius-xs)',background:'transparent',color:'var(--ds-fg-muted)',cursor:'pointer'}}><DsIcon name="close" size="var(--ds-icon-sm)"/></button>:null}
      <span aria-hidden={loading?undefined:true} onPointerDown={event=>event.preventDefault()} onClick={()=>trigger.current?.click()} style={{display:'flex',alignItems:'center',flex:'none',paddingRight:10,cursor:disabled?'not-allowed':'pointer'}}>{loading?<DsSpinner size={16} label={S.selectField.loading}/>:<DsIcon name="expand_more" size="var(--ds-icon)"/>}</span>
    </div>
    <select ref={native} multiple={multiple} tabIndex={-1} aria-hidden="true" name={name} form={form} required={required} disabled={disabled} value={selected} onChange={event=>{if(multiple)update(Array.from(event.target.selectedOptions,option=>option.value));else choose(opts.find(option=>option.value===event.target.value))}}
      onInvalid={event=>{event.preventDefault();setInvalid(true);trigger.current?.focus()}} style={{display:'none'}}>
      {!multiple?<option value="">{emptyLabel}</option>:null}{opts.map(option=><option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
    </select>
    {multiple?<span id={rid+'-selection'} role="status" style={{position:'absolute',width:1,height:1,padding:0,overflow:'hidden',clipPath:'inset(50%)',whiteSpace:'nowrap'}}>{S.selectField.selection(selectedOptions.map(option=>option.label).join(', '))}</span>:null}
    {message||hint?<span id={rid+'-description'} style={{font:'var(--ds-type-caption)',color:message?'var(--ds-danger-fg)':'var(--ds-fg-subtle)'}}>{message||hint}</span>:null}
    {open?<div ref={panel} popover="manual" data-ds-select-popup="" onKeyDown={event=>{if(event.target===searchInput.current)key(event)}} onBlur={event=>{if(!root.current?.contains(event.relatedTarget)){close();onBlur?.(event)}}}
      style={{position:'fixed',inset:'auto',left:position.left,top:position.top,width:position.width,maxWidth:'calc(100vw - 16px)',maxHeight:position.maxHeight,overflowY:'auto',margin:0,zIndex:60,padding:'var(--ds-gap-xs)',background:'var(--ds-surface-raised)',color:'var(--ds-fg)',border:'1px solid var(--ds-border)',borderRadius:'var(--ds-radius-md)',boxShadow:'var(--ds-shadow-md)'}}>
      {searchable?<input ref={searchInput} type="search" role="searchbox" aria-label={S.selectField.search} aria-controls={listId} aria-activedescendant={activeOption?rid+'-option-'+opts.findIndex(option=>option.value===activeOption.value):undefined} value={query} onChange={event=>{setQuery(event.target.value);setKeyboard(true)}} placeholder={S.selectField.search} style={{boxSizing:'border-box',width:'100%',minHeight:'var(--ds-control-h)',padding:'var(--ds-pad-sm)',marginBottom:'var(--ds-gap-xs)',font:'var(--ds-type-body)',background:'var(--ds-surface)',color:'var(--ds-fg)',border:'var(--ds-border-width) solid var(--ds-border-field)',borderRadius:'var(--ds-radius-xs)'}}/>:null}
      <div id={listId} role="listbox" aria-multiselectable={multiple||undefined} aria-labelledby={labelIds} aria-label={labelIds?undefined:ariaLabel||emptyLabel} aria-busy={loading||undefined}>
      {loading?<div role="presentation" style={{padding:'var(--ds-pad-sm)',font:'var(--ds-type-caption)',color:'var(--ds-fg-muted)'}}>{S.selectField.loading}</div>:filtered.map((group,groupIndex)=><div key={group.id} role={group.label?'group':'presentation'} aria-label={group.label}>
        {group.label?<div role="presentation" style={{paddingTop:groupIndex===0?'var(--ds-gap-sm)':'var(--ds-gap-md)',paddingBottom:'var(--ds-gap-xs)',paddingLeft:'var(--ds-pad-sm)',paddingRight:'var(--ds-pad-sm)',font:'var(--ds-type-caption)',fontWeight:'var(--ds-weight-medium)',color:'var(--ds-fg-muted)'}}>{group.label}</div>:null}
        {group.options.map(option=>{const index=opts.findIndex(item=>item.value===option.value);return <div key={option.value} id={rid+'-option-'+index} role="option" aria-selected={isSelected(option)} aria-disabled={option.disabled||undefined} data-ds-select-option="" data-ds-active={!option.disabled&&active===option.value||undefined} data-ds-keyboard={keyboard||undefined} data-ds-selected={isSelected(option)||undefined}
          onPointerDown={event=>event.preventDefault()} onPointerMove={event=>{if(event.movementX||event.movementY){setKeyboard(false);reveal(event.currentTarget.querySelector('[data-ds-select-label]'));if(!option.disabled)setActive(option.value)}}} onMouseLeave={()=>setFullText('')} onClick={()=>choose(option)} style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',minHeight:'var(--ds-control-h)',padding:'var(--ds-pad-tight) var(--ds-pad-sm)',borderRadius:'var(--ds-radius-xs)',font:'var(--ds-type-body)',cursor:option.disabled?'not-allowed':'pointer',color:option.disabled?'var(--ds-fg-disabled)':'var(--ds-fg)'}}>
          {multiple?<CheckMark state={isSelected(option)?'checked':'unchecked'} disabled={option.disabled} hover={!keyboard&&active===option.value}/>:null}
          <span data-ds-select-label="" style={{flex:1,minWidth:0,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{option.label}</span>{!multiple&&isSelected(option)?<DsIcon name="check" size="var(--ds-icon-sm)"/>:null}
        </div>})}
      </div>)}
      {!loading&&!visible.length?<div role="presentation" style={{padding:'var(--ds-pad-sm)',font:'var(--ds-type-caption)',color:'var(--ds-fg-muted)'}}>{opts.length?S.selectField.noResults:S.selectField.empty}</div>:null}
      </div>
      {fullText?<div role="tooltip" style={{position:'sticky',bottom:0,padding:'var(--ds-pad-sm)',background:'var(--ds-surface-raised)',color:'var(--ds-fg)',borderTop:'1px solid var(--ds-border)',font:'var(--ds-type-caption)',overflowWrap:'anywhere',pointerEvents:'none'}}>{fullText}</div>:null}
    </div>:null}
    {fullText&&!open?<div role="tooltip" style={{position:'absolute',top:open?'auto':'100%',bottom:open?'100%':'auto',left:0,maxWidth:'100%',padding:'var(--ds-pad-sm)',background:'var(--ds-surface-raised)',color:'var(--ds-fg)',boxShadow:'var(--ds-shadow-md)',borderRadius:'var(--ds-radius-xs)',font:'var(--ds-type-caption)',overflowWrap:'anywhere',zIndex:61,pointerEvents:'none'}}>{fullText}</div>:null}
  </div>;
});
