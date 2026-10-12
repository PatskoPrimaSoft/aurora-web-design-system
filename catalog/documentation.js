export const languageNames={jsx:'JSX',tsx:'TSX',js:'JavaScript',javascript:'JavaScript',ts:'TypeScript',typescript:'TypeScript',html:'HTML',xml:'HTML / XML',css:'CSS',json:'JSON',bash:'Shell',sh:'Shell',shell:'Shell',yaml:'YAML',yml:'YAML'};

export function exampleLink(id){
  const root=document.documentElement;
  const url=new URL(root.dataset.dsExampleCardUrl,location.href);
  for(const [name,fallback]of Object.entries({theme:'DEFAULT',appearance:'light',density:'cozy'}))url.searchParams.set(name,root.getAttribute('data-ds-'+name)||fallback);
  url.searchParams.delete('compare');url.searchParams.delete('q');url.hash='example-'+id;
  return url.href;
}

export function enhanceCodeBlocks(container){
  for(const pre of container.querySelectorAll('pre')){
    const code=pre.querySelector('code');
    if(!code||pre.closest('.code-block'))continue;
    const source=code.textContent;
    const language=[...code.classList].find(name=>name.startsWith('language-'))?.slice(9)??'';
    const block=document.createElement('div'),bar=document.createElement('div'),label=document.createElement('span');
    const button=document.createElement('button'),status=document.createElement('span');
    block.className='code-block';bar.className='code-toolbar';label.className='code-language';
    label.textContent=languageNames[language]??(language||'Код');
    button.type='button';button.className='code-copy';button.textContent='Копировать';button.setAttribute('aria-label','Копировать код');
    status.className='code-copy-status';status.setAttribute('role','status');status.setAttribute('aria-atomic','true');
    pre.tabIndex=0;pre.setAttribute('role','region');pre.setAttribute('aria-label','Код: '+label.textContent);
    pre.before(block);block.append(bar,pre,status);bar.append(label,button);
    button.addEventListener('click',async()=>{
      status.textContent='';button.disabled=true;
      try{
        await navigator.clipboard.writeText(source);
        if(block.isConnected)status.textContent='Скопировано';
      }catch{
        if(!block.isConnected)return;
        pre.focus({preventScroll:true});
        const range=document.createRange();range.selectNodeContents(code);
        const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
        status.textContent='Не удалось скопировать. Скопируйте выделенный код вручную.';
      }finally{button.disabled=false;}
    });
  }
}

export function createPageContents({container,headings,scrollRoot,cardUrl,previewFrame,restoreSection=false}){
  if(!headings.length)return ()=>{};
  const aside=document.createElement('aside'),details=document.createElement('details'),summary=document.createElement('summary'),nav=document.createElement('nav');
  aside.className='page-contents';summary.textContent='На этой странице';nav.setAttribute('aria-label','На этой странице');
  details.append(summary,nav);aside.append(details);container.querySelector('#subtitle').after(aside);
  const used=new Set();
  for(const [index,heading]of headings.entries()){
    const base=heading.id||'section-'+index;let id=base,suffix=1;
    while(used.has(id))id=base+'-'+suffix++;
    used.add(id);heading.id=id;heading.tabIndex=-1;
  }
  const wide=matchMedia('(min-width:1400px)');
  const resizeDisclosure=()=>{details.open=wide.matches;};resizeDisclosure();wide.addEventListener('change',resizeDisclosure);
  let hash='';try{hash=decodeURIComponent(location.hash.slice(1));}catch{}
  let entries=[],links=[],exampleHeadings=[],previewDocument,previewObserver;
  let anchor=null,following=restoreSection&&!!hash,frame=0;
  const topOf=entry=>entry.heading.getBoundingClientRect().top+(entry.preview?previewFrame.getBoundingClientRect().top+previewFrame.clientTop:0);
  function rebuild(){
    const list=document.createElement('ul');entries=[];links=[];
    function append(heading,parent,preview=false){
      const id=preview?'example-'+heading.id:heading.id;
      const entry={heading,id,preview},item=document.createElement('li'),link=document.createElement('a'),url=new URL(cardUrl);url.hash=id;
      heading.tabIndex=-1;link.href=url;link.textContent=heading.textContent;
      item.append(link);parent.append(item);entries.push(entry);links.push(link);
      link.addEventListener('click',event=>{
        if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
        event.preventDefault();
        const next=new URL(location.href);next.searchParams.set('card',new URL(cardUrl).searchParams.get('card'));next.hash=id;
        history.pushState(null,'',next);hash=id;anchor=entry;following=true;
        if(!wide.matches)details.open=false;
        jump(entry,true);
      });
      return item;
    }
    for(const [index,heading]of headings.entries()){
      const item=append(heading,list);
      if(index===0&&exampleHeadings.length){
        const nested=document.createElement('ul');item.append(nested);
        for(const heading of exampleHeadings)append(heading,nested,true);
      }
    }
    nav.replaceChildren(list);
    anchor=following?entries.find(entry=>entry.id===hash):null;
    if(anchor)jump(anchor);else schedule();
  }
  function readExamples(){
    const next=[...previewDocument.querySelectorAll('body[data-ds-examples] h3[id]')];
    if(next.length===exampleHeadings.length&&next.every((heading,index)=>heading===exampleHeadings[index]))return;
    exampleHeadings=next;rebuild();
  }
  const interactionEvents=['wheel','touchstart','pointerdown','keydown'];
  function disconnectPreview(){
    previewObserver?.disconnect();
    for(const event of interactionEvents)previewDocument?.removeEventListener(event,stopFollowing);
  }
  function watchPreview(){
    disconnectPreview();previewDocument=previewFrame?.contentDocument;
    if(!previewDocument)return;
    previewObserver=new MutationObserver(readExamples);
    previewObserver.observe(previewDocument,{childList:true,subtree:true});
    for(const event of interactionEvents)previewDocument.addEventListener(event,stopFollowing,{passive:true});
    readExamples();
  }
  function update(){
    frame=0;const top=scrollRoot.getBoundingClientRect().top+32;
    let current=0;
    for(let index=0;index<entries.length;index++)if(topOf(entries[index])<=top)current=index;
    if(scrollRoot.scrollTop>0&&scrollRoot.scrollTop+scrollRoot.clientHeight>=scrollRoot.scrollHeight-2)current=entries.length-1;
    links.forEach((link,index)=>{if(index===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  function jump(entry,focus=false){
    scrollRoot.scrollTo({top:scrollRoot.scrollTop+topOf(entry)-scrollRoot.getBoundingClientRect().top-24});
    if(focus)entry.heading.focus({preventScroll:true});
    schedule();
  }
  function stopFollowing(){following=false;}
  // Preview frames and local fonts can change the height above a deep link after initial render.
  const sizeContents=()=>container.style.setProperty('--contents-available-height',Math.max(0,scrollRoot.clientHeight-48)+'px');
  sizeContents();
  const observer=new ResizeObserver(()=>{sizeContents();if(following&&anchor)jump(anchor);else schedule();});
  observer.observe(container);observer.observe(scrollRoot);
  scrollRoot.addEventListener('scroll',schedule,{passive:true});
  for(const event of interactionEvents)scrollRoot.addEventListener(event,stopFollowing,{passive:true});
  rebuild();watchPreview();previewFrame?.addEventListener('load',watchPreview);
  return ()=>{
    observer.disconnect();cancelAnimationFrame(frame);wide.removeEventListener('change',resizeDisclosure);
    scrollRoot.removeEventListener('scroll',schedule);
    for(const event of interactionEvents)scrollRoot.removeEventListener(event,stopFollowing);
    disconnectPreview();previewFrame?.removeEventListener('load',watchPreview);
    aside.remove();
  };
}
