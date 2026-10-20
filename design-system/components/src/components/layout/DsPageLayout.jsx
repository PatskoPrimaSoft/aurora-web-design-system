import React from 'react';
import {DsButton} from '../buttons/DsButton.jsx';
import {useDsStrings} from '../primitives/DsStrings.jsx';

/* Recognized slots are always consumed. An explicit prop (including null)
   overrides the slot; duplicate slot children never become main content. */
export function dsSlots(children,names,given){
  const out=Object.assign({},given),rest=[];
  React.Children.forEach(children,c=>{const s=c&&c.props&&(c.props.slot||c.props['data-slot']);
    if(s&&names.indexOf(s)>=0){if(out[s]===undefined)out[s]=c}else rest.push(c)});
  return[out,rest];
}

/** Page shell; responsive disclosure and scrolling are explicit opt-ins. */
export function DsPageLayout({header,pageHeader,left,right,children,leftWidth,rightWidth='var(--ds-panel-right-w)',gap=true,padding=gap,footer,
  responsive=false,responsiveBreakpoint=768,mainMinWidth=320,scroll='none',mainId,leftLabel,rightLabel,skipLink=true,skipLinkLabel}){
  const [s,main]=dsSlots(children,['header','pageHeader','left','right','footer'],{header,pageHeader,left,right,footer});
  const strings=useDsStrings(),uid=React.useId(),id=mainId||'ds-page-main-'+uid;
  const root=React.useRef(null),mainRef=React.useRef(null),smallRef=React.useRef(false),pendingFocus=React.useRef(null);
  const [narrow,setNarrow]=React.useState(false),[expanded,setExpanded]=React.useState({left:false,right:false});
  const labels={left:leftLabel||strings.layout.left,right:rightLabel||strings.layout.right};
  React.useLayoutEffect(()=>{
    const node=root.current;
    function measure(){
      const win=node.ownerDocument.defaultView;
      let requiredWidth=mainMinWidth;
      if(responsive){
        const area=win.getComputedStyle(mainRef.current.parentElement);
        requiredWidth+=parseFloat(area.paddingLeft)||0;
        requiredWidth+=parseFloat(area.paddingRight)||0;
        for(const [side,width] of [['left',leftWidth??'var(--ds-panel-w)'],['right',rightWidth]]){
          if(s[side]==null||s[side]===false)continue;
          // Measure CSS lengths in the shell's own scope, even while panels are hidden.
          const probe=node.ownerDocument.createElement('div');
          Object.assign(probe.style,{position:'absolute',visibility:'hidden',height:'0px',width:typeof width==='number'?width+'px':width});
          probe.setAttribute('aria-hidden','true');node.appendChild(probe);
          requiredWidth+=probe.getBoundingClientRect().width+(parseFloat(area.gap)||0);probe.remove();
        }
      }
      const small=responsive&&node.getBoundingClientRect().width<Math.max(responsiveBreakpoint,requiredWidth);
      if(small===smallRef.current)return;
      const active=node.ownerDocument.activeElement;
      if(small){
        for(const side of ['left','right'])if(node.querySelector('[data-ds-page-panel="'+side+'"]')?.contains(active))pendingFocus.current=side;
        setExpanded({left:false,right:false});
      }else if(node.querySelector('[data-ds-page-toggles]')?.contains(active))pendingFocus.current='main';
      smallRef.current=small;setNarrow(small);
    }
    measure();
    const win=node.ownerDocument.defaultView;
    if(win.ResizeObserver){const observer=new win.ResizeObserver(measure);observer.observe(node);return()=>observer.disconnect()}
    win.addEventListener('resize',measure);return()=>win.removeEventListener('resize',measure);
  },[responsive,responsiveBreakpoint,mainMinWidth,leftWidth,rightWidth,gap,padding,!!s.left,!!s.right]);
  React.useLayoutEffect(()=>{
    const target=pendingFocus.current;
    if(target){(target==='main'?mainRef.current:root.current.querySelector('[data-ds-page-toggle="'+target+'"]'))?.focus();pendingFocus.current=null}
  },[narrow]);
  const spacing=gap?'var(--ds-gap-sm-plus)':0,regions=scroll==='regions',page=scroll==='page';
  function panel(side,width){
    if(s[side]==null||s[side]===false)return null;
    const hidden=narrow&&!expanded[side];
    return <aside id={id+'-'+side} data-ds-page-panel={side} aria-label={labels[side]} hidden={hidden}
      style={{flex:'none',width:narrow?'auto':width,minWidth:0,display:hidden?'none':'flex',flexDirection:'column',gap:spacing,minHeight:0,
        overflow:regions?'auto':undefined,maxHeight:narrow&&regions?'40%':undefined}}>{s[side]}</aside>;
  }
  return <div ref={root} data-ds-page-layout="" style={{position:'relative',height:'100%',minHeight:0,minWidth:0,display:'flex',flexDirection:'column',
    background:'var(--ds-bg)',color:'var(--ds-fg)',overflow:regions?'hidden':page?'auto':undefined}}>
    {skipLink?<a data-ds-page-skip="" href={'#'+id} onClick={e=>{e.preventDefault();mainRef.current.focus()}}>{skipLinkLabel||strings.layout.skip}</a>:null}
    {s.header!=null?<div style={{flex:'none'}}>{s.header}</div>:null}
    {s.pageHeader!=null?<div style={{flex:'none'}}>{s.pageHeader}</div>:null}
    {narrow&&(s.left||s.right)?<div data-ds-page-toggles="" style={{flex:'none',display:'flex',flexWrap:'wrap',gap:spacing,padding:'var(--ds-gap-sm-plus)'}}>
      {['left','right'].map(side=>s[side]?<DsButton key={side} data-ds-page-toggle={side} tone="secondary" aria-controls={id+'-'+side} aria-expanded={expanded[side]}
        onClick={e=>{
          if(expanded[side]&&root.current.querySelector('[data-ds-page-panel="'+side+'"]')?.contains(root.current.ownerDocument.activeElement))e.currentTarget.focus();
          setExpanded(value=>({...value,[side]:!value[side]}));
        }}>{labels[side]}</DsButton>:null)}
    </div>:null}
    <div style={{flex:page?'none':1,minHeight:0,display:'flex',flexDirection:narrow?'column':'row',gap:spacing,
      padding:padding?'var(--ds-gap-sm-plus)':0,minWidth:0,overflow:regions?'hidden':undefined}}>
      {panel('left',leftWidth??'var(--ds-panel-w)')}
      <main id={id} ref={mainRef} tabIndex={-1} style={{flex:1,minWidth:0,minHeight:0,display:'flex',flexDirection:'column',gap:spacing,overflow:regions?'auto':undefined}}>{main}</main>
      {panel('right',rightWidth)}
    </div>
    {s.footer!=null?<div style={{flex:'none'}}>{s.footer}</div>:null}
  </div>;
}
