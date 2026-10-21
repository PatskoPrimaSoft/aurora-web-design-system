import {catalogueCards, siteRoot} from '../helpers/browser-snapshot.mjs';
import {chooseCatalogueScope} from './helpers/catalogue-scope.js';
import{test,expect}from'@playwright/test';import{serveRoot}from'../../tools/baseline/render.mjs';import{fileURLToPath}from'node:url';
import{startDev}from'../../tools/dev.mjs';import{fixtureRoot}from'../helpers/build-root.js';import{readFileSync,writeFileSync,rmSync}from'node:fs';import{join}from'node:path';
import{readTokenModel}from'../../tools/tokens/model.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
test('all catalogue pages render from local files without runtime errors',async({page})=>{
 const cards=catalogueCards();const served=await serveRoot(siteRoot());
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.route('**/*',r=>r.request().url().startsWith(served.url+'/')?r.continue():r.abort('blockedbyclient'));
 try{
  await page.goto(served.url+'/index.html');await expect(page.locator('nav a[data-id]')).toHaveCount(cards.length);
  await expect(page.locator('nav h2')).toHaveText(['Начало','Основы','Компоненты','Карта','Примеры экранов','Миграция','UI-kit']);
  await expect(page.locator('[data-navigation-group=components] h3')).toHaveText(['Кнопки и иконки','Поля и выбор','Навигация','Данные и фильтры','Контейнеры и окна','Обратная связь','Графики']);
  expect(await page.locator('nav a[data-id]').evaluateAll(links=>new Set(links.map(link=>link.dataset.id)).size)).toBe(cards.length);
  await expect(page.locator('[data-navigation-group=components] a[data-id]').first()).toHaveText('Button');
  await expect(page.locator('#subtitle')).toHaveText(cards.find(card=>card.id==='overview').subtitle);
  await expect(page.frameLocator('#preview').getByRole('heading',{name:'Собирайте интерфейс из готовых компонентов',exact:true})).toBeVisible();
  await expect(page.frameLocator('#preview').getByRole('searchbox',{name:'Поиск объекта'})).toBeVisible();
  await page.locator('nav a[data-id="DsButton"]').click();await expect(page.locator('h1')).toHaveText('Button');
  await chooseCatalogueScope(page,'theme','RED2');await expect(page.frameLocator('#preview').locator('html')).toHaveAttribute('data-ds-theme','RED2');
  for(const card of cards){await page.setViewportSize(card.viewport);await page.goto(served.url+'/'+card.previewPath);await page.evaluate(()=>document.fonts.ready);
   if(await page.locator('#root').count())await expect.poll(async()=>page.evaluate(()=>document.getElementById('root').childNodes.length>0||document.querySelector('[role="dialog"]')!==null),{message:`${card.id}: React root or visible portal must render`}).toBe(true);
   expect(errors,card.id).toEqual([]);
  }
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
test('merged header keeps legacy links and both navigation examples in four scopes',async({page})=>{
 const served=await serveRoot(siteRoot()),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('response',response=>{if(response.status()>=400)errors.push(response.url());});
 try{
  for(const suffix of ['?card=DsHeader&theme=RED2&appearance=dark&density=compact&compare=1','#DsHeader']){
   await page.goto(served.url+'/index.html'+suffix);
   await expect(page.locator('#title')).toHaveText('AppHeader · Шапка приложения');
   await expect(page.locator('nav a[data-id="DsHeader"]')).toHaveCount(0);
   if(suffix.startsWith('?')){await expect(page.locator('#theme')).toContainText('RED2');await expect(page.locator('#viewports iframe')).toHaveCount(1);}
  }
  for(const[path,destination]of [
   ['design-system/components/DsHeader/preview.html','/index.html'],
   ['docs/cards/DsHeader.html','/docs/cards/DsAppHeader.html'],
   ['api/components/DsHeader.html','/api/components/DsAppHeader.html'],
  ]){
   await page.goto(served.url+'/'+path+'?theme=RED2&appearance=dark&density=compact');
   await page.waitForURL(url=>url.pathname===destination);
   const url=new URL(page.url());expect(url.searchParams.get('card')).toBe('DsAppHeader');
   for(const[key,value]of Object.entries({theme:'RED2',appearance:'dark',density:'compact'}))expect(url.searchParams.get(key)).toBe(value);
  }
  await page.goto(served.url+'/index.html?card=DsAppHeader&compare=1');
  await expect(page.locator('nav a[data-id="DsHeaderChip"]')).toHaveCount(0);
  for(const path of ['design-system/components/DsHeaderChip/preview.html','docs/cards/DsHeaderChip.html','api/components/DsHeaderChip.html'])
   expect((await page.request.get(served.url+'/'+path)).status()).toBe(404);
  const scopes=[['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']];
  for(const scope of scopes){
   await page.goto(served.url+'/index.html?card=DsAppHeader&'+new URLSearchParams({theme:scope[0],appearance:scope[1],density:scope[2]}));
   const frame=page.frameLocator('#preview');
   for(const[axis,value]of ['theme','appearance','density'].map((axis,i)=>[axis,scope[i]]))await expect(frame.locator('html')).toHaveAttribute('data-ds-'+axis,value);
   await expect(frame.locator('header')).toHaveCount(2);
   expect(await frame.locator('html').evaluate(()=>Object.hasOwn(window.AuroraWebDesignSystem_96e210,'DsHeaderChip'))).toBe(false);
   expect(await frame.locator('header img').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
   await frame.getByRole('button',{name:'Отчёты',exact:true}).first().focus();await page.keyboard.press('Enter');
   await expect(frame.getByRole('button',{name:'Отчёты',exact:true}).first()).toHaveAttribute('aria-current','page');
   await frame.getByRole('button',{name:/a\.ivanov/}).first().focus();await page.keyboard.press('Enter');
   await expect(frame.getByRole('menu')).toBeVisible();await page.keyboard.press('Escape');
   await expect(frame.getByRole('menu')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});

test('direct dev preview displays failed builds and reloads after recovery',async({page})=>{
 const fixture=fixtureRoot();let dev;
 try{
  dev=await startDev({root:fixture,port:0});await page.goto(dev.url+'/design-system/components/Example/preview.html');await expect(page.locator('#root')).toHaveText('hello');
  const path=join(fixture,'design-system/tokens/source.json'),original=readFileSync(path,'utf8');writeFileSync(path,'invalid JSON');
  await expect(page.locator('[role="alert"]')).toBeVisible();await expect(page.locator('#root')).toHaveText('hello');
  const example=join(fixture,'design-system/components/Example/preview.html');writeFileSync(example,readFileSync(example,'utf8').replace('hello','recovered'));writeFileSync(path,original);
  // Восстановление включает полную сборку каталога; на CI она может занять больше 5 секунд.
  await expect(page.locator('#root')).toHaveText('recovered',{timeout:15000});await expect(page.locator('[role="alert"]')).toHaveCount(0);
 }finally{await test.step('leave preview',()=>page.goto('about:blank'));if(dev)await test.step('close dev server',()=>dev.close());rmSync(fixture,{recursive:true,force:true});}
});

test('multiple dev catalogue tabs can finish loading and refresh without exhausting connections',async({context})=>{
 const fixture=fixtureRoot(),pages=[];let dev;
 try{
  dev=await startDev({root:fixture,port:0});
  for(let index=0;index<4;index++){
   const page=await context.newPage();pages.push(page);
   await page.goto(dev.url+'/?card=Example',{timeout:5000});
   await expect(page.frameLocator('#preview').locator('#root')).toHaveText('hello');
  }
  for(const page of pages){
   const response=await page.reload({timeout:5000});
   expect(response.headers()['cache-control']).toBe('no-store');
   await expect(page.frameLocator('#preview').locator('#root')).toHaveText('hello');
   expect(await page.evaluate(()=>document.readyState)).toBe('complete');
  }
 }finally{for(const page of pages)await page.close();if(dev)await dev.close();rmSync(fixture,{recursive:true,force:true});}
});
test('API references use real declarations, defaults and token source',async({page})=>{
 const served=await serveRoot(siteRoot()),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
 await page.route('**/*',r=>r.request().url().startsWith(served.url+'/')?r.continue():r.abort());
 try{
  for(const name of ['DsButton','DsCheckbox','DsChartLegend','DsChartTooltip','DsTabPanel']){
   await page.goto(`${served.url}/api/components/${name}.html`);
   await expect(page.getByRole('heading',{level:1}).first()).toHaveText(name);
   await expect(page.getByRole('table',{name:new RegExp('^(?:Параметры|Props) '+name+'$')})).toBeVisible();
  }
  await page.goto(served.url+'/api/components/DsCheckbox.html');await expect(page.getByRole('heading',{name:'Параметры',exact:true})).toBeVisible();
  await page.goto(served.url+'/api/components/DsButton.html');await expect(page.getByRole('row').filter({has:page.getByRole('rowheader',{name:'tone',exact:true})})).toContainText("'primary'");
  await page.goto(served.url+'/api/tokens.html');await expect(page.locator('#ds-brand')).toBeVisible();expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});

test('token reference filters categories and switches paired theme values',async({page})=>{
 const served=await serveRoot(siteRoot());
 const tokenCount=readTokenModel(JSON.parse(readFileSync(join(root,'design-system/tokens/source.json'),'utf8'))).names.length;
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto(served.url+'/api/tokens.html?appearance=dark&density=compact');
  await expect(page.locator('html')).toHaveAttribute('data-ds-appearance','light');
  await expect(page.locator('html')).toHaveAttribute('data-ds-density','cozy');
  await expect(page.locator('.catalog-header')).toContainText('Aurora Design');
  await expect(page.locator('#cards .catalog-tokens-link')).toHaveAttribute('aria-current','page');
  await expect(page.locator('#cards a[data-id=DsButton]')).toBeVisible();
  await page.locator('#search').fill('DsButton');
  await page.locator('#cards a[data-id=DsButton]').click();
  await expect(page.locator('#title')).toHaveText('Button');
  await page.goBack();
  await expect(page.locator('#cards .catalog-tokens-link')).toHaveAttribute('aria-current','page');
  await expect(page.locator('[data-token-row]')).toHaveCount(tokenCount);
  await expect(page.locator('#ds-n-0')).toBeHidden();
  await page.getByRole('button',{name:'Графики',exact:true}).click();
  await expect(page.locator('#ds-chart-axis')).toBeVisible();
  await expect(page.locator('#ds-brand')).toBeHidden();
  await page.getByRole('button',{name:'Карта',exact:true}).click();
  await expect(page.locator('#ds-map-ground')).toBeVisible();
  await expect(page.locator('#ds-shadow-map')).toBeVisible();
  await expect(page.locator('#ds-chart-axis')).toBeHidden();
  await page.reload();
  await expect(page.getByRole('button',{name:'Карта',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('searchbox',{name:'Поиск токенов'}).fill('--ds-n-0');
  await expect(page.locator('#ds-n-0')).toBeVisible();
  await page.getByRole('button',{name:'Все токены',exact:true}).click();
  await expect(page.locator('.token-count')).toHaveText(`${tokenCount} из ${tokenCount} токенов`);
  await expect(page.locator('#ds-brand [data-theme-value="DEFAULT.light"]')).toBeVisible();
  await expect(page.locator('#ds-brand [data-theme-value="DEFAULT.dark"]')).toBeVisible();
  await page.getByRole('combobox',{name:'Бренд'}).selectOption('RED2');
  await expect(page.locator('#ds-brand [data-theme-value="RED2.light"]')).toBeVisible();
  await expect(page.locator('#ds-brand [data-theme-value="DEFAULT.light"]')).toBeHidden();
  await expect(page.locator('#ds-brand [data-theme-value="RED2.dark"] .token-value')).toHaveText('#b9b6b7');
  await page.getByRole('combobox',{name:'Категория'}).selectOption('spacing');
  await expect(page.locator('#ds-gap-md [data-density-value="cozy"]')).toBeVisible();
  await expect(page.locator('#ds-gap-md [data-density-value="compact"]')).toBeVisible();
  await page.getByRole('searchbox',{name:'Поиск токенов'}).fill('--ds-gap-md');
  await expect(page.locator('.token-count')).toHaveText(`1 из ${tokenCount} токенов`);
  await page.getByRole('searchbox',{name:'Поиск токенов'}).fill('not-a-token');
  await expect(page.locator('.token-empty')).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('searchbox',{name:'Поиск токенов'}).fill('');
  await expect(page.locator('#ds-gap-md')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('combobox',{name:'Категория'}).selectOption('layout');
  await expect(page.locator('#ds-bp-l .token-breakpoint')).toContainText('M · 959 px');
  await expect(page.locator('#ds-bp-l .is-boundary')).toHaveText('L · 960 px');
  await expect(page.locator('#ds-bp-m-max .is-boundary')).toHaveText('M · 959 px');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.setViewportSize({width:1280,height:900});
  await page.getByRole('combobox',{name:'Категория'}).selectOption('content');
  await expect(page.locator('#ds-content-max .token-content-example')).toBeVisible();
  await expect(page.locator('#token-layout')).toBeHidden();
  await page.goto(served.url+'/api/tokens.html#ds-n-0');
  await expect(page.locator('#ds-n-0')).toBeVisible();
  await expect(page.getByRole('button',{name:'Палитра и шкалы',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Основные',exact:true}).press('Enter');
  await page.reload();
  await expect(page.locator('#ds-n-0')).toBeHidden();
  await expect(page.getByRole('button',{name:'Основные',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Графики',exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});

test('search, URL history and scope selection preserve preview contracts',async({page})=>{
 const cards=catalogueCards(),served=await serveRoot(siteRoot());
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(served.url+'/index.html#DsButton');await expect(page.locator('#title')).toHaveText('Button');
  await page.locator('#search').fill('CHECKBOX');await expect(page.locator('nav a[data-id="DsCheckbox"]')).toBeVisible();
  await page.locator('#search').fill('loading');await expect(page.locator('nav a[data-id="DsButton"]')).toBeVisible();
  await page.locator('#search').fill('not-a-card-12345');await expect(page.locator('#search-empty')).toBeVisible();
  await page.locator('#search').fill('');await chooseCatalogueScope(page,'theme','RED2');await chooseCatalogueScope(page,'appearance','dark');await chooseCatalogueScope(page,'density','compact');
  await expect(page.frameLocator('#preview').locator('html')).toHaveAttribute('data-ds-theme','RED2');
  await page.reload();await expect(page.locator('#density')).toContainText('Компактная');await expect(page.frameLocator('#preview').locator('html')).toHaveAttribute('data-ds-appearance','dark');
  await expect(page.locator('#compare')).toHaveCount(0);await expect(page.locator('#viewports iframe')).toHaveCount(1);
  const expected=[['RED2','dark','compact']];
  for(const[index,scope]of expected.entries()){
   const frame=page.frameLocator('#preview');for(const[axis,value]of ['theme','appearance','density'].map((axis,i)=>[axis,scope[i]]))await expect(frame.locator('html')).toHaveAttribute('data-ds-'+axis,value);
   const card=cards.find(c=>c.id==='DsButton');
   expect(await page.locator('#preview').evaluate(frame=>frame.style.width)).toBe(card.layout==='component'?'100%':card.viewport.width+'px');
  }
  await page.reload();await expect(page.locator('#compare')).toHaveCount(0);
  await expect(page.locator('#compare')).toHaveCount(0);await page.goBack();await expect(page.locator('#viewports iframe')).toHaveCount(1);
  await page.goto(served.url+'/index.html?card=Monitoring&appearance=dark');await expect(page.frameLocator('#preview').locator('html')).toHaveAttribute('data-ds-appearance','dark');await expect(page.frameLocator('#preview').locator('#root [data-ds-appearance]').first()).toHaveAttribute('data-ds-appearance','light');
  await page.locator('#search').focus();await page.keyboard.type('DsButton');await page.keyboard.press('Tab');await expect(page.locator('nav a').first()).toBeFocused();
  await page.goto(served.url+'/index.html?card=%3Cscript%3E&theme=bad');await expect(page.locator('#card-error')).toBeVisible();await expect(page.locator('#missing-id')).toHaveText('<script>');await expect(page.locator('#viewports iframe')).toHaveCount(0);await expect(page.locator('#theme')).toContainText('DEFAULT');
  await page.locator('#return-catalogue').click();await expect(page.locator('#card-error')).toBeHidden();expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}
});
