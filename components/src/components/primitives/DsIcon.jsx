import React from 'react';

/* Optical nudge, in em, for glyphs whose ink is not centred in the em box.
   Measured: `navigation` ink sits 0.0225em high, so it is pushed back down and
   rotates about the true ink centre. One table, one place to extend it. */
const Ds_ICON_NUDGE={navigation:-0.0225};
const Ds_ICON_SIZE={xs:'var(--ds-icon-xs)',sm:'var(--ds-icon-sm)',md:'var(--ds-icon)',lg:'var(--ds-icon-lg)'};

/** The system's only icon primitive: a Material Symbols glyph as element text. */
export function DsIcon({name,size='md',rotate,label,style,...rest}){
  const n=Ds_ICON_NUDGE[name]||0;
  const resolvedSize=Object.hasOwn(Ds_ICON_SIZE,size)?Ds_ICON_SIZE[size]:size;
  return <span className="material-symbols-outlined" role={label?'img':undefined}
    aria-hidden={label?undefined:'true'} aria-label={label}
    style={{fontSize:resolvedSize,width:resolvedSize,height:resolvedSize,lineHeight:1,display:'inline-grid',placeItems:'center',flex:'none',
      fontVariationSettings:"'wght' 400",marginTop:n?(-n)+'em':undefined,
      transform:rotate?'rotate('+rotate+'deg)':undefined,...style}} {...rest}>{name}</span>;
}
