import React from 'react';
import { useDsStrings } from '../primitives/DsStrings.jsx';

const dsBands=S=>[{to:33,label:S.score.bad,tone:'danger'},{to:66,label:S.score.norm,tone:'warning'},{to:90,label:S.score.good,tone:'success'},{to:100,label:S.score.best,tone:'success'}];
const Ds_BAND_C={danger:'var(--ds-danger-solid)',warning:'var(--ds-warning-solid)',success:'var(--ds-success-solid)',
  info:'var(--ds-info-solid)',neutral:'var(--ds-neutral-solid)'};

/** Banded rating meter — one value read against named bands. The eco-driving rate. */
export function DsScoreBar({value,min=0,max=100,bands:bandsProp,unit,label,showValue=true,showScale=false,height=8,style}){
  const S=useDsStrings();
  const bands=bandsProp||dsBands(S);
  const has=typeof value==='number'&&!Number.isNaN(value);
  const pc=v=>Math.max(0,Math.min(100,(v-min)/(max-min||1)*100));
  const band=has?bands.find(b=>value<=b.to)||bands[bands.length-1]:null;
  return <div style={{display:'flex',flexDirection:'column',gap:6,minWidth:120,...style}}>
    {label||showValue?<div style={{display:'flex',alignItems:'baseline',gap:8}}>
      {label?<span style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-muted)'}}>{label}</span>:null}
      {showValue?<span style={{marginLeft:'auto',display:'inline-flex',alignItems:'baseline',gap:6}}>
        <span style={{font:'var(--ds-type-mono)',fontWeight:500,fontSize:'var(--ds-text-14)',color:'var(--ds-fg-strong)'}}>{has?value:'—'}</span>
        {unit?<span style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)'}}>{unit}</span>:null}
        {band?<span style={{font:'var(--ds-type-eyebrow)',letterSpacing:'var(--ds-tracking-eyebrow)',color:Ds_BAND_C[band.tone]}}>{band.label}</span>:null}
      </span>:null}
    </div>:null}
    <div role={has?'meter':'img'} aria-valuenow={has?value:undefined} aria-valuemin={has?min:undefined} aria-valuemax={has?max:undefined}
      aria-label={has?(label||S.score.label):(label||S.score.label)+': '+S.noData}
      style={{position:'relative',height,borderRadius:'var(--ds-radius-pill)',overflow:'hidden',display:'flex',gap:1,
        background:'var(--ds-surface-active)'}}>
      {bands.map((b,i)=><span key={b.label} aria-hidden="true" style={{width:(pc(b.to)-pc(i?bands[i-1].to:min))+'%',
        background:'color-mix(in oklab,'+Ds_BAND_C[b.tone]+' 26%,transparent)'}}/>)}
    </div>
    {has?<div style={{position:'relative',height:0}}>
      <span aria-hidden="true" style={{position:'absolute',left:pc(value)+'%',top:-height-4,width:3,height:height+8,marginLeft:-1.5,
        borderRadius:2,background:'var(--ds-fg-strong)',boxShadow:'0 0 0 2px var(--ds-surface)'}}/>
    </div>:null}
    {showScale?<div style={{display:'flex',justifyContent:'space-between',font:'var(--ds-type-eyebrow)',fontWeight:'var(--ds-weight-regular)',letterSpacing:0,color:'var(--ds-fg-subtle)'}}>
      <span>{min}</span>{bands.slice(0,-1).map(b=><span key={b.label}>{b.to}</span>)}<span>{max}</span></div>:null}
  </div>;
}
