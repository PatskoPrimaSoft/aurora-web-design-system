import * as React from 'react';
import {DsSelect,DsSelectProps} from '../../components/DsSelect/DsSelect';
const ref=React.createRef<HTMLButtonElement>();
const props:DsSelectProps={label:'Group',options:['One',{value:'two',label:'Two',disabled:true}],value:'One',onChange:(value,option)=>{const chosen:string=value;const label:string=option.label;},name:'group',required:true,ref};
<DsSelect {...props} />;
// @ts-expect-error The ref points to the combobox button, not a native select.
<DsSelect ref={React.createRef<HTMLSelectElement>()} />;
// @ts-expect-error Values must be strings.
<DsSelect value={123} />;
