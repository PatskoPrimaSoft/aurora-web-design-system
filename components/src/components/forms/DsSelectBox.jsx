import React from 'react';
import { DsCheckButton } from '../primitives/DsCheck.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

/** Tri-state selection box with its own hit area. Object-tree selection only — forms use DsCheckbox.
 *  A thin alias of DsCheckButton, kept because the object tree and the selection bar name it. */
export function DsSelectBox({state='unchecked',label,disabled=false,onChange}){
  const S=useDsStrings();
  return <DsCheckButton state={state} label={label??S.select} disabled={disabled} onChange={onChange}/>;
}
