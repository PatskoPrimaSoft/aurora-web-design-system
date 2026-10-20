import React from 'react';
import { NativeDateField } from './NativeDateField.jsx';

/** Wall-clock time string without a date or timezone conversion. */
export const DsTimePicker = React.forwardRef(function DsTimePicker({
  label, hint, error, value, defaultValue, onChange, min, max, step,
  required, disabled, readOnly, name, form, width, labelMode, ...rest
}, ref) {
  return <NativeDateField {...rest} ref={ref} type="time"
    label={label} hint={hint} error={error} value={value} defaultValue={defaultValue}
    onChange={onChange} min={min} max={max} step={step} required={required}
    disabled={disabled} readOnly={readOnly} name={name} form={form} width={width} labelMode={labelMode}/>;
});
