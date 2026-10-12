import React from 'react';
import { createPortal } from 'react-dom';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { DsCheckbox } from '../forms/DsCheckbox.jsx';
import { dsSlots } from '../layout/DsPageLayout.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

/* The selection column keeps a 24px hit area, not the density control height: the
   declared column is 40px and 14px of it is --ds-cell-pad-x, so a 36px pill would
   push every other column right in a table that is already wider than its
   container. 24px is the WCAG 2.5.8 floor and fits both densities. */
/** Data table. Borders and one tinted header row; no Material elevation, no 2px rules. */
/* Выбор считается по пересечению ID видимых строк с выбранными, а не по
   количеству: выбранные на другой странице или скрытые фильтром не включают
   «Выбрать все» на этой. Выбор всей выборки (всех результатов, а не страницы) —
   отдельное состояние `allSelected`, его держит потребитель: только он знает
   общее число и умеет применить действие к выборке на сервере. */
let dsWarnedToggleAll=false;
export function dsVisibleSelection(visibleIds,selectedIds,allSelected=false){
  if(!visibleIds.length)return 'unchecked';
  if(allSelected)return 'checked';
  const sel=new Set(selectedIds);let n=0;for(const id of visibleIds)if(sel.has(id))n++;
  return n===0?'unchecked':n===visibleIds.length?'checked':'indeterminate';
}
export function DsTable({columns=[],rows=[],rowKey='id',selectable=false,selectedIds=[],onToggleRow,onToggleVisible,onToggleAll,
  totalCount,allSelected=false,onSelectAll,onClearSelection,
  sortKey,sortDir='asc',onSort,activeId,onRowClick,rowLabel,stickyHeader=true,caption,ariaLabel,fixedLayout=false,empty,footer,children}){
  const S=useDsStrings();
  const [sl]=dsSlots(children,['empty','footer'],{empty:empty??S.noData,footer});
  const visibleIds=rows.map(r=>r[rowKey]);
  const headState=dsVisibleSelection(visibleIds,selectedIds,allSelected);
  const toggleVisible=next=>{
    if(onToggleVisible){onToggleVisible(visibleIds,next);return}
    if(onToggleAll){
      if(!dsWarnedToggleAll&&typeof console!=='undefined'){dsWarnedToggleAll=true;
        console.warn('DsTable: onToggleAll устарел — используйте onToggleVisible(visibleIds, next).')}
      onToggleAll(next);
    }
  };
  /* Строка открывается настоящей кнопкой в опорной колонке (`rowAction: true`,
     иначе первая): так её можно открыть с клавиатуры. Клик мышью по любому месту
     строки по-прежнему открывает её — кроме кликов по другим контролам в строке. */
  const actionKey=(columns.find(c=>c.rowAction)||columns[0]||{}).key;
  const canSelectAll=selectable&&onSelectAll&&totalCount!=null&&totalCount>rows.length;
  const pageAllOn=headState==='checked'&&!allSelected;
  const colSpan=columns.length+(selectable?1:0);
  /* The sortable header is a real <button>: sorting is an action, so it has to be
     reachable by keyboard and carry the :focus-visible ring like any other control. */
  const sortBtn={display:'flex',alignItems:'center',gap:4,width:'100%',minHeight:'var(--ds-row-h)',
    font:'inherit',color:'inherit',textAlign:'inherit',border:'none',padding:'var(--ds-cell-pad-y) var(--ds-cell-pad-x)',
    margin:0,cursor:'pointer',borderRadius:'var(--ds-radius-sm)',transition:'var(--ds-transition-control)'};
  const th={font:'var(--ds-type-body-strong)',
    color:'var(--ds-fg-muted)',textAlign:'left',padding:'var(--ds-cell-pad-y) var(--ds-cell-pad-x)',
    background:'var(--ds-bg)',borderBottom:'1px solid var(--ds-border)',whiteSpace:'nowrap',
    position:stickyHeader?'sticky':undefined,top:stickyHeader?0:undefined,zIndex:1};
  return <div style={{border:'1px solid var(--ds-border)',borderRadius:'var(--ds-radius-lg)',
    background:'var(--ds-surface)',overflow:'auto',minWidth:0}}>
    <table aria-label={ariaLabel} style={{width:'100%',tableLayout:fixedLayout?'fixed':'auto',borderCollapse:'collapse',font:'var(--ds-type-body)',color:'var(--ds-fg)'}}>
      {caption?<caption style={{textAlign:'left',padding:'var(--ds-pad-sm) var(--ds-cell-pad-x)',font:'var(--ds-type-body-strong)',color:'var(--ds-fg)',background:'var(--ds-surface)'}}>{caption}</caption>:null}
      <thead><tr>
        {selectable?<th scope="col" style={{...th,width:40,paddingRight:0}}>
          <DsCheckbox hit={24} state={headState} disabled={!rows.length} onChange={toggleVisible}
            ariaLabel={S.table.selectPage}/></th>:null}
        {columns.map(c=>{const active=sortKey===c.key,sortable=c.sortable&&onSort;
          return <th key={c.key} scope="col" style={{...th,width:c.width,textAlign:c.align||'left',padding:sortable?0:th.padding}}
            aria-sort={active?(sortDir==='asc'?'ascending':'descending'):sortable?'none':undefined}>
            <TableText action={sortable?()=>onSort(c.key,active&&sortDir==='asc'?'desc':'asc'):undefined}
              label={sortable?S.table.sort(c.label,active&&sortDir==='asc'?'desc':'asc'):undefined}
              style={sortable?{...sortBtn,color:active?'var(--ds-brand-text)':'inherit'}:undefined}
              trailing={sortable?<Icon name={active?(sortDir==='asc'?'arrow_upward':'arrow_downward'):'unfold_more'} size="var(--ds-icon-xs)" style={{flex:'none',color:active?'inherit':'var(--ds-fg-subtle)'}}/>:null}>{c.label}</TableText>
          </th>;})}
      </tr></thead>
      <tbody>
        {(canSelectAll&&pageAllOn)||(allSelected&&onClearSelection)?<tr><td colSpan={colSpan} role="status"
          style={{padding:'var(--ds-pad-tight) var(--ds-cell-pad-x)',textAlign:'center',font:'var(--ds-type-body)',
            color:'var(--ds-fg)',background:'var(--ds-brand-subtle)',borderBottom:'1px solid var(--ds-divider)'}}>
          {allSelected
            ?<>{S.table.allSelected(totalCount??0)+' '}<button type="button" onClick={onClearSelection} style={linkBtn}>{S.table.clearSelection}</button></>
            :<>{S.table.pageSelected(rows.length)+' '}<button type="button" onClick={onSelectAll} style={linkBtn}>{S.table.selectAllResults(totalCount)}</button></>}
        </td></tr>:null}
        {rows.length===0?<tr><td colSpan={columns.length+(selectable?1:0)}
          style={{padding:'32px var(--ds-cell-pad-x)',textAlign:'center',font:'var(--ds-type-body)',color:'var(--ds-fg-subtle)'}}>{sl.empty}</td></tr>:null}
        {rows.map(r=>{const k=r[rowKey],sel=allSelected||selectedIds.includes(k),act=activeId===k;
          const label=rowLabel?rowLabel(r):String(r[actionKey]??k);
          return <Row key={k} sel={sel} act={act} onClick={onRowClick?()=>onRowClick(r):undefined}>
            {selectable?<td style={{padding:'0 0 0 var(--ds-cell-pad-x)',width:40}}>
              <DsCheckbox hit={24} state={sel?'checked':'unchecked'} onChange={()=>onToggleRow&&onToggleRow(k)} ariaLabel={S.selectItem(label)}/></td>:null}
            {columns.map(c=><td key={c.key} style={{padding:'var(--ds-cell-pad-y) var(--ds-cell-pad-x)',
              textAlign:c.align||'left',font:c.mono?'var(--ds-type-mono)':undefined,
              fontWeight:c.strong?'var(--ds-weight-medium)':undefined,color:c.muted?'var(--ds-fg-muted)':undefined,
              whiteSpace:c.wrap?'normal':'nowrap',maxWidth:c.width,overflow:'hidden',textOverflow:'ellipsis'}}>
              <TableText action={onRowClick&&c.key===actionKey?()=>onRowClick(r):undefined} rowAction={!!onRowClick&&c.key===actionKey}
                active={act} wrap={c.wrap}>{c.render?c.render(r):r[c.key]}</TableText></td>)}
          </Row>;})}
      </tbody>
      {sl.footer?<tfoot><tr><td colSpan={columns.length+(selectable?1:0)}
        style={{padding:'var(--ds-pad-sm) var(--ds-cell-pad-x)',borderTop:'1px solid var(--ds-border)',background:'var(--ds-bg)'}}>{sl.footer}</td></tr></tfoot>:null}
    </table></div>;
}
const linkBtn={border:'none',background:'transparent',padding:0,margin:0,font:'var(--ds-type-ui)',
  color:'var(--ds-brand-text)',textDecoration:'underline',textUnderlineOffset:2,cursor:'pointer'};
const rowBtn={border:'none',background:'transparent',padding:0,margin:0,font:'inherit',color:'inherit',
  display:'block',width:'100%',textAlign:'inherit',cursor:'pointer',maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis',borderRadius:4};
/* Клик мышью мимо контролов открывает строку; клик по контролу — только его действие. */
const DS_CONTROL='button,a,input,select,textarea,label,[role="checkbox"],[role="button"],[role="menuitem"],[contenteditable="true"]';
function Row({sel,act,onClick,children}){
  const [h,setH]=React.useState(false);
  return <tr onClick={onClick?e=>{if(e.target.closest&&e.target.closest(DS_CONTROL))return;onClick(e)}:undefined} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{borderBottom:'1px solid var(--ds-divider)',height:'var(--ds-row-h)',cursor:onClick?'pointer':'default',
      background:sel||act?'var(--ds-surface-selected)':h?'var(--ds-surface-hover)':'transparent',
      backgroundImage:(sel||act)&&h?'linear-gradient(0deg,color-mix(in oklab,var(--ds-brand-text) var(--ds-overlay-hover),transparent),color-mix(in oklab,var(--ds-brand-text) var(--ds-overlay-hover),transparent))':undefined,
      boxShadow:act?'inset 2px 0 0 var(--ds-brand)':'none',
      transition:'background-color var(--ds-dur-fast) var(--ds-ease)'}}>{children}</tr>;
}

/** Полное значение показывается только при обрезке, в том числе с клавиатуры. */
function TableText({children,action,rowAction=false,active=false,wrap=false,label,trailing,style}){
  const textRef=React.useRef(null),rootRef=React.useRef(null),tipRef=React.useRef(null);
  const [clipped,setClipped]=React.useState(false),[interactive,setInteractive]=React.useState(false);
  const [tip,setTip]=React.useState(null),[hover,setHover]=React.useState(false);
  const tipId=React.useId();
  const hide=()=>setTip(null);
  const measure=()=>{
    const el=textRef.current;
    const cut=!!el&&!wrap&&el.scrollWidth>el.clientWidth;
    setClipped(cut);
    setInteractive(!!el?.querySelector(DS_CONTROL));
    return cut;
  };
  const show=()=>{
    if(!measure()){hide();return;}
    const el=textRef.current,r=el.getBoundingClientRect();
    setTip({text:el.textContent,left:r.left,top:r.bottom,above:r.top});
  };
  const refresh=()=>{if(rootRef.current?.contains(document.activeElement))show();else hide();};
  React.useLayoutEffect(()=>{
    measure();
    if(typeof ResizeObserver==='undefined')return;
    const observer=new ResizeObserver(()=>{measure();if(tipRef.current)refresh();});
    observer.observe(textRef.current);
    return ()=>observer.disconnect();
  },[children,wrap]);
  React.useLayoutEffect(()=>{
    if(!tip||!tipRef.current)return;
    const el=tipRef.current,r=el.getBoundingClientRect();
    el.style.left=Math.max(4,Math.min(tip.left,window.innerWidth-r.width-4))+'px';
    el.style.top=(tip.top+r.height<=window.innerHeight-4?tip.top:Math.max(4,tip.above-r.height))+'px';
  },[tip]);
  React.useEffect(()=>{
    if(!tip)return;
    const dismiss=e=>{if(e.key==='Escape'){e.preventDefault();hide();}};
    window.addEventListener('keydown',dismiss,true);
    window.addEventListener('scroll',refresh,true);window.addEventListener('resize',refresh);
    return ()=>{window.removeEventListener('keydown',dismiss,true);window.removeEventListener('scroll',refresh,true);window.removeEventListener('resize',refresh);};
  },[tip]);
  const Main=action?'button':'span';
  return <>
    <Main ref={rootRef} type={action?'button':undefined} onClick={action}
      data-ds-row-action={rowAction?'':undefined} aria-current={rowAction&&active?'true':undefined}
      aria-label={label} aria-describedby={tip?tipId:undefined}
      tabIndex={!action&&clipped&&!interactive?0:undefined}
      onFocusCapture={show} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))hide();}}
      onMouseEnter={()=>{setHover(true);show();}}
      onMouseLeave={e=>{setHover(false);if(!tipRef.current?.contains(e.relatedTarget))hide();}}
      onKeyDown={e=>{if(e.key==='Escape'&&tip){e.preventDefault();hide();}}}
      style={{...(action?rowBtn:{display:'block',minWidth:0}),...style,
        background:action&&trailing&&hover?'var(--ds-surface-hover)':action?'transparent':undefined}}>
      <span ref={textRef} data-ds-table-text="" style={{display:'block',minWidth:0,flex:1,
        overflow:wrap?'visible':'hidden',textOverflow:wrap?undefined:'ellipsis',whiteSpace:wrap?'normal':'nowrap'}}>{children}</span>
      {trailing}
    </Main>
    {tip?createPortal(<span id={tipId} ref={tipRef} role="tooltip"
      onMouseLeave={hide} onClick={e=>e.stopPropagation()}
      style={{position:'fixed',left:tip.left,top:tip.top,zIndex:1000,maxWidth:'min(320px, calc(100vw - 8px))',
        padding:'var(--ds-pad-tight) var(--ds-pad-sm)',borderRadius:'var(--ds-radius-sm)',
        background:'var(--ds-surface-inverse)',color:'var(--ds-fg-on-inverse)',font:'var(--ds-type-caption)',
        whiteSpace:'normal',overflowWrap:'anywhere',boxShadow:'var(--ds-shadow-sm)'}}>{tip.text}</span>,document.body):null}
  </>;
}
