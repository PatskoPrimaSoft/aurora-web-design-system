import React from 'react';
import {useDsStrings} from '../primitives/DsStrings.jsx';

/** Измеримый либо неопределённый прогресс длительной операции. */
export function DsProgressBar({label,value,max=100,valueText,showValue=true,tone='primary',id,style}){
  const S=useDsStrings(),limit=Number.isFinite(max)&&max>0?max:100,known=typeof value==='number'&&Number.isFinite(value);
  const current=known?Math.max(0,Math.min(limit,value)):null,percent=known?Math.round(current/limit*100):null;
  const text=valueText||(known?S.progress.percent(percent):S.loading);
  return <div id={id} style={{minWidth:0,...style}}>
    <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:'var(--ds-gap-sm)',marginBottom:'var(--ds-gap-xs)',font:'var(--ds-type-caption)',color:'var(--ds-fg)',overflowWrap:'anywhere'}}>
      <span>{label}</span>{showValue?<span>{text}</span>:null}
    </div>
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={known?current:undefined} aria-valuetext={text}
      style={{height:6,overflow:'hidden',borderRadius:'var(--ds-radius-circle)',background:'var(--ds-border)',position:'relative'}}>
      <div data-ds-progress-fill="" data-indeterminate={!known} style={{height:'100%',width:known?(current/limit*100)+'%':'35%',borderRadius:'inherit',background:tone==='success'?'var(--ds-success-solid)':'var(--ds-brand)'}}/>
    </div>
  </div>;
}
