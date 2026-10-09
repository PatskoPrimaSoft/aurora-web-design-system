import * as React from 'react';
import {DsFilterMenu,DsFilterOptionGroup} from '../../components/DsFilterMenu/DsFilterMenu';
const group:DsFilterOptionGroup={label:'Activity',options:['moving',{value:'parked',label:'Parked',count:0}]};
<DsFilterMenu type="checkbox-list" options={[group,'offline']} value={['moving']} onApply={value=>console.log(value)} />;
<DsFilterMenu type="number" value={0} formatValue={value=>String(value)+' km/h'} />;
<DsFilterMenu searchable loading disabled maxHeight={400} options={[{value:'locked',label:'Locked',disabled:true,description:'No permission'}]} />;
// @ts-expect-error A group requires its option list.
<DsFilterMenu options={[{label:'Activity'}]} />;
