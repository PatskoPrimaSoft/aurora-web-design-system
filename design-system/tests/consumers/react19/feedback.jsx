import React from 'react';
import {DsCheckbox, DsChip, DsTable, DsListRow, DsTreeRow} from '@primasoftllc/design-system';

// Bounded public-consumer probe of the other shared background/overlay users.
export default function Feedback() {
  const [theme, setTheme] = React.useState('light');
  const [selected, setSelected] = React.useState(false);
  const [checked, setChecked] = React.useState('unchecked');
  const [disabled, setDisabled] = React.useState(false);
  const [kind, setKind] = React.useState(null);
  React.useEffect(() => {window.feedbackConsumer = {setTheme, setSelected, setChecked, setDisabled, setKind};}, []);
  return <div data-feedback-root="" data-ds-theme="DEFAULT" data-ds-appearance={theme} data-ds-density="cozy"
    data-selected={selected} data-checked={checked} data-disabled={disabled} data-kind={kind}
    style={{padding:24, backgroundColor:'var(--ds-bg)', display:'grid', gap:8}}>
    {kind === 'checkbox' && <div data-feedback="checkbox"><DsCheckbox label="Probe checkbox" state={checked} disabled={disabled} onChange={setChecked}/></div>}
    {kind === 'radio' && <div data-feedback="radio"><DsCheckbox radio label="Probe radio" state={checked} disabled={disabled} onChange={setChecked}/></div>}
    {kind === 'chip' && <div data-feedback="chip"><DsChip selected={selected} disabled={disabled} onClick={() => setSelected(value => !value)}>Probe chip</DsChip></div>}
    {kind === 'table' && <div data-feedback="table"><DsTable columns={[{key:'name', label:'Name'}]} rows={[{id:'one', name:'Probe table row'}]}
      selectedIds={selected ? ['one'] : []} onRowClick={() => {}}/></div>}
    {kind === 'list' && <div data-feedback="list"><DsListRow title="Probe list row" selected={selected} onClick={() => {}}/></div>}
    {kind === 'tree' && <div data-feedback="tree"><DsTreeRow title="Probe tree row" active={selected} onClick={() => {}} onToggle={() => {}}/></div>}
  </div>;
}
