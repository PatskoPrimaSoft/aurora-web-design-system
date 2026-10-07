import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { DsCheckbox } from '../forms/DsCheckbox.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';
function initials(s){return String(s||'').trim().split(/[\s-]+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()}

/** Collapsible header for one level of the object tree: a user, a group or a label.
 *
 *  Анатомия — соседние элементы, ни один не вложен в другой и ни один не слушает
 *  клавиши за другого:
 *  - есть `onClick` (открыть пользователя или группу): шеврон — своя кнопка
 *    раскрытия с `aria-expanded`, основная зона — кнопка открытия;
 *  - только `onToggle`: основная зона сама раскрывает группу (`aria-expanded`),
 *    шеврон внутри неё — рисунок;
 *  - чекбокс группы — отдельно: Space на нём выбирает, но не сворачивает. */
export function DsTreeRow({title,meta,icon,avatarSrc,avatar=false,level=0,expanded=true,onToggle,
  selected,total,select,onSelectChange,selectDisabled=false,unread=0,onClick,
  expandLabel,collapseLabel}){
  const S=useDsStrings();
  const [h,setH]=React.useState(false);
  const badge=unread>0?(unread>99?'99+':String(unread)):null;
  const av=avatar||avatarSrc;
  const toggle=()=>{if(onToggle)onToggle(!expanded)};
  const splitToggle=!!(onClick&&onToggle);
  const act=onClick||onToggle;
  const plain={margin:0,border:'none',background:'transparent',font:'inherit',color:'inherit',padding:0,textAlign:'left'};
  const chevron=<Icon name={expanded?'expand_more':'chevron_right'} size="var(--ds-icon)" style={{color:'var(--ds-fg-subtle)'}}/>;
  const Main=act?'button':'div';
  const mainProps=onClick?{type:'button',onClick}:onToggle?{type:'button',onClick:toggle,'aria-expanded':expanded}:{};
  return <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',minHeight:'var(--ds-row-h)',
      padding:'0 var(--ds-pad-sm)',paddingLeft:'calc(var(--ds-pad-sm) + '+level*20+'px)',
      userSelect:'none',minWidth:0,
      background:h&&act?'var(--ds-surface-hover)':'transparent',
      transition:'background-color var(--ds-dur-fast) var(--ds-ease)'}}>
    {splitToggle?<button type="button" aria-expanded={expanded} aria-label={expanded?(collapseLabel?collapseLabel+' «'+title+'»':S.collapse(title)):(expandLabel?expandLabel+' «'+title+'»':S.expand(title))}
      onClick={toggle} style={{...plain,flex:'none',display:'inline-flex',alignItems:'center',justifyContent:'center',
        width:24,height:24,borderRadius:'var(--ds-radius-sm)',cursor:'pointer'}}>{chevron}</button>:null}
    <Main {...mainProps} style={{...plain,flex:1,minWidth:0,display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',
      alignSelf:'stretch',padding:'var(--ds-pad-tight) 0',cursor:act?'pointer':'default',borderRadius:'var(--ds-radius-sm)'}}>
      {splitToggle?null:<span aria-hidden="true" style={{display:'inline-flex'}}>{chevron}</span>}
      {av?<span aria-hidden="true" style={{flex:'none',display:'flex',alignItems:'center',justifyContent:'center',width:30,height:30,
        borderRadius:'var(--ds-radius-circle)',overflow:'hidden',background:'var(--ds-brand-subtle)',
        color:'var(--ds-brand-text)',font:'var(--ds-type-ui)'}}>
        {avatarSrc?<img src={avatarSrc} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:initials(title)}</span>
        :icon?<Icon name={icon} size="var(--ds-icon-sm)" style={{color:'var(--ds-brand-text)'}}/>:null}
      <span style={{flex:1,minWidth:0,display:'flex',alignItems:'center',gap:6}}>
        <span style={{font:'var(--ds-type-body-strong)',color:level?'var(--ds-fg-muted)':'var(--ds-fg)',
          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</span>
        {badge?<span title={S.unread(unread)} style={{flex:'none',minWidth:16,height:16,padding:'0 5px',
          borderRadius:'var(--ds-radius-badge)',background:'var(--ds-accent-mark)',color:'var(--ds-accent-mark-on)',
          font:'var(--ds-type-eyebrow)',display:'flex',alignItems:'center',justifyContent:'center'}}>{badge}</span>:null}
        {meta?<span style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)',whiteSpace:'nowrap'}}>{meta}</span>:null}
      </span>
      {total!=null?<span style={{flex:'none',font:'var(--ds-type-caption)',color:'var(--ds-fg-subtle)',
        fontVariantNumeric:'tabular-nums'}}>{(selected||0)+' / '+total}</span>:null}
    </Main>
    {select?<span style={{flex:'none',marginRight:-8}}>
      <DsCheckbox state={select} disabled={selectDisabled} ariaLabel={S.selectAllIn(title)} onChange={onSelectChange}/></span>:null}
  </div>;
}
