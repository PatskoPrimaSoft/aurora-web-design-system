import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {extractApi} from '../tools/docs/api.mjs';
const root=mkdtempSync(join(tmpdir(),'aurora-forwarding-'));
try{
  mkdirSync(join(root,'components/src'),{recursive:true});mkdirSync(join(root,'components/DsWrapped'));
  writeFileSync(join(root,'components/DsWrapped/DsWrapped.d.ts'),"import * as React from 'react'; export declare function DsWrapped(props: React.InputHTMLAttributes<HTMLInputElement>): JSX.Element;");
  writeFileSync(join(root,'components/src/index.js'),"import {Wrapper as Field} from './wrapper.jsx'; export function DsWrapped({...rest}){return <Field {...rest}/>;}");
  writeFileSync(join(root,'components/src/wrapper.jsx'),"import {Native} from './native.jsx'; export function Wrapper({...rest}){return <Native {...rest}/>;}");
  writeFileSync(join(root,'components/src/native.jsx'),"export function Native({...rest}){return <input {...rest}/>;}");
  assert.equal(extractApi({root})[0].forwardsNativeAttributes,true,'verify actual forwarding through two imported wrappers');
  writeFileSync(join(root,'components/src/native.jsx'),"export function Native({...rest}){return <input/>;}");
  assert.throws(()=>extractApi({root}),/documented prop is absent/,'a wrapper swallowing props must not pass');
  writeFileSync(join(root,'components/src/native.jsx'),"import {Wrapper} from './wrapper.jsx'; export function Native({...rest}){return <Wrapper {...rest}/>;}");
  assert.throws(()=>extractApi({root}),/documented prop is absent/,'cycles do not imply native forwarding');
  console.log('api-forwarding: imported wrapper chains, swallowed props and cycles passed');
}finally{rmSync(root,{recursive:true,force:true});}
