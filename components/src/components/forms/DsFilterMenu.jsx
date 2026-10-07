import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { DsField } from './DsField.jsx';
import { DsCheckbox } from './DsCheckbox.jsx';
import { useDsLayer } from '../layout/DsDialog.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

/* Значение фильтра и строка поля — разные вещи. Пусто — это только null / undefined:
   0, отрицательное число и диапазон от нуля — настоящие значения, поэтому никакого `||`.
   Контракт: number → number | null; number-range → {from, to}, каждое number | null;
   date / date-range → строка 'YYYY-MM-DD' | null. Стёртое поле даёт null, а не ''. */
const toField=v=>v==null?'':String(v);
const fromNumberField=s=>{if(s===''||s==null)return null;const n=Number(s);return Number.isFinite(n)?n:null};
const fromTextField=s=>s===''||s==null?null:s;

/** Popover that edits one filter. Covers every v1 CommonFilter type. */
export function DsFilterMenu({label,type='string',value,options=[],onApply,onClear,trigger,width=260}){
  const S=useDsStrings();
  const [open,setOpen]=React.useState(false);
  const [draft,setDraft]=React.useState(value);
  const ref=React.useRef(null);
  React.useEffect(()=>{setDraft(value)},[value,open]);
  /* Поповер фильтра — маленький диалог: при открытии фокус уходит в первое поле,
     Escape (через общий стек слоёв) закрывает его и возвращает фокус на кнопку. */
  const popRef=React.useRef(null),popId=React.useId();
  const triggerEl=()=>ref.current&&ref.current.querySelector('button,[tabindex]');
  const close=restore=>{setOpen(false);if(restore){const t=triggerEl();if(t&&t.focus)t.focus()}};
  useDsLayer(open,()=>close(true));
  React.useEffect(()=>{if(!open)return;
    const first=popRef.current&&popRef.current.querySelector('input,select,textarea,button');
    if(first)first.focus();
    const away=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};
    document.addEventListener('mousedown',away);
    return()=>document.removeEventListener('mousedown',away);},[open]);
  /* '' внутри значения — наследие строковых полей; пустым считается и оно, и null. */
  const blank=v=>v==null||v==='';
  const active=!blank(value)&&!(Array.isArray(value)&&!value.length)
    &&!(typeof value==='object'&&!Array.isArray(value)&&blank(value.key)&&blank(value.from)&&blank(value.to));
  const set=v=>setDraft(v);
  const body=()=>{
    if(type==='string')return <DsField placeholder={S.filter.contains} value={toField(draft)} onChange={e=>set(fromTextField(e.target.value))}/>;
    if(type==='number')return <DsField type="number" placeholder="0" mono value={toField(draft)} onChange={e=>set(fromNumberField(e.target.value))}/>;
    if(type==='number-range'||type==='date-range'){
      const isDate=type==='date-range';
      const parse=isDate?fromTextField:fromNumberField;
      const r=draft&&typeof draft==='object'?draft:{from:null,to:null};
      return <div style={{display:'flex',gap:'var(--ds-gap-sm)'}}>
        <DsField label={S.filter.from} type={isDate?'date':'number'} mono value={toField(r.from)} onChange={e=>set({...r,from:parse(e.target.value)})}/>
        <DsField label={S.filter.to} type={isDate?'date':'number'} mono value={toField(r.to)} onChange={e=>set({...r,to:parse(e.target.value)})}/></div>;
    }
    if(type==='date')return <DsField type="date" value={toField(draft)} onChange={e=>set(fromTextField(e.target.value))}/>;
    if(type==='radio'||type==='sort-by'){
      /* sort-by carries a direction when the caller holds the value as {key,dir}:
         the field is the radio list, the direction is one pair below it. Never a
         flat list of field×direction options — that is the backend enum, not a menu.
         An option with `group:true` ("By group") is a grouping, so it has no direction. */
      const two=draft&&typeof draft==='object';
      const key=two?draft.key:draft;
      const cur=options.find(o=>(typeof o==='string'?o:o.value)===key);
      const grouping=!!(cur&&typeof cur==='object'&&cur.group);
      const dirBtn=on=>({flex:1,height:'var(--ds-control-h-sm)',padding:'0 8px',font:'var(--ds-type-ui)',cursor:'pointer',
        border:'1px solid '+(on?'var(--ds-brand-border)':'var(--ds-border-field)'),borderRadius:'var(--ds-radius-control)',
        background:on?'var(--ds-brand-subtle)':'var(--ds-surface)',color:on?'var(--ds-brand-text)':'var(--ds-fg-muted)',
        display:'inline-flex',alignItems:'center',justifyContent:'center',gap:4});
      return <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {options.map(o=>{const v=typeof o==='string'?o:o.value,l=typeof o==='string'?o:o.label;
          return <DsCheckbox key={v} radio name="dsfm" label={l} state={key===v?'checked':'unchecked'}
            onChange={()=>set(two?{key:v,dir:(typeof o==='object'&&o.group)?null:(draft.dir||'asc')}:v)}/>;})}
        {two&&!grouping?<div style={{display:'flex',gap:6,borderTop:'1px solid var(--ds-divider)',paddingTop:6}}>
          <button type="button" style={dirBtn(draft.dir!=='desc')} onClick={()=>set({...draft,dir:'asc'})}>
            <Icon name="arrow_upward" size="var(--ds-icon-xs)"/>{(cur&&cur.asc)||S.filter.asc}</button>
          <button type="button" style={dirBtn(draft.dir==='desc')} onClick={()=>set({...draft,dir:'desc'})}>
            <Icon name="arrow_downward" size="var(--ds-icon-xs)"/>{(cur&&cur.desc)||S.filter.desc}</button></div>:null}
      </div>;
    }
    const arr=Array.isArray(draft)?draft:[];
    return <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:200,overflowY:'auto'}}>
      {options.map(o=>{const v=typeof o==='string'?o:o.value,l=typeof o==='string'?o:o.label,c=typeof o==='object'?o.count:null;
        return <DsCheckbox key={v} label={l} description={c!=null?S.objects(c):undefined} state={arr.includes(v)?'checked':'unchecked'}
          onChange={()=>set(arr.includes(v)?arr.filter(x=>x!==v):[...arr,v])}/>;})}</div>;
  };
  const btn={display:'inline-flex',alignItems:'center',gap:6,height:'var(--ds-control-h)',padding:'0 10px',
    font:'var(--ds-type-ui)',cursor:'pointer',borderRadius:'var(--ds-radius-control)',
    border:'1px solid '+(active?'var(--ds-brand-border)':'var(--ds-border-field)'),
    background:active?'var(--ds-brand-subtle)':'var(--ds-surface)',
    color:active?'var(--ds-brand-text)':'var(--ds-fg)',transition:'var(--ds-transition-control)'};
  return <span ref={ref} style={{position:'relative',display:'inline-flex'}}>
    <span onClick={()=>setOpen(!open)} style={{display:'inline-flex'}}>
      {trigger||<button type="button" style={btn} aria-expanded={open} aria-haspopup="dialog" aria-controls={open?popId:undefined}>
        {active?<Icon name="filter_alt" size="var(--ds-icon-sm)"/>:null}{label}<Icon name="expand_more" size="var(--ds-icon-sm)"/></button>}</span>
    {open?<div ref={popRef} id={popId} role="dialog" aria-label={label} style={{position:'absolute',top:'calc(100% + 6px)',left:0,zIndex:40,width,
      padding:'var(--ds-pad-md)',display:'flex',flexDirection:'column',gap:'var(--ds-gap-sm-plus)',
      background:'var(--ds-surface-raised)',border:'1px solid var(--ds-border)',
      borderRadius:'var(--ds-radius-md)',boxShadow:'var(--ds-shadow-md)'}}>
      <span style={{font:'var(--ds-type-eyebrow)',letterSpacing:'var(--ds-tracking-eyebrow)',
        textTransform:'uppercase',color:'var(--ds-fg-subtle)'}}>{label}</span>
      {body()}
      <div style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',borderTop:'1px solid var(--ds-divider)',paddingTop:'var(--ds-gap-sm)'}}>
        <button type="button" onClick={()=>{onClear&&onClear();close(true)}}
          style={{border:'none',background:'transparent',font:'var(--ds-type-ui)',color:'var(--ds-fg-muted)',
            cursor:'pointer',padding:'0 4px'}}>{S.clear}</button>
        <button type="button" onClick={()=>{onApply&&onApply(draft);close(true)}}
          style={{marginLeft:'auto',height:'var(--ds-control-h-sm)',padding:'0 12px',border:'none',
            borderRadius:'var(--ds-radius-control)',background:'var(--ds-brand)',color:'var(--ds-on-brand)',
            font:'var(--ds-type-ui)',cursor:'pointer'}}>{S.apply}</button></div>
    </div>:null}</span>;
}
