import React from 'react';
import { NativeDateField } from './NativeDateField.jsx';
import { DsButton } from '../buttons/DsButton.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';
import { isRangeReversed } from './dateValues.js';

/** Calendar or local date-time period with application-owned timezone and presets. */
export const DsDateRangePicker = React.forwardRef(function DsDateRangePicker({
  value, defaultValue = { from: '', to: '' }, onChange, granularity = 'date',
  label, fromLabel, toLabel, timeZone, presets = [], name, fromName, toName,
  min, max, step, required = false, disabled = false, readOnly = false,
  hint, error, form, id, style, 'aria-describedby': describedBy, ...rest
}, ref) {
  const S = useDsStrings(), uid = React.useId();
  const rid = id || 'ds-range-' + uid.replace(/:/g, '');
  const controlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const current = controlled ? value : internal;
  const fieldsetRef = React.useRef(null), fromRef = React.useRef(null);
  const setRef = React.useCallback(node => {
    fieldsetRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);
  const reversed = isRangeReversed(current);
  const change = (next, event) => {
    if (disabled || readOnly) return;
    if (!controlled) setInternal(next);
    onChange?.(next, event);
  };
  React.useEffect(() => {
    const owner = fromRef.current?.form;
    const reset = event => queueMicrotask(() => {
      if (!event.defaultPrevented && !controlled) setInternal(defaultValue);
    });
    owner?.addEventListener('reset', reset);
    return () => owner?.removeEventListener('reset', reset);
  }, [controlled, defaultValue, form]);
  const description = [describedBy, timeZone ? rid + '-zone' : null, hint ? rid + '-hint' : null].filter(Boolean).join(' ') || undefined;
  const common = {type:granularity === 'datetime' ? 'datetime-local' : 'date', min, max, step, required, disabled, readOnly, form, 'aria-describedby':description};
  return <fieldset {...rest} id={rid} ref={setRef} disabled={disabled} form={form}
    data-ds-date-range="" aria-describedby={description}
    style={{border:0, padding:0, margin:0, minWidth:0, width:'100%', boxSizing:'border-box', ...style}}>
    <legend style={{font:'var(--ds-type-body)', fontWeight:'var(--ds-weight-medium)', color:'var(--ds-fg)', padding:0, marginBottom:8, overflowWrap:'anywhere'}}>{label || S.date.range}</legend>
    <div style={{display:'flex', flexDirection:'column', gap:'var(--ds-gap-md)'}}>
      <div style={{display:'flex', flexWrap:'wrap', gap:'var(--ds-gap-md)'}}>
        <div style={{flex:'1 1 200px', minWidth:0}}><NativeDateField {...common} ref={fromRef} id={rid+'-from'} label={fromLabel || S.date.from}
          name={fromName ?? (name ? name+'.from' : undefined)} value={current.from || ''}
          onChange={(next,event) => change({...current,from:next},event)}/></div>
        <div style={{flex:'1 1 200px', minWidth:0}}><NativeDateField {...common} id={rid+'-to'} label={toLabel || S.date.to}
          name={toName ?? (name ? name+'.to' : undefined)} value={current.to || ''}
          error={error || (reversed ? S.date.rangeInvalid : undefined)}
          onChange={(next,event) => change({...current,to:next},event)}/></div>
      </div>
      {timeZone ? <span id={rid+'-zone'} style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-muted)',overflowWrap:'anywhere'}}>{S.date.timeZone(timeZone)}</span> : null}
      {hint ? <span id={rid+'-hint'} style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-muted)'}}>{hint}</span> : null}
      {presets.length ? <div style={{display:'flex',flexWrap:'wrap',gap:'var(--ds-gap-sm)'}}>{presets.map(preset =>
        <DsButton key={preset.id} type="button" tone="secondary" size="sm" disabled={disabled || readOnly || preset.disabled}
          onClick={event => change({...preset.value},event)}>{preset.label}</DsButton>)}</div> : null}
    </div>
  </fieldset>;
});
