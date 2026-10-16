import * as React from 'react';
import {
  DsButton, DsField, DsSelect, DsSwitch, DsTabs, DsTabPanel, DsSkeleton,
  DsStringsProvider, dsStringsEn, dsTabIds, dsSlots, dsVisibleSelection,
  DsInHeader, useDsLayer, usePress, type DsButtonProps,
} from '@primasoftllc/design-system';

const button: DsButtonProps = {tone:'primary', onClick:event=>event.currentTarget.focus()};
const inputRef=React.createRef<HTMLInputElement>();
const selectRef=React.createRef<HTMLSelectElement>();
export const example=<DsStringsProvider strings={dsStringsEn}>
  <DsButton {...button}>Save</DsButton>
  <DsField ref={inputRef} onChange={event=>event.currentTarget.value.toUpperCase()} />
  <DsField as="select" ref={selectRef} onChange={event=>event.currentTarget.selectedIndex} />
  <DsSelect value="one" onChange={value=>value.toUpperCase()} options={['one']} />
  <DsSelect multiple value={['one']} onChange={values=>values.map(v=>v.toUpperCase())} />
  <DsSwitch ref={inputRef} checked onChange={checked=>checked.valueOf()} />
  <DsTabs idBase="tabs" items={[{id:'one',label:'One'}]} active="one" />
  <DsTabPanel idBase="tabs" id="one" active><DsSkeleton /></DsTabPanel>
</DsStringsProvider>;
dsTabIds('tabs','one').panelId.toUpperCase();
dsSlots(example,['header'],{header:null});
dsVisibleSelection(['one'],['one']);
const context: React.Context<boolean>=DsInHeader;
export function Hooks(){useDsLayer(true,event=>event.preventDefault());return usePress(false).hover?null:<context.Provider value={true} />;}

// @ts-expect-error Unsupported button tone.
const wrongTone=<DsButton tone="purple" />;
// @ts-expect-error Single selection accepts a string.
const wrongSingle=<DsSelect value={['one']} />;
// @ts-expect-error Multiple selection accepts an array.
const wrongMultiple=<DsSelect multiple value="one" />;
// @ts-expect-error Ref must point at the selected native element.
const wrongRef=<DsField as="select" ref={inputRef} />;
// @ts-expect-error Content tabs require an ID base.
const missingId=<DsTabs items={[]} />;
// @ts-expect-error Change callback receives boolean.
const wrongChange=<DsSwitch onChange={(value:string)=>{}} />;
