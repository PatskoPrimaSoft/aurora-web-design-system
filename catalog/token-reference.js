const root=document.querySelector('.token-reference');
if(root){
 const search=root.querySelector('input[type="search"]');
 const category=root.querySelector('select[aria-label="Категория"]');
 const brand=root.querySelector('select[aria-label="Бренд"]');
 const sections=[...root.querySelectorAll('.token-section')];
 const rows=[...root.querySelectorAll('[data-token-row]')];
 const count=root.querySelector('.token-count');
 const empty=root.querySelector('.token-empty');
 const status=root.querySelector('.token-copy-status');
 const params=new URLSearchParams(location.search);
 if(['DEFAULT','RED2'].includes(params.get('theme')))brand.value=params.get('theme');
 if(sections.some(section=>section.dataset.category===params.get('category')))category.value=params.get('category');
 if(params.has('q'))search.value=params.get('q');
 function update(){
  const query=search.value.trim().toLocaleLowerCase('ru');
  let visible=0;
  for(const section of sections){
   let sectionVisible=0;
   const selected=category.value==='all'||category.value===section.dataset.category;
   for(const row of section.querySelectorAll('[data-token-row]')){
    row.hidden=!selected||!row.dataset.search.includes(query);
    if(!row.hidden){visible++;sectionVisible++;}
   }
   section.hidden=!sectionVisible;
   const link=root.querySelector(`[data-category-link="${section.dataset.category}"]`);
   if(link)link.hidden=section.hidden;
  }
  root.dataset.brand=brand.value;
  count.textContent=`${visible} из ${rows.length} токенов`;
  empty.hidden=visible!==0;
  const url=new URL(location.href);
  for(const key of ['theme','appearance','density','category','q'])url.searchParams.delete(key);
  if(brand.value!=='DEFAULT')url.searchParams.set('theme',brand.value);
  if(category.value!=='all')url.searchParams.set('category',category.value);
  if(search.value)url.searchParams.set('q',search.value);
  history.replaceState(null,'',url);
 }
 search.addEventListener('input',update);
 category.addEventListener('change',update);
 brand.addEventListener('change',update);
 root.addEventListener('click',async event=>{
  const copy=event.target.closest('[data-copy]');
  if(copy){
   const value=`var(${copy.dataset.copy})`;
   try{await navigator.clipboard.writeText(value);status.textContent=`Скопировано: ${value}`;}
   catch{status.textContent=`Для копирования: ${value}`;}
  }
  const motion=event.target.closest('.token-motion');
  if(motion){
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){status.textContent='Движение отключено в настройках системы.';return;}
   const duration=parseFloat(motion.dataset.duration);
   if(Number.isFinite(duration))motion.nextElementSibling.animate([{transform:'translateX(0)'},{transform:'translateX(24px)'}],{duration,iterations:2,direction:'alternate'});
  }
 });
 update();
}
