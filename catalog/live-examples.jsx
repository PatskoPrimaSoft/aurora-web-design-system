import {enhanceCodeBlocks,exampleLink} from './documentation.js';

const React=window.React;
const ExamplesContext=React.createContext(null);
const defaults={theme:'DEFAULT',appearance:'light',density:'cozy'};
const readScope=()=>Object.fromEntries(Object.entries(defaults).map(([name,fallback])=>[name,document.documentElement.getAttribute('data-ds-'+name)||fallback]));

export function LiveExamples({children}){
  const [scope,setScope]=React.useState(readScope);
  const [sources]=React.useState(()=>JSON.parse(document.getElementById('example-code-sources')?.textContent||'{}'));
  React.useLayoutEffect(()=>{
    const observer=new MutationObserver(()=>setScope(readScope()));
    observer.observe(document.documentElement,{attributes:true,attributeFilter:Object.keys(defaults).map(name=>'data-ds-'+name)});
    return ()=>observer.disconnect();
  },[]);
  const value=React.useMemo(()=>({scope,sources}),[scope,sources]);
  return <ExamplesContext.Provider value={value}>
    <div className="live-examples" data-ds-theme="DEFAULT" data-ds-appearance="light" data-ds-density="cozy">{children}</div>
  </ExamplesContext.Provider>;
}

function ExampleCode({source}){
  const ref=React.useRef(null);
  React.useLayoutEffect(()=>{enhanceCodeBlocks(ref.current);},[source.html]);
  return <details className="example-code">
    <summary><span className="code-show">Показать код</span><span className="code-hide">Скрыть код</span></summary>
    <div ref={ref} dangerouslySetInnerHTML={{__html:'<pre><code class="language-jsx">'+source.html+'</code></pre>'}}/>
  </details>;
}

export function LiveExample({id,title,description,children}){
  const context=React.useContext(ExamplesContext);
  if(!context)throw new Error('LiveExample must be rendered inside LiveExamples');
  const {scope,sources}=context;
  const linkRef=React.useRef(null);
  const [linkStatus,setLinkStatus]=React.useState('');
  const [manualLink,setManualLink]=React.useState(null);
  const [copyingLink,setCopyingLink]=React.useState(false);
  React.useLayoutEffect(()=>{if(manualLink){linkRef.current.focus({preventScroll:true});linkRef.current.select();}},[manualLink]);
  async function copyLink(){
    const url=exampleLink(id);
    setLinkStatus('');setManualLink(null);setCopyingLink(true);
    try{await navigator.clipboard.writeText(url);setLinkStatus('Ссылка скопирована');}
    catch{setManualLink({url});setLinkStatus('Скопируйте выделенную ссылку вручную');}
    finally{setCopyingLink(false);}
  }
  return <section className="example" aria-labelledby={id}>
    <div className="example-heading">
      <h3 className="example-title" id={id}>{title}</h3>
      <button className="example-link" type="button" title="Копировать ссылку" aria-label={'Копировать ссылку на пример «'+title+'»'} disabled={copyingLink} onClick={copyLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>
        </svg>
      </button>
    </div>
    <p className="example-link-status" role="status" aria-atomic="true">{linkStatus}</p>
    {manualLink&&<input ref={linkRef} className="example-link-input" aria-label={'Ссылка на пример «'+title+'»'} value={manualLink.url} readOnly/>}
    {description&&<p className="example-description">{description}</p>}
    <div className="example-demo" data-ds-example-demo data-ds-theme={scope.theme} data-ds-appearance={scope.appearance} data-ds-density={scope.density}>
      {children}
    </div>
    {sources[id]&&<ExampleCode source={sources[id]}/>}
  </section>;
}
