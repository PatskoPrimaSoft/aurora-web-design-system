import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

const srOnly={position:'absolute',width:1,height:1,padding:0,margin:-1,overflow:'hidden',clipPath:'inset(50%)',whiteSpace:'nowrap',border:0};

/** Horizontal step indicator with optional return to completed steps. */
export function DsStepper({steps=[],active=0,onSelect,completed,isComplete=false,ariaLabel}){
  const S=useDsStrings();
  const listRef=React.useRef(null);
  React.useLayoutEffect(()=>{
    const list=listRef.current,current=list?.querySelector('[aria-current="step"]');
    if(!current)return;
    // Scroll only this rail: scrollIntoView would also move the surrounding page.
    const reveal=()=>{
      const rail=list.getBoundingClientRect(),step=current.getBoundingClientRect();
      const style=getComputedStyle(list),inset=parseFloat(style.paddingLeft)||0;
      const left=rail.left+inset,right=rail.right-inset;
      if(step.width>right-left||step.left<left)list.scrollLeft+=step.left-left;
      else if(step.right>right)list.scrollLeft+=step.right-right;
    };
    reveal();
    const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(reveal);
    observer?.observe(list);observer?.observe(current);
    window.addEventListener('resize',reveal);
    return ()=>{observer?.disconnect();window.removeEventListener('resize',reveal);};
  },[active,isComplete,steps]);
  const done=i=>isComplete||(completed?completed.includes(i):i<active);
  return <ol ref={listRef} aria-label={ariaLabel||S.stepper.label} style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',margin:0,
    padding:'calc(var(--ds-focus-width) + var(--ds-focus-offset))',listStyle:'none',minWidth:0,overflowX:'auto',scrollbarWidth:'thin',scrollbarColor:'var(--ds-border-strong) var(--ds-surface)'}}>
    {steps.map((s,i)=>{const cur=!isComplete&&i===active,fin=done(i),clickable=!!onSelect&&!s.disabled&&(fin||cur);
      const ring=cur?'var(--ds-brand)':fin?'var(--ds-success-solid)':'var(--ds-border-strong)';
      const Step=onSelect?'button':'span';
      const status=[S.stepper.position(i+1,steps.length),cur?S.stepper.current:fin?S.stepper.completed:S.stepper.upcoming,
        s.disabled?S.stepper.disabled:null].filter(Boolean).join(', ');
      return <li key={s.id||i} style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',flex:'none',minWidth:0}}>
        <Step data-ds-stepper-step="" type={onSelect?'button':undefined} disabled={onSelect?!clickable:undefined}
          onClick={clickable?()=>onSelect(i):undefined} aria-current={cur?'step':undefined}
          style={{position:'relative',display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',padding:4,border:'none',
            borderRadius:'var(--ds-radius-control)',cursor:clickable?'pointer':'default',minWidth:0,textAlign:'left'}}>
          <span aria-hidden="true" style={{flex:'none',display:'inline-flex',alignItems:'center',justifyContent:'center',width:24,height:24,
            borderRadius:'50%',border:'var(--ds-border-width-strong) solid '+ring,
            background:cur?'var(--ds-brand)':fin?'var(--ds-success-solid)':'transparent',
            color:cur?'var(--ds-on-brand)':fin?'var(--ds-on-solid)':'var(--ds-fg-subtle)',font:'var(--ds-type-eyebrow)'}}>
            {fin&&!cur?<Icon name="check" size="var(--ds-icon-xs)"/>:i+1}</span>
          <span style={{minWidth:0}}>
            <span style={{display:'block',font:'var(--ds-type-ui)',whiteSpace:'nowrap',
              color:s.disabled?'var(--ds-fg-muted)':cur?'var(--ds-brand-text)':fin?'var(--ds-fg)':'var(--ds-fg-muted)'}}>{s.label}</span>
            {s.hint?<span style={{display:'block',font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)',whiteSpace:'nowrap'}}>{s.hint}</span>:null}
          </span>
          <span style={srOnly}>, {status}</span>
        </Step>
        {i<steps.length-1?<span aria-hidden="true" style={{flex:'none',width:32,height:1,
          background:fin?'var(--ds-success-line)':'var(--ds-border)'}}/>:null}
      </li>;})}
  </ol>;
}
