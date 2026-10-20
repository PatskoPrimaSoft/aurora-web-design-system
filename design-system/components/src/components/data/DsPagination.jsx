import React from 'react';
import { DsButton } from '../buttons/DsButton.jsx';
import { DsIconButton } from '../buttons/DsIconButton.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

/** Keep the first, last and current pages visible without rendering the entire result set. */
function pageItems(current,total,max){
  if(total<=max)return Array.from({length:total},(_,i)=>i+1);
  if(current<=max-3)return [...Array.from({length:max-2},(_,i)=>i+1),'end',total];
  if(current>=total-max+4)return [1,'start',...Array.from({length:max-2},(_,i)=>total-max+3+i)];
  const count=max-4,start=current-Math.floor(count/2);
  return [1,'start',...Array.from({length:count},(_,i)=>start+i),'end',total];
}

/** Range, optional page-size select and page navigation for a panel footer. */
export function DsPagination({page=0,pageSize=25,length=0,pageSizeOptions=[10,25,50,100],
  onPageChange,onPageSizeChange,compact=false,ariaLabel}){
  const S=useDsStrings(),ref=React.useRef(null);
  const [max,setMax]=React.useState(5);
  React.useEffect(()=>{
    if(compact||typeof ResizeObserver==='undefined')return;
    const observer=new ResizeObserver(entries=>setMax(entries[0].contentRect.width>=600?7:5));
    observer.observe(ref.current);
    return ()=>observer.disconnect();
  },[compact]);
  const total=Math.ceil(length/pageSize),last=Math.max(0,total-1);
  const from=length===0?0:page*pageSize+1;
  const to=Math.min(length,(page+1)*pageSize);
  const go=p=>{const next=Math.min(last,Math.max(0,p));if(next!==page&&onPageChange)onPageChange(next)};
  return <nav ref={ref} aria-label={ariaLabel??S.pagination.label}
    style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'var(--ds-gap-sm-plus)',
      flexWrap:'wrap',minWidth:0,width:'100%'}}>
    {!compact&&onPageSizeChange?<label style={{display:'inline-flex',alignItems:'center',gap:'var(--ds-gap-sm)',
      font:'var(--ds-type-caption)',color:'var(--ds-fg-muted)'}}>{S.pagination.rows}
      <select value={pageSize} onChange={e=>onPageSizeChange(Number(e.target.value))}
        style={{height:'var(--ds-control-h-sm)',padding:'0 6px',border:'1px solid var(--ds-border-field)',
          borderRadius:'var(--ds-radius-xs)',background:'var(--ds-surface)',color:'var(--ds-fg)',font:'var(--ds-type-caption)'}}>
        {pageSizeOptions.map(o=><option key={o} value={o}>{o}</option>)}</select></label>:null}
    <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',flexWrap:'wrap',
      gap:'var(--ds-gap-sm-plus)',marginLeft:'auto',minWidth:0}}>
      <span style={{font:'var(--ds-type-caption)',fontFamily:'var(--ds-font-mono)',color:'var(--ds-fg-muted)',whiteSpace:'nowrap'}}>
        {S.pagination.range(from,to,length)}</span>
      <span style={{display:'inline-flex',alignItems:'center',gap:2}}>
        <DsIconButton icon="chevron_left" label={S.pagination.prev} size="sm" disabled={page<=0} onClick={()=>go(page-1)}/>
        {!compact?pageItems(page+1,total,max).map(item=>typeof item==='number'?
          <DsButton key={item} size="sm" tone={item===page+1?'subtle':'ghost'}
            aria-label={S.pagination.page(item)} aria-current={item===page+1?'page':undefined}
            onClick={()=>go(item-1)}>{item}</DsButton>:
          <span key={item} aria-hidden="true" style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-muted)',padding:'0 4px'}}>…</span>):null}
        <DsIconButton icon="chevron_right" label={S.pagination.next} size="sm" disabled={page>=last} onClick={()=>go(page+1)}/>
      </span>
    </div>
  </nav>;
}
