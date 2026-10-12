export function mountCatalogueShell(contentClass='catalog-content'){
const {DsPageLayout}=window.AuroraWebDesignSystem_96e210;
const h=window.React.createElement;
const shell=document.getElementById('catalog-shell');
const header=shell.querySelector('header'),navigation=shell.querySelector('aside'),content=shell.querySelector('main');
// These regions retain the catalogue's DOM-managed content and event handlers.
function CatalogueRegion({source,className,as='div'}){
 const ref=window.React.useRef(null);
 window.React.useLayoutEffect(()=>{ref.current.append(...source.childNodes);},[source]);
 return h(as,{ref,className});
}
const layoutRoot=window.ReactDOM.createRoot(shell);
window.ReactDOM.flushSync(()=>layoutRoot.render(h(DsPageLayout,{
 header:h(CatalogueRegion,{source:header,className:'catalog-header',as:'header'}),
 left:h(CatalogueRegion,{source:navigation,className:'catalog-navigation'}),
 leftWidth:280,leftLabel:'Навигация',mainId:'catalog-main',skipLinkLabel:'К содержимому',
 responsive:true,scroll:'regions',gap:false,padding:false,
},h(CatalogueRegion,{source:content,className:contentClass}))));
const headerRoot=window.ReactDOM.createRoot(document.getElementById('catalog-header-content'));
window.ReactDOM.flushSync(()=>headerRoot.render(
 h('div',{className:'catalog-identity'},
  h('span',{className:'catalog-logo'},h('img',{src:new URL('components/assets/logo/AuroraWhite.png',import.meta.url).href,alt:''})),
  h('strong',{className:'catalog-product'},'Aurora Design'))
));

}
