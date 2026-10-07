import React from 'react';
import { DsIcon as Icon } from '../primitives/DsIcon.jsx';
import { DsCheckButton } from '../primitives/DsCheck.jsx';
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
  sortKey,sortDir='asc',onSort,activeId,onRowClick,rowLabel,stickyHeader=true,empty,footer,children}){
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
  const sortBtn={display:'inline-flex',alignItems:'center',gap:4,font:'inherit',letterSpacing:'inherit',
    textTransform:'inherit',background:'none',border:'none',padding:0,margin:0,cursor:'pointer',
    borderRadius:4,transition:'color var(--ds-dur-fast) var(--ds-ease)'};
  const th={font:'var(--ds-type-eyebrow)',letterSpacing:'var(--ds-tracking-eyebrow)',textTransform:'uppercase',
    color:'var(--ds-fg-subtle)',textAlign:'left',padding:'var(--ds-cell-pad-y) var(--ds-cell-pad-x)',
    background:'var(--ds-bg)',borderBottom:'1px solid var(--ds-border)',whiteSpace:'nowrap',
    position:stickyHeader?'sticky':undefined,top:stickyHeader?0:undefined,zIndex:1};
  return <div style={{border:'1px solid var(--ds-border)',borderRadius:'var(--ds-radius-container)',
    background:'var(--ds-surface)',overflow:'auto',minWidth:0}}>
    <table style={{width:'100%',borderCollapse:'collapse',font:'var(--ds-type-body)',color:'var(--ds-fg)'}}>
      <thead><tr>
        {selectable?<th style={{...th,width:40,paddingRight:0}}>
          <DsCheckButton hit={24} state={headState} disabled={!rows.length} onChange={()=>toggleVisible(headState==='checked'?'unchecked':'checked')}
            label={S.table.selectPage}/></th>:null}
        {columns.map(c=>{const active=sortKey===c.key,sortable=c.sortable&&onSort;
          return <th key={c.key} style={{...th,width:c.width,textAlign:c.align||'left'}}
            aria-sort={active?(sortDir==='asc'?'ascending':'descending'):sortable?'none':undefined}>
            {sortable
              ?<button type="button" onClick={()=>onSort(c.key,active&&sortDir==='asc'?'desc':'asc')}
                style={{...sortBtn,color:active?'var(--ds-brand-text)':'inherit'}}>
                {c.label}<Icon name={active?(sortDir==='asc'?'arrow_upward':'arrow_downward'):'unfold_more'} size="var(--ds-icon-xs)" style={{color:active?'inherit':'var(--ds-fg-subtle)'}}/></button>
              :<span style={{display:'inline-flex',alignItems:'center',gap:4}}>{c.label}</span>}
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
              <DsCheckButton hit={24} state={sel?'checked':'unchecked'} onChange={()=>onToggleRow&&onToggleRow(k)} label={S.selectItem(label)}/></td>:null}
            {columns.map(c=><td key={c.key} style={{padding:'var(--ds-cell-pad-y) var(--ds-cell-pad-x)',
              textAlign:c.align||'left',font:c.mono?'var(--ds-type-mono)':undefined,
              fontWeight:c.strong?'var(--ds-weight-medium)':undefined,color:c.muted?'var(--ds-fg-muted)':undefined,
              whiteSpace:c.wrap?'normal':'nowrap',maxWidth:c.width,overflow:'hidden',textOverflow:'ellipsis'}}>
              {onRowClick&&c.key===actionKey
                ?<button type="button" data-ds-row-action="" aria-current={act?'true':undefined} onClick={()=>onRowClick(r)} style={rowBtn}>
                  {c.render?c.render(r):r[c.key]}</button>
                :c.render?c.render(r):r[c.key]}</td>)}
          </Row>;})}
      </tbody>
      {sl.footer?<tfoot><tr><td colSpan={columns.length+(selectable?1:0)}
        style={{padding:'var(--ds-pad-sm) var(--ds-cell-pad-x)',borderTop:'1px solid var(--ds-border)',background:'var(--ds-bg)'}}>{sl.footer}</td></tr></tfoot>:null}
    </table></div>;
}
const linkBtn={border:'none',background:'transparent',padding:0,margin:0,font:'var(--ds-type-ui)',
  color:'var(--ds-brand-text)',textDecoration:'underline',textUnderlineOffset:2,cursor:'pointer'};
const rowBtn={border:'none',background:'transparent',padding:0,margin:0,font:'inherit',color:'inherit',
  textAlign:'inherit',cursor:'pointer',maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis',borderRadius:4};
/* Клик мышью мимо контролов открывает строку; клик по контролу — только его действие. */
const DS_CONTROL='button,a,input,select,textarea,label,[role="checkbox"],[role="button"],[role="menuitem"],[contenteditable="true"]';
function Row({sel,act,onClick,children}){
  const [h,setH]=React.useState(false);
  return <tr onClick={onClick?e=>{if(e.target.closest&&e.target.closest(DS_CONTROL))return;onClick(e)}:undefined} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{borderBottom:'1px solid var(--ds-divider)',height:'var(--ds-row-h)',cursor:onClick?'pointer':'default',
      background:sel||act?'var(--ds-surface-selected)':h?'var(--ds-surface-hover)':'transparent',
      boxShadow:act?'inset 2px 0 0 var(--ds-brand)':'none',
      transition:'background-color var(--ds-dur-fast) var(--ds-ease)'}}>{children}</tr>;
}
