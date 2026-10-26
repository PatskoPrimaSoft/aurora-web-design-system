import React from 'react';
import {DsButton, DsIconButton, DsFab} from '@primasoftllc/design-system';
import Feedback from './feedback.jsx';

export default function Buttons() {
  const [theme, setTheme] = React.useState('light');
  const [mode, setMode] = React.useState('enabled');
  const consumer = React.useRef({setTheme, setMode, clicks:{}, events:[], refs:{}});
  React.useEffect(() => {
    window.buttonConsumer = consumer.current;
  }, []);
  function props(id) {
    const event = event => window.buttonConsumer.events.push([id, event.type, event.currentTarget.dataset.testid]);
    return {'data-testid':id, disabled:mode === 'disabled', loading:mode === 'loading',
      onClick:event => {window.buttonConsumer.clicks[id] = (window.buttonConsumer.clicks[id] || 0) + 1; event.persist();},
      onPointerEnter:event, onPointerLeave:event, onPointerDown:event, onPointerUp:event,
      onKeyDown:event, onKeyUp:event};
  }
  return <><main data-ds-theme="DEFAULT" data-ds-appearance={theme} data-ds-density="cozy" data-mode={mode}
    style={{padding:24, display:'flex', gap:24, flexWrap:'wrap', backgroundColor:'var(--ds-bg)'}}>
    {['secondary', 'ghost', 'primary'].map(tone => <DsButton key={tone} {...props('button-'+tone)} tone={tone}
      ref={node => {consumer.current.refs['button-'+tone] = node;}}>{tone}</DsButton>)}
    {['ghost', 'secondary', 'onHeader', 'primary', 'active'].map(tone => <DsIconButton key={tone}
      {...props('icon-'+tone)} tone={tone === 'active' ? 'ghost' : tone} active={tone === 'active' ? true : undefined}
      ref={node => {consumer.current.refs['icon-'+tone] = node;}}
      icon="add" label={'Icon '+tone} />)}
    {['surface', 'primary'].map(tone => <DsFab key={tone} {...props('fab-'+tone)} tone={tone} icon="add" label={'Fab '+tone} />)}
  </main><StyleOverrides/><Feedback/></>;
}

function StyleOverrides() {
  const [mode, setMode] = React.useState('enabled');
  React.useEffect(() => {window.styleOverrides = {setMode};}, []);
  return <div data-style-overrides="" data-mode={mode} data-ds-theme="DEFAULT" data-ds-appearance="light" data-ds-density="cozy">
    {['background', 'backgroundColor'].map(property => {
      const props = {style:{[property]:'rgb(213, 17, 73)'}, disabled:mode === 'disabled', loading:mode === 'loading'};
      return <React.Fragment key={property}>
        <DsButton {...props} data-testid={'override-'+property+'-button'} tone="secondary">Custom color</DsButton>
        <DsIconButton {...props} data-testid={'override-'+property+'-icon'} tone="ghost" icon="add" label="Custom icon"/>
        <DsFab {...props} data-testid={'override-'+property+'-fab'} tone="surface" icon="add" label="Custom FAB"/>
      </React.Fragment>;
    })}
  </div>;
}
