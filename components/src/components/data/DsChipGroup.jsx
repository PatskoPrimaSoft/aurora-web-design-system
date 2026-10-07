import React from 'react';
import { DsButton } from '../buttons/DsButton.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

const hasContent=children=>React.Children.toArray(children).some(child=>
  React.isValidElement(child)&&child.type===React.Fragment?hasContent(child.props.children):true);

/** Layout for related chips; their state and removal belong to the parent. */
export function DsChipGroup({children,ariaLabel,onClearAll,clearAllLabel}){
  const S=useDsStrings();
  const items=React.Children.toArray(children);
  if(!hasContent(items))return null;
  return <div role="group" aria-label={ariaLabel}
    style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'var(--ds-gap-sm)',minWidth:0,maxWidth:'100%'}}>
    {items}
    {onClearAll?<DsButton size="sm" tone="ghost" onClick={onClearAll}>{clearAllLabel??S.clearAll}</DsButton>:null}
  </div>;
}
