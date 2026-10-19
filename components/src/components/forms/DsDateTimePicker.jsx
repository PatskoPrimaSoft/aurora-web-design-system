import React from 'react';
import { NativeDateField } from './NativeDateField.jsx';

/** Local calendar date and wall-clock time; never an implicit UTC instant. */
export const DsDateTimePicker = React.forwardRef(function DsDateTimePicker({
  label, hint, error, value, defaultValue, onChange, min, max, step,
  required, disabled, readOnly, name, form, width, labelMode, ...rest
}, ref) {
  return <NativeDateField {...rest} ref={ref} type="datetime-local"
    label={label} hint={hint} error={error} value={value} defaultValue={defaultValue}
    onChange={onChange} min={min} max={max} step={step} required={required}
    disabled={disabled} readOnly={readOnly} name={name} form={form} width={width} labelMode={labelMode}/>;
});
