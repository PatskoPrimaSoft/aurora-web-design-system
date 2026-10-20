import React from 'react';
import { DsField } from './DsField.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

export const NativeDateField = React.forwardRef(function NativeDateField({
  type, value, defaultValue, onChange, onBlur, onInvalid, error,
  min, max, step, required, disabled, readOnly, form, ...rest
}, ref) {
  const S = useDsStrings();
  const nativeRef = React.useRef(null);
  const [touched, setTouched] = React.useState(false);
  const [validation, setValidation] = React.useState('');
  const setRef = React.useCallback(node => {
    nativeRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);
  const validate = React.useCallback(show => {
    const node = nativeRef.current;
    if (!node) return;
    node.setCustomValidity(error || '');
    const validity = node.validity;
    let message = '';
    if (node.willValidate) {
      if (validity.badInput) message = S.date.invalid;
      else if (validity.valueMissing) message = S.date.required;
      else if (validity.rangeUnderflow) message = S.date.min(min);
      else if (validity.rangeOverflow) message = S.date.max(max);
      else if (validity.stepMismatch) message = S.date.step;
    }
    setValidation(show ? message : '');
  }, [error, min, max, S.date]);
  React.useLayoutEffect(() => { validate(touched); }, [validate, touched, value, defaultValue, step, required, disabled, readOnly]);
  React.useEffect(() => {
    const owner = nativeRef.current?.form;
    const reset = event => queueMicrotask(() => {
      if (event.defaultPrevented) return;
      setTouched(false); setValidation('');
    });
    owner?.addEventListener('reset', reset);
    return () => owner?.removeEventListener('reset', reset);
  }, [form]);
  return <DsField {...rest} ref={setRef} as="input" type={type}
    value={value} defaultValue={defaultValue} min={min} max={max} step={step}
    required={required} disabled={disabled} readOnly={readOnly} form={form}
    error={error || validation}
    onChange={event => { validate(touched); onChange?.(event.target.value, event); }}
    onBlur={event => { setTouched(true); validate(true); onBlur?.(event); }}
    onInvalid={event => { setTouched(true); validate(true); onInvalid?.(event); }}/>;
});
