import React from 'react';
import { useDsStrings } from '../primitives/DsStrings.jsx';

/** Indeterminate loading indicator. */
export function DsSpinner({size=20,thickness,tone='brand',label,delay=0}){
  const S=useDsStrings();
  const [ready,setReady]=React.useState(delay<=0);
  React.useEffect(()=>{
    if(delay<=0){setReady(true);return;}
    setReady(false);
    const timer=setTimeout(()=>setReady(true),delay);
    return ()=>clearTimeout(timer);
  },[delay]);
  const w=thickness||Math.max(2,Math.round(size/9));
  const color=tone==='brand'?'var(--ds-brand)':tone==='inverse'?'currentColor':'var(--ds-fg-muted)';
  const text=label??S.loading;
  return <span data-ds-spinner="" role={ready?'status':undefined} aria-label={ready?text:undefined}
    style={{display:'inline-flex',flex:'none',width:size,height:size,verticalAlign:'middle'}}>
    {ready&&<><span data-ds-spinner-intro="" aria-hidden="true" style={{display:'block',width:'100%',height:'100%'}}>
      <span data-ds-spinner-ring="" style={{display:'block',boxSizing:'border-box',width:'100%',height:'100%',borderRadius:'50%',
        border:w+'px solid '+color,borderTopColor:'transparent',opacity:tone==='inverse'?.85:1}}/>
    </span><span data-ds-spinner-label="">{text}</span></>}
  </span>;
}

/** Skeleton block for a value that has not arrived yet. Preferred over a spinner inside a table. */
export function DsSkeleton({width='100%',height=12,radius='var(--ds-radius-xs)',animated=true}){
  return <span data-ds-skeleton="" data-animated={animated} aria-hidden="true" style={{display:'block',width,height,borderRadius:radius,
    background:'var(--ds-skeleton-bg)'}}/>;
}
