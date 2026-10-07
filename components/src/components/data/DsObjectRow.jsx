import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { DsCheckbox } from '../forms/DsCheckbox.jsx';
import { dsFleetState } from './DsStateIcon.jsx';
import { useDsStrings, dsStringsRu } from '../primitives/DsStrings.jsx';
const SIGNAL={good:'var(--ds-success-solid)',weak:'var(--ds-warning-solid)',none:'var(--ds-fg-disabled)'};
const FRESH={live:'var(--ds-fresh-live)',recent:'var(--ds-fresh-recent)',late:'var(--ds-fresh-late)',none:'var(--ds-fresh-none)'};
/* Скринридеру — тот же текст, что видит оператор, и в том же порядке важности:
   состояние, свежесть, сигнал, сервис, детали, непрочитанное. Цвет и глифы в
   строке декоративны (aria-hidden), поэтому без этого описания «Тревога» и
   «Нет связи» не доходили до скринридера вовсе. */
const SR_ONLY={position:'absolute',width:1,height:1,padding:0,margin:-1,overflow:'hidden',
  clip:'rect(0 0 0 0)',whiteSpace:'nowrap',border:0};
export function dsObjectRowDescription({state='parked',stateLabel,freshness='live',freshnessLabel,signal='good',
  service,details,unread=0,online=false},S=dsStringsRu){
  const st=dsFleetState[state]?state:'parked';
  const fr=FRESH[freshness]?freshness:'live',sg=SIGNAL[signal]?signal:'good';
  return [stateLabel||S.state[st],freshnessLabel||S.freshness[fr],
    S.signal[sg],online?S.online:null,service&&service.label,details,
    unread>0?S.unread(unread):null].filter(Boolean).join('. ');
}
function initials(s){return String(s||'').trim().split(/[\s-]+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()}

/** Object-panel row: photo disc, movement + signal glyphs, identity, unread count, selection box. */
export function DsObjectRow({name,details,state='parked',stateLabel,course,signal='good',service,avatarSrc,online=false,
  freshness='live',freshnessLabel,unread=0,unreadPlacement='avatar',select,onSelectChange,active=false,onClick,indent=0}){
  const S=useDsStrings();
  const [h,setH]=React.useState(false);
  const descId=React.useId();
  const stateKey=dsFleetState[state]?state:'parked';
  const s=dsFleetState[stateKey];
  const description=dsObjectRowDescription({state,stateLabel,freshness,freshnessLabel,signal,service,details,unread,online},S);
  const sigColor=SIGNAL[signal]||SIGNAL.good,sigLabel=S.signal[SIGNAL[signal]?signal:'good'];
  const freshColor=FRESH[freshness]||FRESH.live,freshDefault=S.freshness[FRESH[freshness]?freshness:'live'];
  const badge=unread>0?(unread>99?'99+':String(unread)):null;
  /* Анатомия строки: основная зона и выбор — СОСЕДНИЕ элементы, а не вложенные.
     Основная зона — настоящая <button>, когда строку можно открыть: Enter и Space
     приходят от платформы, а не от обработчика клавиш на родителе, поэтому Space на
     чекбоксе меняет только выбор и никогда не открывает объект. Контейнер строки —
     не контрол: он только рисует ховер и выбранное состояние. */
  const Main=onClick?'button':'div';
  return <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm-plus)',minHeight:'var(--ds-row-h-lg)',
      padding:'0 var(--ds-pad-sm)',paddingLeft:'calc(var(--ds-pad-sm) + '+indent+'px)',minWidth:0,
      background:active?'var(--ds-surface-selected)':h&&onClick?'var(--ds-surface-hover)':'transparent',
      boxShadow:active?'inset 2px 0 0 var(--ds-brand)':'none',
      transition:'background-color var(--ds-dur-fast) var(--ds-ease)',position:'relative'}}>
    <Main {...(onClick?{type:'button',onClick}:{role:'group'})} aria-label={String(name??'')} aria-describedby={descId}
      aria-current={active?'true':undefined}
      style={{flex:1,minWidth:0,display:'flex',alignItems:'center',gap:'var(--ds-gap-sm-plus)',alignSelf:'stretch',
        padding:'var(--ds-pad-tight) 0',margin:0,border:'none',background:'transparent',font:'inherit',color:'inherit',
        textAlign:'left',cursor:onClick?'pointer':'default',borderRadius:'var(--ds-radius-sm)'}}>
    <span id={descId} style={SR_ONLY}>{description}</span>
    <span aria-hidden="true" style={{position:'relative',flex:'none'}}>
      <span title={freshnessLabel||freshDefault} style={{display:'flex',alignItems:'center',justifyContent:'center',width:36,height:36,
        borderRadius:'var(--ds-radius-circle)',overflow:'hidden',background:freshColor,padding:avatarSrc?2:0,
        color:'var(--ds-fresh-fg)',font:'var(--ds-type-ui)'}}>
        {avatarSrc?<img src={avatarSrc} alt="" style={{width:'100%',height:'100%',objectFit:'cover',
          borderRadius:'var(--ds-radius-circle)'}}/>:initials(name)}</span>
      {online?<span title={S.online} style={{position:'absolute',right:-1,bottom:-1,width:11,height:11,
        borderRadius:'var(--ds-radius-circle)',background:'var(--ds-success-solid)',border:'2px solid var(--ds-surface)'}}/>:null}
      {badge&&unreadPlacement==='avatar'?<span title={S.unread(unread)} style={{position:'absolute',right:-5,top:-5,
        minWidth:18,height:18,padding:'0 5px',borderRadius:'var(--ds-radius-badge)',background:'var(--ds-accent-mark)',
        color:'var(--ds-accent-mark-on)',font:'var(--ds-type-eyebrow)',display:'flex',alignItems:'center',justifyContent:'center',
        border:'2px solid var(--ds-surface)'}}>{badge}</span>:null}
    </span>
    <span aria-hidden="true" style={{flex:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
      <Icon name={s.glyph} size="var(--ds-icon-sm)" rotate={state==='moving'&&course!=null?course:undefined}
        style={{color:'var(--ds-state-'+stateKey+')'}}/>
      <span title={sigLabel}><Icon name="satellite_alt" size="var(--ds-icon-sm)" style={{color:sigColor}}/></span>
    </span>
    <span style={{flex:1,minWidth:0}}>
      <span style={{display:'flex',alignItems:'center',gap:5,minWidth:0}}>
        {service?<span title={service.label}><Icon name={service.icon} size="var(--ds-icon-sm)"
          style={{color:'var(--ds-'+(service.tone||'warning')+'-solid)'}}/></span>:null}
        <span style={{font:'var(--ds-type-body-strong)',color:'var(--ds-fg)',overflow:'hidden',
          textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</span></span>
      {details?<span style={{display:'block',font:'var(--ds-type-body)',color:'var(--ds-fg-muted)',
        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{details}</span>:null}</span>
    {badge&&unreadPlacement==='trailing'?<span title={S.unread(unread)} style={{flex:'none',minWidth:18,height:18,
      padding:'0 5px',borderRadius:'var(--ds-radius-badge)',background:'var(--ds-accent-mark)',color:'var(--ds-accent-mark-on)',
      font:'var(--ds-type-eyebrow)',display:'flex',alignItems:'center',justifyContent:'center'}}>{badge}</span>:null}
    </Main>
    {select?<span style={{flex:'none',marginRight:-8}}>
      <DsCheckbox state={select} ariaLabel={S.selectItem(name)} onChange={onSelectChange}/></span>:null}
  </div>;
}
