import React from 'react';

const Ds_SPARK_TONE={brand:'var(--ds-brand)',series:'var(--ds-series-1)',success:'var(--ds-success-solid)',
  warning:'var(--ds-warning-solid)',danger:'var(--ds-danger-solid)',muted:'var(--ds-fg-muted)'};

/** Micro trend for a table cell or an object row: shape only, no axes, no labels. */
export function DsSparkline({data=[],width=72,height=22,tone='series',color,area=true,dot=false,label,style}){
  const c=color||Ds_SPARK_TONE[tone]||Ds_SPARK_TONE.series;
  const pts=data.map(v=>typeof v==='number'&&!Number.isNaN(v)?v:null);
  const ok=pts.filter(v=>v!=null);
  if(ok.length<2)return <span aria-hidden="true" style={{display:'inline-block',width,height,...style}}/>;
  const mn=area?Math.min(0,...ok):Math.min(...ok),mx=area?Math.max(0,...ok):Math.max(...ok),span=mx-mn||1,dx=width/(pts.length-1),p=2;
  const y=value=>p+(1-(value-mn)/span)*(height-p*2);
  const xy=i=>[i*dx,y(pts[i])];
  const segs=[];let cur=[];
  for(let i=0;i<pts.length;i++){if(pts[i]==null){if(cur.length>1)segs.push(cur);cur=[];continue}cur.push(xy(i))}
  if(cur.length>1)segs.push(cur);
  const last=xy(pts.length-1-[...pts].reverse().findIndex(v=>v!=null));
  return <svg width={width} height={height} viewBox={'0 0 '+width+' '+height} role={label?'img':undefined}
    aria-label={label} aria-hidden={label?undefined:'true'} style={{display:'block',overflow:'visible',flex:'none',...style}}>
    {area?segs.map((sg,k)=><path key={'a'+k} d={'M'+sg.map(q=>q[0]+' '+q[1]).join('L')+'L'+sg[sg.length-1][0]+' '+y(0)+'L'+sg[0][0]+' '+y(0)+'Z'}
      fill={'color-mix(in oklab,'+c+' 14%,transparent)'}/>):null}
    {segs.map((sg,k)=><path key={k} d={'M'+sg.map(q=>q[0]+' '+q[1]).join('L')} fill="none" stroke={c}
      strokeWidth="var(--ds-chart-line-w-thin)" strokeLinejoin="round" strokeLinecap="round"/>)}
    {dot?<circle cx={last[0]} cy={last[1]} r="2.5" fill={c}/>:null}
  </svg>;
}
