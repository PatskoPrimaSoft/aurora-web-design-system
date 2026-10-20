import React from 'react';
import { NativeDateField } from './NativeDateField.jsx';

/** Calendar date string; the browser owns typing and the calendar popup. */
export const DsDatePicker = React.forwardRef(function DsDatePicker({
  label, hint, error, value, defaultValue, onChange, min, max, step,
  required, disabled, readOnly, name, form, width, labelMode, ...rest
}, ref) {
  return <NativeDateField {...rest} ref={ref} type="date"
    label={label} hint={hint} error={error} value={value} defaultValue={defaultValue}
    onChange={onChange} min={min} max={max} step={step} required={required}
    disabled={disabled} readOnly={readOnly} name={name} form={form} width={width} labelMode={labelMode}/>;
});
