import * as React from 'react';
import {DsSwitch} from '../../components/DsSwitch/DsSwitch';
const ref=React.createRef<HTMLInputElement>();
<DsSwitch label="Tracks" checked loading ref={ref} id="tracks" aria-describedby="help" onFocus={event=>event.currentTarget.focus()} onBlur={event=>event.currentTarget.checked} onChange={event=>event.currentTarget.checked} />;
<DsSwitch aria-label="Tracks" name="tracks" value="enabled" />;
// @ts-expect-error A switch forwards the input ref, not a button ref.
<DsSwitch ref={React.createRef<HTMLButtonElement>()} />;
// @ts-expect-error The checked value is controlled.
<DsSwitch defaultChecked />;
