'use client';
import React from 'react';
import {createPortal} from 'react-dom';
import {DsButton, DsField, DsSelect, DsTabs, DsTabPanel, DsDialog, DsStringsProvider, dsStringsEn} from '@primasoftllc/design-system';

export default function App({brand='DEFAULT', theme='light', density='cozy'}) {
  const field = React.useRef(null);
  const [value, setValue] = React.useState('initial');
  const [choice, setChoice] = React.useState('one');
  const [tab, setTab] = React.useState('one');
  const [open, setOpen] = React.useState(false);
  const [submitted, setSubmitted] = React.useState('');
  const [clicks, setClicks] = React.useState(0);
  React.useEffect(() => { window.consumerField = field; }, []);
  return <DsStringsProvider strings={dsStringsEn}>
    <main data-ds-theme={brand} data-ds-appearance={theme} data-ds-density={density}>
      <form onSubmit={event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(data.get('field') + ':' + data.get('choice'));
      }}>
        <DsField ref={field} name="field" label="Name" value={value} onChange={event => setValue(event.currentTarget.value)} />
        <DsSelect name="choice" label="Choice" value={choice} onChange={setChoice} options={['one', 'two']} />
        <DsButton type="submit" onClick={() => setClicks(count => count + 1)}>Save</DsButton>
        <output aria-label="Submitted">{submitted}</output>
        <output aria-label="Clicks">{clicks}</output>
      </form>
      <DsTabs idBase="consumer-tabs" items={[{id:'one', label:'First'}, {id:'two', label:'Second'}]} active={tab} onChange={setTab} />
      <DsTabPanel idBase="consumer-tabs" id="one" active={tab === 'one'}>First panel</DsTabPanel>
      <DsTabPanel idBase="consumer-tabs" id="two" active={tab === 'two'}>Second panel</DsTabPanel>
      <DsButton onClick={() => setOpen(true)}>Open dialog</DsButton>
      {open && createPortal(<div data-ds-theme={brand} data-ds-appearance={theme} data-ds-density={density}><DsDialog open title="Consumer dialog" onClose={() => setOpen(false)}>
        <DsField label="Dialog field" />
      </DsDialog></div>, document.body)}
    </main>
  </DsStringsProvider>;
}
