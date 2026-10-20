import React from 'react';
import {DsLink} from './DsLink.jsx';
import {useDsStrings} from '../primitives/DsStrings.jsx';

/** Иерархия страницы; последний пункт — текущая страница, а не ссылка на неё же. */
export function DsBreadcrumbs({items=[],'aria-label':ariaLabel,id,className,style}){
  const S=useDsStrings();
  if(items.length===0)return null;
  return <nav id={id} className={className} data-ds-breadcrumbs="" aria-label={ariaLabel||S.breadcrumbs.label}
    style={{minWidth:0,font:'var(--ds-type-body)',...style}}>
    <ol style={{display:'flex',flexWrap:'wrap',alignItems:'baseline',gap:'var(--ds-gap-sm)',listStyle:'none',padding:0,margin:0}}>
      {items.map((item,index)=>{
        const current=index===items.length-1;
        return <li key={item.id??index} style={{display:'flex',alignItems:'baseline',gap:'var(--ds-gap-sm)',minWidth:0,maxWidth:'100%'}}>
          {index>0?<span data-ds-breadcrumb-separator="" aria-hidden="true" style={{flex:'none',color:'var(--ds-fg-muted)'}}>/</span>:null}
          {!current&&item.href?<DsLink href={item.href} target={item.target} rel={item.rel} onClick={item.onClick} style={{minWidth:0}}>{item.label}</DsLink>
            :<span aria-current={current?'page':undefined} style={{minWidth:0,overflowWrap:'anywhere',color:current?'var(--ds-fg)':'var(--ds-fg-muted)'}}>{item.label}</span>}
        </li>;
      })}
    </ol>
  </nav>;
}
