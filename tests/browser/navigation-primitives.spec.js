import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {exampleDemo} from './helpers/live-example.js';

const modes=[['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']];
let served;
test.beforeAll(async()=>{served=await serveRoot(siteRoot());});
test.afterAll(async()=>{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));});

test('navigation exports exist before the catalogue examples mount',async({page})=>{
  await page.goto(served.url+'/design-system/components/DsCheckbox/preview.html');
  await expect.poll(()=>page.evaluate(()=>{
    const S=window.AuroraWebDesignSystem_96e210;
    return ['DsLink','DsBreadcrumbs'].filter(name=>!!S?.[name]);
  })).toEqual(['DsLink','DsBreadcrumbs']);
});

test('links preserve native navigation, download, modified clicks and external safety',async({page})=>{
  await page.goto(served.url+'/design-system/components/DsLink/preview.html');
  const link=exampleDemo(page,'Переход внутри страницы').getByRole('link',{name:'К настройкам уведомлений'});
  await expect(link).toHaveAttribute('href',/\/components\/DsLink\/preview\.html#notification-settings$/);
  expect(await link.evaluate(element=>new URL(element.href).pathname)).toBe('/design-system/components/DsLink/preview.html');
  await link.focus();await expect(link).toHaveCSS('outline-style','solid');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#notification-settings$/);
  const download=exampleDemo(page,'Скачивание файла').getByRole('link');
  await expect(download).toHaveAttribute('download','objects.csv');
  const downloadEvent=page.waitForEvent('download');await download.click();
  expect((await downloadEvent).suggestedFilename()).toBe('objects.csv');
  await page.evaluate(()=>{
    const S=window.AuroraWebDesignSystem_96e210,h=React.createElement;
    const host=document.createElement('div');host.id='native-links';document.body.append(host);
    ReactDOM.createRoot(host).render(h('div',null,
      h(S.DsLink,{href:location.href,target:'_blank',rel:'opener author'},'Безопасная ссылка'),
      h(S.DsLink,{href:location.href,onClick:event=>{window.modifiedClick={ctrl:event.ctrlKey,prevented:event.defaultPrevented};}},'Модификатор')));
  });
  await expect(page.getByRole('link',{name:'Безопасная ссылка'})).toHaveAttribute('rel','author noopener noreferrer');
  await page.getByRole('link',{name:'Модификатор'}).dispatchEvent('click',{ctrlKey:true});
  expect(await page.evaluate(()=>window.modifiedClick)).toEqual({ctrl:true,prevented:false});
});

test('links and breadcrumbs wrap, retain semantics and work in four modes',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const [theme,appearance,density] of modes)for(const width of [390,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto(served.url+`/index.html?card=DsLink&theme=${theme}&appearance=${appearance}&density=${density}`);
    const links=page.frameLocator('#preview');
    await expect(exampleDemo(links,'Длинное название назначения').getByRole('link')).toHaveCSS('overflow-wrap','anywhere');
    await expect(exampleDemo(links,'Переход внутри страницы').getByRole('link')).toHaveCSS('text-decoration-line','underline');
    expect(await links.locator('body').evaluate(el=>el.scrollWidth<=innerWidth)).toBe(true);
    await page.goto(served.url+`/index.html?card=DsBreadcrumbs&theme=${theme}&appearance=${appearance}&density=${density}`);
    const frame=page.frameLocator('#preview');
    const basic=exampleDemo(frame,'Путь к объекту');
    const nav=basic.getByRole('navigation',{name:'Положение в каталоге'});
    await expect(nav.locator('ol > li')).toHaveCount(3);
    await expect(nav.getByRole('link')).toHaveCount(2);
    await expect(nav.locator('[aria-current="page"]')).toHaveText('МАЗ 5440');
    await expect(nav.locator('a[aria-current]')).toHaveCount(0);
    await expect(nav.locator('[data-ds-breadcrumb-separator][aria-hidden="true"]')).toHaveCount(2);
    const parent=nav.getByRole('link',{name:'Автопарк',exact:true});
    expect(await parent.evaluate(element=>new URL(element.href).pathname)).toBe('/design-system/components/DsBreadcrumbs/preview.html');
    await parent.focus();
    await page.keyboard.press('Enter');
    await expect.poll(()=>frame.locator('body').evaluate(()=>location.hash)).toBe('#fleet-destination');
    expect(await frame.locator('body').evaluate(el=>el.scrollWidth<=innerWidth)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('breadcrumbs use the translated accessible name',async({page})=>{
  await page.goto(served.url+'/design-system/components/DsBreadcrumbs/preview.html');
  await page.evaluate(()=>{
    const S=window.AuroraWebDesignSystem_96e210,h=React.createElement;
    document.body.innerHTML='<main id="fixture"></main>';
    ReactDOM.createRoot(document.getElementById('fixture')).render(h(S.DsStringsProvider,{strings:S.dsStringsEn},
      h(S.DsBreadcrumbs,{items:[{label:'Fleet',href:'#fleet'},{label:'Overview'}]})));
  });
  await expect(page.getByRole('navigation',{name:'Breadcrumbs'})).toBeVisible();
});
