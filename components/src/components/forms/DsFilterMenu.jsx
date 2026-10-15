import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { DsField } from './DsField.jsx';
import { CheckMark } from './CheckMark.jsx';
import { DsIconButton } from '../buttons/DsIconButton.jsx';
import { DsButton } from '../buttons/DsButton.jsx';
import { DsSpinner } from '../feedback/DsSpinner.jsx';
import { useDsLayer } from '../layout/DsDialog.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

const blank=v=>v==null||v==='';
const toField=v=>blank(v)?'':String(v);
const fromNumberField=s=>{if(blank(s))return null;const n=Number(s);return Number.isFinite(n)?n:null};
const fromTextField=s=>blank(s)?null:s;
const optionValue=o=>typeof o==='string'?o:o.value;
const optionText=o=>typeof o==='string'?o:o.label;

/** Applied filter value stays unchanged until Apply. */
export function DsFilterMenu({label,type='string',value,options=[],onApply,onClear,trigger,width=260,formatValue,searchable=false,loading=false,disabled=false,maxHeight=480}){
  const S=useDsStrings(),popId=React.useId(),ref=React.useRef(null),popRef=React.useRef(null),toRef=React.useRef(null);
  const [expanded,setOpen]=React.useState(false),open=expanded&&!disabled;
  const [draft,setDraft]=React.useState(value),[query,setQuery]=React.useState(''),[focused,setFocused]=React.useState(null),[attempted,setAttempted]=React.useState(false);
  const [position,setPosition]=React.useState({left:8,top:8,width,maxHeight});
  const name=label||S.filters,listType=['checkbox-list','radio','sort-by'].includes(type),radio=type!=='checkbox-list';
  const grouped=options.map((option,index)=>Array.isArray(option?.options)?{label:option.label,options:option.options,key:index}:{options:[option],key:index}).filter(group=>group.options.length);
  const flatOptions=grouped.flatMap(group=>group.options),term=query.trim().toLocaleLowerCase();
  const filtered=grouped.map(group=>({...group,options:group.options.filter(o=>optionText(o).toLocaleLowerCase().includes(term))})).filter(group=>group.options.length);
  const enabled=loading?[]:filtered.flatMap(group=>group.options).filter(o=>!o.disabled);
  const selected=Array.isArray(draft)?draft:[],two=type==='sort-by'&&draft&&typeof draft==='object',key=two?draft.key:draft;
  const first=enabled.find(o=>radio?optionValue(o)===key:selected.includes(optionValue(o)))||enabled[0];
  const tabValue=enabled.some(o=>optionValue(o)===focused)?focused:first&&optionValue(first);
  const rangeType=type==='number-range'||type==='date-range',range=draft&&typeof draft==='object'?draft:{from:null,to:null};
  const invalidRange=rangeType&&!blank(range.from)&&!blank(range.to)&&(type==='number-range'?Number(range.from)>Number(range.to):range.from>range.to);
  const error=attempted&&invalidRange?S.filter.rangeInvalid:undefined;
  const active=!blank(value)&&!(Array.isArray(value)&&!value.length)&&!(typeof value==='object'&&!Array.isArray(value)&&blank(value.key)&&blank(value.from)&&blank(value.to));
  const optionLabel=v=>{const o=flatOptions.find(o=>optionValue(o)===v);return o?optionText(o):String(v)};
  const summarize=()=>{
    if(!active)return '';
    if(formatValue)return formatValue(value);
    if(Array.isArray(value))return value.map(optionLabel).join(', ');
    if(rangeType)return !blank(value.from)&&!blank(value.to)?value.from+'–'+value.to:!blank(value.from)?S.filter.from+' '+value.from:S.filter.to+' '+value.to;
    if(type==='radio')return optionLabel(value);
    if(type==='sort-by'){
      const key=typeof value==='object'?value.key:value,o=flatOptions.find(o=>optionValue(o)===key);
      const dir=typeof value==='object'&&value.dir&&!o?.group?(o?.[value.dir]||S.filter[value.dir]):null;
      return optionLabel(key)+(dir?' · '+dir:'');
    }
    return String(value);
  };
  const summary=summarize(),compact=Array.isArray(value)&&value.length>1&&!formatValue?optionLabel(value[0])+' +'+(value.length-1):summary;
  const buttonName=name+(active?': '+summary:''),canClear=type!=='sort-by'&&active&&!!(onClear||onApply);
  const triggerEl=()=>ref.current?.querySelector('button,[tabindex]');
  const close=restore=>{setOpen(false);setQuery('');setAttempted(false);if(restore)triggerEl()?.focus()};
  const clear=()=>{if(disabled)return;if(onClear)onClear();else onApply?.(type==='checkbox-list'?[]:rangeType?{from:null,to:null}:null);close(true)};
  const apply=()=>{
    if(loading&&listType)return;
    if(invalidRange){setAttempted(true);toRef.current?.focus();return;}
    const invalid=popRef.current?.querySelector('input:invalid');if(invalid){invalid.reportValidity();invalid.focus();return;}
    onApply?.(draft);close(true);
  };
  const choose=o=>{if(o.disabled||loading)return;const v=optionValue(o);setDraft(radio?(two?{key:v,dir:o.group?null:draft.dir||'asc'}:v):selected.includes(v)?selected.filter(x=>x!==v):[...selected,v])};
  useDsLayer(open,()=>close(true));
  React.useEffect(()=>{setDraft(value)},[value,open]);
  React.useEffect(()=>{if(disabled)close(false)},[disabled]);
  React.useEffect(()=>{if(!open)return;setQuery('');setFocused(null);setAttempted(false);
    const first=popRef.current?.querySelector('input:not([disabled]),button:not([disabled])');first?.focus();
    const away=e=>{if(ref.current&&!ref.current.contains(e.target))close(false)};
    document.addEventListener('pointerdown',away);document.addEventListener('focusin',away);
    return()=>{document.removeEventListener('pointerdown',away);document.removeEventListener('focusin',away)};
  },[open]);
  React.useLayoutEffect(()=>{
    if(!open||!popRef.current)return;const node=popRef.current;
    if(node.showPopover)node.showPopover();
    const place=()=>{
      const rect=triggerEl()?.getBoundingClientRect();if(!rect)return;
      const edge=8,gap=6,viewWidth=document.documentElement.clientWidth||window.innerWidth,viewHeight=window.innerHeight;
      const below=Math.max(0,viewHeight-rect.bottom-gap-edge),above=Math.max(0,rect.top-gap-edge);
      const desired=Math.min(maxHeight,node.scrollHeight||maxHeight),up=below<desired&&above>below,cap=Math.min(maxHeight,up?above:below);
      const panelWidth=Math.min(width,Math.max(0,viewWidth-2*edge));
      const next={left:Math.max(edge,Math.min(rect.left,viewWidth-panelWidth-edge)),top:Math.max(edge,up?rect.top-gap-Math.min(desired,cap):rect.bottom+gap),width:panelWidth,maxHeight:cap};
      setPosition(previous=>Object.keys(next).every(key=>previous[key]===next[key])?previous:next);
    };
    place();const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(place):null;observer?.observe(node);if(ref.current)observer?.observe(ref.current);
    window.addEventListener('resize',place);document.addEventListener('scroll',place,true);
    return()=>{observer?.disconnect();window.removeEventListener('resize',place);document.removeEventListener('scroll',place,true);if(node.hidePopover&&node.matches(':popover-open'))node.hidePopover()};
  },[open,width,maxHeight]);
  const blur=e=>{
    if(e.relatedTarget&&!ref.current?.contains(e.relatedTarget))close(false);
  };
  const keys=e=>{
    if(e.defaultPrevented)return;
    const searching=e.target.type==='search',option=e.target.hasAttribute('data-ds-filter-input');
    if(listType&&(option||searching)&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)&&(!searching||e.key.startsWith('Arrow'))){
      e.preventDefault();const nodes=Array.from(popRef.current.querySelectorAll('[data-ds-filter-input]:not([disabled])'));
      const index=nodes.indexOf(e.target),next=e.key==='Home'?0:e.key==='End'?nodes.length-1:index<0?(e.key==='ArrowUp'?nodes.length-1:0):Math.max(0,Math.min(nodes.length-1,index+(e.key==='ArrowDown'?1:-1)));
      nodes[next]?.focus();nodes[next]?.closest('label')?.scrollIntoView({block:'nearest'});return;
    }
    if(e.key==='Enter'&&!listType&&e.target.tagName==='INPUT'){e.preventDefault();apply()}
  };
  const list=()=>{
    if(loading)return <div role="status" style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',padding:'var(--ds-pad-sm)',color:'var(--ds-fg-muted)'}}><span aria-hidden="true"><DsSpinner size={16}/></span>{S.selectField.loading}</div>;
    if(!filtered.length)return <p role="status" style={{margin:0,padding:'var(--ds-pad-sm)',font:'var(--ds-type-caption)',color:'var(--ds-fg-muted)'}}>{flatOptions.length?S.selectField.noResults:S.selectField.empty}</p>;
    return <div data-ds-filter-list="" role={radio?'radiogroup':undefined} aria-label={radio?name:undefined}>
      {filtered.map((group,groupIndex)=><div key={group.key} role={group.label?'group':undefined} aria-label={group.label}>
        {group.label?<div style={{paddingTop:groupIndex===0?'var(--ds-gap-sm)':'var(--ds-gap-md)',paddingBottom:'var(--ds-gap-xs)',paddingLeft:'var(--ds-pad-sm)',paddingRight:'var(--ds-pad-sm)',font:'var(--ds-type-caption)',fontWeight:'var(--ds-weight-medium)',color:'var(--ds-fg-muted)'}}>{group.label}</div>:null}
        {group.options.map((o,index)=>{
          const v=optionValue(o),l=optionText(o),checked=radio?key===v:selected.includes(v),count=o.count,description=o.description,off=!!o.disabled;
          const rid=popId+'-'+group.key+'-'+index,countId=rid+'-count',descId=rid+'-description';
          return <label key={v} data-ds-filter-option="" data-selected={checked} data-disabled={off} onPointerDown={off?e=>e.preventDefault():undefined} style={{position:'relative',display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',minHeight:'var(--ds-control-h)',padding:'var(--ds-gap-xs) var(--ds-pad-sm)',cursor:off?'not-allowed':'pointer',borderRadius:'var(--ds-radius-xs)'}}>
            <input data-ds-filter-input="" type={radio?'radio':'checkbox'} name={radio?popId+'-radio':undefined} checked={checked} disabled={off} tabIndex={v===tabValue?0:-1} aria-label={l} aria-describedby={[count!=null?countId:null,description?descId:null].filter(Boolean).join(' ')||undefined}
              onFocus={()=>setFocused(v)} onChange={()=>choose(o)} style={{position:'absolute',opacity:0,width:1,height:1,margin:0}}/>
            <CheckMark state={checked?'checked':'unchecked'} radio={radio} disabled={off}/>
            <span style={{minWidth:0,flex:1,font:'var(--ds-type-ui)',overflowWrap:'anywhere'}}>{l}{description?<span id={descId} style={{display:'block',font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)'}}>{description}</span>:null}</span>
            {count!=null?<span style={{flex:'none',font:'var(--ds-type-caption)',color:'var(--ds-fg-muted)'}}><span aria-hidden="true">{count}</span><span id={countId} style={{position:'absolute',width:1,height:1,overflow:'hidden',clipPath:'inset(50%)',whiteSpace:'nowrap'}}>{S.objects(count)}</span></span>:null}
          </label>;
        })}
      </div>)}
    </div>;
  };
  const body=()=>{
    if(type==='string')return <DsField label={name} hint={S.filter.contains} value={toField(draft)} onChange={e=>setDraft(fromTextField(e.target.value))}/>;
    if(type==='number')return <DsField label={name} type="number" mono value={toField(draft)} onChange={e=>setDraft(fromNumberField(e.target.value))}/>;
    if(type==='date')return <DsField label={name} type="date" value={toField(draft)} onChange={e=>setDraft(fromTextField(e.target.value))}/>;
    if(rangeType){const date=type==='date-range',parse=date?fromTextField:fromNumberField;
      return <div style={{display:'flex',flexWrap:'wrap',gap:'var(--ds-gap-sm)'}}>
        <DsField label={S.filter.from} type={date?'date':'number'} mono width="max(100px, calc((100% - var(--ds-gap-sm)) / 2))" value={toField(range.from)} onChange={e=>setDraft({...range,from:parse(e.target.value)})}/>
        <DsField ref={toRef} label={S.filter.to} type={date?'date':'number'} mono width="max(100px, calc((100% - var(--ds-gap-sm)) / 2))" value={toField(range.to)} error={error} onChange={e=>setDraft({...range,to:parse(e.target.value)})}/></div>;
    }
    const cur=flatOptions.find(o=>optionValue(o)===key);
    return <>{list()}{type==='sort-by'&&two&&!cur?.group&&!loading?<div style={{display:'flex',flexDirection:'column',gap:'var(--ds-gap-sm)',borderTop:'1px solid var(--ds-divider)',paddingTop:'var(--ds-gap-sm)',marginTop:'var(--ds-gap-sm)'}}>
      <DsButton size="sm" tone={draft.dir!=='desc'?'subtle':'secondary'} icon="arrow_upward" aria-pressed={draft.dir!=='desc'} onClick={()=>setDraft({...draft,dir:'asc'})} style={{flex:'none'}}>{cur?.asc||S.filter.asc}</DsButton>
      <DsButton size="sm" tone={draft.dir==='desc'?'subtle':'secondary'} icon="arrow_downward" aria-pressed={draft.dir==='desc'} onClick={()=>setDraft({...draft,dir:'desc'})} style={{flex:'none'}}>{cur?.desc||S.filter.desc}</DsButton></div>:null}</>;
  };
  return <span ref={ref} data-ds-filter-menu="" data-active={active} onBlur={blur} style={{position:'relative',display:'inline-flex',maxWidth:'100%',minWidth:0,borderRadius:'var(--ds-radius-md)',background:active&&!disabled?'var(--ds-brand-subtle)':undefined}}>
    <span onClick={()=>{if(!disabled)setOpen(!open)}} style={{display:'inline-flex',minWidth:0}}>
      {trigger||<DsButton data-ds-filter-trigger="" tone={active?'subtle':'secondary'} disabled={disabled} icon="filter_alt" aria-label={buttonName} title={active?buttonName:undefined} aria-expanded={open} aria-haspopup="dialog" aria-controls={open?popId:undefined}
        style={{borderColor:disabled?'var(--ds-border)':active?'var(--ds-brand-border)':'var(--ds-border-field)',borderTopRightRadius:canClear?0:'var(--ds-radius-md)',borderBottomRightRadius:canClear?0:'var(--ds-radius-md)'}}>
        <span style={{display:'inline-flex',alignItems:'center',gap:'var(--ds-gap-sm)',minWidth:0}}><span style={{minWidth:0,maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}{active?': '+compact:''}</span><span data-ds-filter-arrow="" style={{display:'inline-flex',flex:'none',transform:open?'rotate(180deg)':undefined,transition:'transform var(--ds-dur-fast) var(--ds-ease)'}}><Icon name="expand_more" size="var(--ds-icon-sm)"/></span></span>
      </DsButton>}
    </span>
    {canClear?<DsIconButton data-ds-filter-clear="" icon="close" disabled={disabled} label={S.clear+': '+name} onClick={clear} style={{border:'1px solid var(--ds-brand-border)',borderLeft:0,borderRadius:'0 var(--ds-radius-md) var(--ds-radius-md) 0',color:disabled?'var(--ds-fg-disabled)':'var(--ds-brand-text)'}}/>:null}
    {open?<div ref={popRef} popover="manual" data-ds-filter-popup="" id={popId} role="dialog" aria-label={name} onKeyDown={keys} style={{position:'fixed',inset:'auto',left:position.left,top:position.top,width:position.width,maxWidth:'calc(100vw - 16px)',maxHeight:position.maxHeight,boxSizing:'border-box',margin:0,zIndex:60,
      padding:'var(--ds-pad-md)',display:'flex',flexDirection:'column',gap:'var(--ds-gap-sm-plus)',overflow:'hidden',background:'var(--ds-surface-raised)',color:'var(--ds-fg)',border:'1px solid var(--ds-border)',borderRadius:'var(--ds-radius-md)',boxShadow:'var(--ds-shadow-md)'}}>
      {rangeType||listType&&type!=='checkbox-list'?<span style={{flex:'none',font:'var(--ds-type-eyebrow)',letterSpacing:'var(--ds-tracking-eyebrow)',textTransform:'uppercase',color:'var(--ds-fg-subtle)'}}>{name}</span>:null}
      {searchable&&listType?<div style={{flex:'none'}}><DsField type="search" label={S.selectField.search} value={query} onChange={e=>setQuery(e.target.value)}/></div>:null}
      <div aria-busy={listType&&loading||undefined} style={{minHeight:0,overflowY:'auto',overflowX:'hidden'}}>{body()}</div>
      <div style={{flex:'none',display:'flex',flexWrap:'wrap',alignItems:'center',gap:'var(--ds-gap-sm)',borderTop:'1px solid var(--ds-divider)',paddingTop:'var(--ds-gap-sm)'}}>
        <DsButton tone="ghost" size="sm" onClick={clear} style={{flexShrink:0}}>{type==='sort-by'&&onClear?S.filter.resetSort:S.clear}</DsButton>
        <DsButton tone="primary" size="sm" disabled={loading&&listType} onClick={apply} style={{marginLeft:'auto',flexShrink:0}}>{S.apply}</DsButton>
      </div>
    </div>:null}
  </span>;
}
