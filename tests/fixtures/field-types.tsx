import * as React from 'react';
import {DsField,DsFieldProps} from '../../design-system/components/DsField/DsField';
const input=React.createRef<HTMLInputElement>();
const select=React.createRef<HTMLSelectElement>();
const textarea=React.createRef<HTMLTextAreaElement>();
<DsField name="imei" autoComplete="off" inputMode="numeric" maxLength={15} readOnly ref={input} onChange={event=>event.currentTarget.select()} />;
<DsField as="select" name="group" ref={select} options={['One']} onChange={event=>event.currentTarget.options.item(0)} />;
<DsField as="textarea" ref={textarea} autoResize showCount maxLength={300} onChange={event=>event.currentTarget.rows} />;
const props:DsFieldProps<'textarea'>={as:'textarea',onBlur:event=>event.currentTarget.rows};
<DsField {...props} />;
// @ts-expect-error A select ref must refer to HTMLSelectElement.
<DsField as="select" ref={textarea} />;
// @ts-expect-error Input events must not expose textarea-only members.
<DsField onChange={event=>event.currentTarget.rows} />;
// @ts-expect-error Select events must not expose textarea-only members.
<DsField as="select" onChange={event=>event.currentTarget.rows} />;
