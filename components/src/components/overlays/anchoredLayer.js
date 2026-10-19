import React from 'react';

export const FOCUSABLE='button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
export const focusableIn=node=>Array.from(node.querySelectorAll(FOCUSABLE)).filter(el=>el.tabIndex>=0&&!el.closest('[inert]')&&(el.offsetWidth||el.offsetHeight||el.getClientRects().length));

/** The top layer removes clipping without moving content out of its token scope. */
export function useAnchoredLayer(open,anchorRef,panelRef,placement,align,width){
  const [position,setPosition]=React.useState({left:0,top:0,maxHeight:320});
  React.useLayoutEffect(()=>{
    const panel=panelRef.current,anchor=anchorRef.current;
    if(!open||!panel||!anchor)return;
    if(panel.showPopover)panel.showPopover();
    const place=()=>{
      const r=anchor.getBoundingClientRect(),edge=8,gap=6;
      const viewW=document.documentElement.clientWidth||window.innerWidth,viewH=window.innerHeight;
      const below=Math.max(0,viewH-r.bottom-gap-edge),above=Math.max(0,r.top-gap-edge);
      const desired=panel.scrollHeight+2;
      const up=placement==='top'?(above>=desired||above>=below):(below<desired&&above>below);
      const maxHeight=Math.max(1,up?above:below),height=Math.min(desired,maxHeight);
      const panelWidth=panel.getBoundingClientRect().width;
      const left=Math.max(edge,Math.min(align==='end'?r.right-panelWidth:r.left,viewW-panelWidth-edge));
      const top=Math.max(edge,Math.min(up?r.top-gap-height:r.bottom+gap,viewH-height-edge));
      setPosition(prev=>prev.left===left&&prev.top===top&&prev.maxHeight===maxHeight?prev:{left,top,maxHeight});
    };
    place();
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(place):null;
    observer?.observe(panel);observer?.observe(anchor);
    window.addEventListener('resize',place);document.addEventListener('scroll',place,true);
    return()=>{
      observer?.disconnect();window.removeEventListener('resize',place);document.removeEventListener('scroll',place,true);
      if(panel.hidePopover&&panel.matches(':popover-open'))panel.hidePopover();
    };
  },[open,anchorRef,panelRef,placement,align,width]);
  return position;
}

export const anchoredStyle={position:'fixed',inset:'auto',margin:0,boxSizing:'border-box',zIndex:1000,maxWidth:'calc(100vw - 16px)',overflowWrap:'anywhere'};
