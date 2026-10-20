import React from 'react';
import { DsIconButton } from '../buttons/DsIconButton.jsx';
import { DsSkeleton } from '../feedback/DsSpinner.jsx';
import { DsEmptyState } from '../feedback/DsEmptyState.jsx';
import { useDsStrings } from '../primitives/DsStrings.jsx';

const Ds_SER=i=>'var(--ds-series-'+((i%8)+1)+')';
const Ds_TONE={danger:'var(--ds-danger-solid)',warning:'var(--ds-warning-solid)',success:'var(--ds-success-solid)',info:'var(--ds-info-solid)',neutral:'var(--ds-neutral-solid)'};
const dsNum=v=>v==null||Number.isNaN(v)?'—':(Math.round(v*100)/100).toLocaleString('en-US');
function dsNice(min,max,n){if(!(max>min)){max=min+1}const raw=(max-min)/n,mag=Math.pow(10,Math.floor(Math.log10(raw))),nm=raw/mag;const step=(nm<=1?1:nm<=2?2:nm<=2.5?2.5:nm<=5?5:10)*mag;return{lo:Math.floor(min/step)*step,hi:Math.ceil(max/step)*step,step}}
/* Width measurement. ResizeObserver is inert in some preview iframes, so it is one
   of four sources: the layout effect, a frame later, a timeout, and window resize —
   and getBoundingClientRect wins over clientWidth, which can still read 0 while the
   rect is settled. A fallback width keeps the plot from ever drawing at zero. */
function dsUseW(ref,fallback){const[w,setW]=React.useState(0);
  React.useLayoutEffect(()=>{const el=ref.current;if(!el)return;
    const read=()=>{const r=el.getBoundingClientRect();const x=Math.round(r.width||el.clientWidth||0);
      if(x)setW(p=>Math.abs(x-p)>0.5?x:p)};
    read();const raf=requestAnimationFrame(read),t=setTimeout(read,60);
    let ro;if(typeof ResizeObserver!=='undefined'){ro=new ResizeObserver(read);ro.observe(el)}
    window.addEventListener('resize',read);
    return()=>{cancelAnimationFrame(raf);clearTimeout(t);if(ro)ro.disconnect();window.removeEventListener('resize',read)}},[ref]);
  return w||fallback}
const dsAt=(d,i)=>{const p=d&&d[i];return Array.isArray(p)?p[1]:p};

/** Series swatches. Click toggles a series, the same gesture as the ECharts legend. */
export function DsChartLegend({series=[],hidden=[],onToggle,style}){
  return <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'var(--ds-gap-sm-plus)',...style}}>
    {series.map((s,i)=>{const off=hidden.indexOf(s.name)>-1;const c=s.color||Ds_SER(i);
      return <button key={s.name} type="button" onClick={onToggle?()=>onToggle(s.name):undefined} aria-pressed={!off}
        style={{display:'inline-flex',alignItems:'center',gap:6,padding:0,border:'none',background:'none',cursor:onToggle?'pointer':'default',
          font:'var(--ds-type-caption)',color:off?'var(--ds-fg-disabled)':'var(--ds-fg-muted)'}}>
        <span aria-hidden="true" style={{width:14,height:3,borderRadius:2,flex:'none',background:off?'var(--ds-fg-disabled)':c}}/>
        <span>{s.name}</span>{s.unit?<span style={{color:'var(--ds-fg-subtle)'}}>{s.unit}</span>:null}
      </button>;})}
  </div>;
}

/** The axis readout. Inverse ground, mono values — one row per visible series. */
export function DsChartTooltip({label,rows=[],style}){
  return <div role="status" style={{minWidth:150,padding:'8px 10px',borderRadius:'var(--ds-radius-md)',
    background:'var(--ds-chart-tooltip-bg)',color:'var(--ds-chart-tooltip-fg)',boxShadow:'var(--ds-shadow-md)',...style}}>
    {label?<div style={{font:'var(--ds-type-eyebrow)',color:'var(--ds-chart-tooltip-muted)',marginBottom:6}}>{label}</div>:null}
    <div style={{display:'flex',flexDirection:'column',gap:4}}>{rows.map(r=>
      <div key={r.name} style={{display:'flex',alignItems:'center',gap:8}}>
        <span aria-hidden="true" style={{width:8,height:8,borderRadius:'50%',flex:'none',background:r.color}}/>
        <span style={{font:'var(--ds-type-caption)',flex:1,whiteSpace:'nowrap'}}>{r.name}</span>
        <span style={{font:'var(--ds-type-mono)',fontWeight:500}}>{r.value}{r.unit?<span style={{color:'var(--ds-chart-tooltip-muted)'}}> {r.unit}</span>:null}</span>
      </div>)}</div>
  </div>;
}

const dsToolbox=S=>[{icon:'crop_free',label:S.chart.zoom},{icon:'table_chart',label:S.chart.data},{icon:'visibility_off',label:S.chart.invalid},{icon:'settings',label:S.chart.settings},{icon:'refresh',label:S.chart.reset,action:'reset'},{icon:'download',label:S.chart.download}];

/** Cartesian plot: line / area / bar, one y axis, optional zoom brush and toolbox rail. */
export function DsChart({title,subtitle,series=[],categories=[],type='line',height=260,yUnit,yTicks=4,yMin,yMax,
  legend=true,toolbox=false,zoom=false,showMinMax=false,thresholds=[],markAreas=[],stepped=false,
  loading=false,empty=false,emptyIcon='assessment',emptyTitle,emptyDescription,emptyAction,actions,style}){
  const S=useDsStrings();
  const ref=React.useRef(null),W=dsUseW(ref,720);
  const [hidden,setHidden]=React.useState([]);
  const [win,setWin]=React.useState(null);
  const [hover,setHover]=React.useState(null);
  const n=Math.max(categories.length,...series.map(s=>(s.data||[]).length),0);
  const a=win?win[0]:0,b=win?win[1]:Math.max(0,n-1);
  const vis=series.filter(s=>hidden.indexOf(s.name)<0);
  const tools=toolbox===true?dsToolbox(S):(toolbox||[]);
  const H=typeof height==='number'?height:260;
  const padL=46,padR=tools.length?38:12,padT=12,padB=22;
  const plotW=Math.max(0,W-padL-padR);
  const head=title||subtitle||actions;

  let lo=0,hi=1,step=1;
  if(vis.length){const vals=[];for(const s of vis)for(let i=a;i<=b;i++){const v=dsAt(s.data,i);if(typeof v==='number'&&!Number.isNaN(v))vals.push(v)}
    if(vals.length){let mn=Math.min(...vals),mx=Math.max(...vals);
      /* a filled series must reach its own zero: an area whose baseline is the lowest
         reading claims "empty" at that reading. Bars measure from zero for the same
         reason. A line has no baseline, so it may be truncated. */
      if(type==='bar'||type==='area'||vis.some(s=>s.type==='area'||s.type==='bar'))mn=Math.min(0,mn);
      if(typeof yMin==='number')mn=yMin;if(typeof yMax==='number')mx=yMax;
      const s2=dsNice(mn,mx,yTicks);lo=s2.lo;hi=s2.hi;step=s2.step}}
  const ticks=[];for(let v=lo;v<=hi+step/2;v+=step)ticks.push(Math.round(v*1e6)/1e6);

  const band=plotW/Math.max(1,b-a+1);
  const px=i=>type==='bar'?padL+band*(i-a+0.5):padL+(b>a?(i-a)/(b-a)*plotW:plotW/2);
  const py=(v,ph)=>padT+(hi-v)/(hi-lo||1)*ph;
  const labelEvery=Math.max(1,Math.ceil((b-a+1)/Math.max(2,Math.floor(plotW/(type==='bar'?48:78)))));

  const body=(ph)=><svg width="100%" height={ph+padT+padB} style={{display:'block',overflow:'visible'}}
    onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();const x=e.clientX-r.left;
      if(x<padL-4||x>padL+plotW+4||!n){setHover(null);return}
      const i=type==='bar'?Math.min(b,a+Math.floor((x-padL)/band)):a+Math.round((b>a?(x-padL)/plotW:0)*(b-a));
      setHover(Math.max(a,Math.min(b,i)))}}
    onPointerLeave={()=>setHover(null)}>
    {markAreas.map((m,k)=><rect key={k} x={px(m.from)} y={padT} width={Math.max(2,px(m.to)-px(m.from))} height={ph}
      fill={m.color||'var(--ds-chart-mark-area)'}/>)}
    {ticks.map(v=><g key={v}>
      <line x1={padL} x2={padL+plotW} y1={py(v,ph)} y2={py(v,ph)} stroke="var(--ds-chart-grid)" strokeWidth="1" strokeDasharray="2 3"/>
      <text x={padL-8} y={py(v,ph)+4} textAnchor="end" style={{font:'var(--ds-type-eyebrow)',fontWeight:'var(--ds-weight-regular)',fontFamily:'var(--ds-font-mono)'}} fill="var(--ds-chart-label)">{dsNum(v)}</text>
    </g>)}
    <line x1={padL} x2={padL+plotW} y1={padT+ph} y2={padT+ph} stroke="var(--ds-chart-axis)" strokeWidth="1"/>
    {categories.slice(a,b+1).map((c,k)=>{const i=a+k;if((i-a)%labelEvery)return null;
      return <text key={i} x={px(i)} y={padT+ph+15} textAnchor={i===a?'start':i>=b?'end':'middle'}
        style={{font:'var(--ds-type-eyebrow)',fontWeight:'var(--ds-weight-regular)'}} fill="var(--ds-chart-label)">{c}</text>})}
    {thresholds.map((t,k)=><g key={k}>
      <line x1={padL} x2={padL+plotW} y1={py(t.value,ph)} y2={py(t.value,ph)} strokeWidth="1" strokeDasharray="5 4"
        stroke={t.tone?Ds_TONE[t.tone]:'var(--ds-chart-threshold)'}/>
      {t.label?<text x={padL+plotW-2} y={py(t.value,ph)-5} textAnchor="end" style={{font:'var(--ds-type-eyebrow)',fontWeight:'var(--ds-weight-medium)'}}
        fill={t.tone?Ds_TONE[t.tone]:'var(--ds-chart-threshold)'}>{t.label}</text>:null}
    </g>)}
    {series.map((s,si)=>{if(hidden.indexOf(s.name)>-1)return null;const c=s.color||Ds_SER(si);const kind=s.type||type;
      if(kind==='bar'){const cnt=vis.length,bw=Math.max(2,Math.min(22,band*0.68/cnt)),off=vis.indexOf(s);
        return <g key={s.name}>{Array.from({length:b-a+1},(_,k)=>{const i=a+k,v=dsAt(s.data,i);if(typeof v!=='number')return null;
          const y0=py(Math.max(lo,0),ph),y=py(v,ph);
          return <rect key={i} x={px(i)-(bw*cnt+2*(cnt-1))/2+off*(bw+2)} y={Math.min(y,y0)} width={bw} height={Math.max(1,Math.abs(y0-y))}
            rx="2" fill={c} opacity={hover!=null&&hover!==i?0.75:1}/>})}</g>}
      const segs=[];let cur=[];
      for(let i=a;i<=b;i++){const v=dsAt(s.data,i);
        if(typeof v!=='number'||Number.isNaN(v)){if(cur.length)segs.push(cur);cur=[];continue}
        if(stepped&&cur.length)cur.push([px(i),cur[cur.length-1][1]]);
        cur.push([px(i),py(v,ph)])}
      if(cur.length)segs.push(cur);
      return <g key={s.name}>
        {kind==='area'?segs.map((sg,k)=><path key={'a'+k} d={'M'+sg.map(p=>p[0]+' '+p[1]).join('L')+'L'+sg[sg.length-1][0]+' '+(padT+ph)+'L'+sg[0][0]+' '+(padT+ph)+'Z'}
          fill={'color-mix(in oklab,'+c+' 16%,transparent)'} stroke="none"/>):null}
        {segs.map((sg,k)=><path key={k} d={'M'+sg.map(p=>p[0]+' '+p[1]).join('L')} fill="none" stroke={c}
          strokeWidth={'var(--ds-chart-line-w'+(s.thin?'-thin':'')+')'} strokeLinejoin="round" strokeLinecap="round"/>)}
      </g>;})}
    {showMinMax?vis.map((s,k)=>{const si=series.indexOf(s),c=s.color||Ds_SER(si);const pts=[];
      for(let i=a;i<=b;i++){const v=dsAt(s.data,i);if(typeof v==='number'&&!Number.isNaN(v))pts.push([i,v])}
      if(!pts.length)return null;
      const mx=pts.reduce((m,p)=>p[1]>m[1]?p:m),mn=pts.reduce((m,p)=>p[1]<m[1]?p:m);
      return <g key={'mm'+k}>{[mx,mn].map((p,j)=><g key={j}>
        <circle cx={px(p[0])} cy={py(p[1],ph)} r="3" fill={c} stroke="var(--ds-chart-marker-stroke)" strokeWidth="1.5"/>
        <text x={px(p[0])} y={py(p[1],ph)+(j?16:-8)} textAnchor="middle" style={{font:'var(--ds-type-eyebrow)',fontWeight:'var(--ds-weight-medium)',fontFamily:'var(--ds-font-mono)'}} fill={c}>{dsNum(p[1])}</text>
      </g>)}</g>;}):null}
    {hover!=null&&vis.length?<g>
      <line x1={px(hover)} x2={px(hover)} y1={padT} y2={padT+ph} stroke="var(--ds-chart-crosshair)" strokeWidth="1" strokeDasharray="3 3"/>
      {vis.map(s=>{const si=series.indexOf(s),v=dsAt(s.data,hover);if(typeof v!=='number'||Number.isNaN(v))return null;
        return <circle key={s.name} cx={px(hover)} cy={py(v,ph)} r="var(--ds-chart-dot-r)" fill={s.color||Ds_SER(si)}
          stroke="var(--ds-chart-marker-stroke)" strokeWidth="2"/>})}
    </g>:null}
  </svg>;

  const zoomRef=React.useRef(null);
  function brush(e,mode){if(!n)return;e.preventDefault();e.currentTarget.setPointerCapture?.(e.pointerId);
    const tr=zoomRef.current.getBoundingClientRect(),x0=e.clientX,sa=a,sb=b;
    const move=ev=>{const d=(ev.clientX-x0)/Math.max(1,tr.width)*(n-1);
      if(mode==='l')setWin([Math.max(0,Math.min(sb-1,Math.round(sa+d))),sb]);
      else if(mode==='r')setWin([sa,Math.min(n-1,Math.max(sa+1,Math.round(sb+d)))]);
      else{const k=Math.max(-sa,Math.min(n-1-sb,Math.round(d)));setWin([sa+k,sb+k])}};
    const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up)};
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',up)}

  const ph=H?H-padT-padB:null;
  const tip=hover!=null&&vis.length?{label:categories[hover],rows:vis.map(s=>({name:s.name,color:s.color||Ds_SER(series.indexOf(s)),
    value:dsNum(dsAt(s.data,hover)),unit:s.unit||yUnit}))}:null;

  return <div style={{display:'flex',flexDirection:'column',minWidth:0,gap:'var(--ds-gap-sm)',...style}}>
    {head?<div style={{display:'flex',alignItems:'flex-start',gap:'var(--ds-gap-sm)',minWidth:0}}>
      <div style={{minWidth:0,display:'flex',flexDirection:'column',gap:1}}>
        {title?<span style={{font:'var(--ds-type-body-strong)',color:'var(--ds-fg-strong)'}}>{title}</span>:null}
        {subtitle?<span style={{font:'var(--ds-type-caption)',color:'var(--ds-fg-muted)'}}>{subtitle}</span>:null}
      </div>
      {actions?<div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'var(--ds-gap-sm)',flex:'none'}}>{actions}</div>:null}
    </div>:null}
    {legend&&series.length>1?<DsChartLegend series={series} hidden={hidden}
      onToggle={name=>setHidden(h=>h.indexOf(name)>-1?h.filter(x=>x!==name):h.length+1<series.length?[...h,name]:h)}/>:null}
    <div ref={ref} style={{position:'relative',minWidth:0}}>
      {loading?<div style={{height:H,display:'flex',flexDirection:'column',justifyContent:'flex-end',gap:'var(--ds-gap-sm)',padding:'var(--ds-pad-sm) 0'}}>
        {[64,88,52,76,40].map((h,i)=><DsSkeleton key={i} height={4} width={h+'%'}/>)}</div>
      :empty||!n?<div style={{height:H,display:'grid',placeItems:'center'}}>
        <DsEmptyState size="sm" icon={emptyIcon} title={emptyTitle??S.noData} description={emptyDescription} action={emptyAction}/></div>
      :<>
        {body(ph)}
        {tools.length?<div style={{position:'absolute',right:0,top:'50%',transform:'translateY(-50%)',display:'flex',flexDirection:'column',gap:2}}>
          {tools.map(t=><DsIconButton key={t.label} size="sm" icon={t.icon} label={t.label}
            onClick={t.onClick||(t.action==='reset'?()=>setWin(null):undefined)}/>)}</div>:null}
        {tip?<div style={{position:'absolute',left:Math.min(Math.max(px(hover)+12,0),Math.max(0,W-170)),top:padT,pointerEvents:'none'}}>
          <DsChartTooltip label={tip.label} rows={tip.rows}/></div>:null}
        {zoom?<div ref={zoomRef} style={{position:'relative',height:26,marginRight:padR,marginLeft:padL,marginTop:2,
          background:'var(--ds-chart-zoom-bg)',border:'1px solid var(--ds-border)',borderRadius:'var(--ds-radius-xs)',overflow:'hidden'}}>
          <svg width="100%" height="24" style={{display:'block',position:'absolute',inset:0}} preserveAspectRatio="none" viewBox={'0 0 '+Math.max(1,n-1)+' 24'}>
            {(()=>{const s=vis[0];if(!s)return null;const vals=[];for(let i=0;i<n;i++)vals.push(dsAt(s.data,i));
              const ok=vals.filter(v=>typeof v==='number');if(!ok.length)return null;const mn=Math.min(...ok),mx=Math.max(...ok);
              const d=vals.map((v,i)=>typeof v==='number'?i+' '+(22-(v-mn)/(mx-mn||1)*20):null).filter(Boolean).join('L');
              return <path d={'M'+d} fill="none" stroke="var(--ds-chart-zoom-preview)" strokeWidth="1" vectorEffect="non-scaling-stroke"/>})()}
          </svg>
          <div onPointerDown={e=>brush(e,'m')} style={{position:'absolute',top:0,bottom:0,cursor:'grab',
            left:(a/Math.max(1,n-1))*100+'%',width:((b-a)/Math.max(1,n-1))*100+'%',
            background:'var(--ds-chart-zoom-window)',borderLeft:'2px solid var(--ds-chart-zoom-handle)',borderRight:'2px solid var(--ds-chart-zoom-handle)'}}/>
          <div onPointerDown={e=>brush(e,'l')} style={{position:'absolute',top:0,bottom:0,width:10,marginLeft:-5,cursor:'ew-resize',left:(a/Math.max(1,n-1))*100+'%'}}/>
          <div onPointerDown={e=>brush(e,'r')} style={{position:'absolute',top:0,bottom:0,width:10,marginLeft:-5,cursor:'ew-resize',left:(b/Math.max(1,n-1))*100+'%'}}/>
        </div>:null}
      </>}
    </div>
  </div>;
}
