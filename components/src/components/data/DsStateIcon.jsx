import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';
/** Словарь состояний объекта — единственный: глиф, тон статуса и подпись.
 *  Им пользуются DsStateIcon и DsListRow; подпись — и видимая, и для скринридера. */
export const dsFleetState={
  moving:{glyph:'navigation',tone:'success',label:'Движение'},
  parked:{glyph:'local_parking',tone:'neutral',label:'Стоянка'},
  offline:{glyph:'wifi_off',tone:'danger',label:'Нет связи'},
  invalid:{glyph:'help',tone:'info',label:'Некорректные данные'},
  alarm:{glyph:'warning',tone:'warning',label:'Тревога'},
  nodata:{glyph:'remove',tone:'neutral',label:'Нет данных'}
};

/** Object connection state as a tinted disc. Rotates by course when moving. */
export function DsStateIcon({state='parked',course,size=28,bare=false,label,decorative=false}){
  const S=useDsStrings();
  const key=dsFleetState[state]?state:'parked';
  const s=dsFleetState[key];
  const text=label||S.state[key]||s.label;
  /* ink is the fleet vocabulary itself (--ds-state-*), not the status tone it maps to:
     the state colour has to live in exactly one place. The tinted ground stays on the
     status palette, which is what the vocabulary is built from. */
  const ink='var(--ds-state-'+key+')';
  const glyphSize=Math.min(size,size<=20?16:size<=28?20:24);
  const accessibility=decorative?{'aria-hidden':true}:{role:'img','aria-label':text,title:text};
  const spin=state==='moving'&&course!=null?course:undefined;
  if(bare)return <span {...accessibility} style={{display:'inline-flex',flex:'none',
    color:ink}}><Icon name={s.glyph} size={glyphSize} rotate={spin}/></span>;
  return <span {...accessibility} style={{display:'inline-flex',alignItems:'center',
    justifyContent:'center',flex:'none',width:size,height:size,borderRadius:'50%',
    background:'var(--ds-'+s.tone+'-bg)',color:ink}}>
    <Icon name={s.glyph} size={glyphSize} rotate={spin}/></span>;
}
