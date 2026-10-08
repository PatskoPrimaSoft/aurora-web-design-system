import React from 'react';
import { useDsStrings } from '../primitives/DsStrings.jsx';

/** Indeterminate spinner. The only loading affordance in v2. */
export function DsSpinner({size=20,thickness,tone='brand',label}){
  const S=useDsStrings();
  const w=thickness||Math.max(2,Math.round(size/9));
  const color=tone==='brand'?'var(--ds-brand)':tone==='inverse'?'currentColor':'var(--ds-fg-muted)';
  return <span role="status" aria-label={label??S.loading} style={{display:'inline-block',flex:'none',width:size,height:size,
    borderRadius:'50%',border:w+'px solid '+color,borderTopColor:'transparent',opacity:tone==='inverse'?.85:1,
    animation:'ds-spin 700ms linear infinite'}}/>;
}

/** Skeleton block for a value that has not arrived yet. Preferred over a spinner inside a table. */
export function DsSkeleton({width='100%',height=12,radius='var(--ds-radius-xs)',animated=true}){
  return <span data-ds-skeleton="" data-animated={animated} aria-hidden="true" style={{display:'block',width,height,borderRadius:radius,
    background:'var(--ds-skeleton-bg)'}}/>;
}
