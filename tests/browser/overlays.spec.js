import {test,expect} from '@playwright/test';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
let served;
test.beforeAll(async()=>{await buildCatalogue({root,outDir:root+'/site'});served=await serveRoot(root+'/site')});
test.afterAll(async()=>{served?.server.closeAllConnections();if(served)await new Promise(resolve=>served.server.close(resolve))});

async function mount(page,theme='DEFAULT',appearance='light',density='cozy',initialDialog=false,firstHint=''){
  await page.goto(served.url+`/design-system/components/DsPopover/preview.html`);
  // The catalogue preview is the actual shipped runtime, with a deterministic fixture.
  await page.waitForFunction(()=>window.AuroraWebDesignSystem_96e210?.DsPopover);
  await page.evaluate(({theme,appearance,density,initialDialog,firstHint})=>{
    const {React:R,ReactDOM:D}=window,h=R.createElement,S=window.AuroraWebDesignSystem_96e210;
    document.body.innerHTML='<div id="fixture"></div>';
    document.body.dataset.dsTheme=theme;document.body.dataset.dsAppearance=appearance;document.body.dataset.dsDensity=density;
    function Fixture(){
      const [dialog,setDialog]=R.useState(initialDialog),[shown,setShown]=R.useState(true),[value,setValue]=R.useState('');
      return h('div',{'data-overlay-fixture':'',onKeyDown:event=>{if(event.key==='Escape')event.currentTarget.dataset.escapes=String(Number(event.currentTarget.dataset.escapes||0)+1)}},
        h(S.DsTooltip,{content:'Дополнительная информация'},h(S.DsButton,{'aria-describedby':'existing',onKeyDown:event=>{if(event.key==='Escape'){event.currentTarget.dataset.escapes=String(Number(event.currentTarget.dataset.escapes||0)+1);event.currentTarget.dataset.escapePrevented=String(event.defaultPrevented)}}},'Справка')),
        h('span',{id:'existing'},'Постоянное описание'),
        h('div',{style:{overflow:'hidden',transform:'translateX(0)',height:50,marginBottom:240}},
          shown&&h(S.DsPopover,{label:'Настройки',trigger:h(S.DsButton,null,'Открыть настройки')},({close})=>h('div',null,
            h('label',null,'Название',h('input',{'aria-label':'Название',value,onChange:e=>setValue(e.target.value)})),
            h(S.DsTooltip,{content:'Подсказка в панели'},h(S.DsButton,null,'Справка в панели')),
            h(S.DsButton,{onClick:close},'Готово')))),
        h(S.DsButton,null,'Следующее действие'),
        h(S.DsButton,{onClick:()=>setDialog(true)},'Открыть диалог'),
        h(S.DsButton,{onClick:()=>setShown(false)},'Удалить панель'),
        h(S.DsDialog,{open:dialog,title:'Внешний диалог',onClose:()=>setDialog(false)},
          h(S.DsPopover,{label:'Вложенная панель',defaultOpen:initialDialog,trigger:h(S.DsButton,null,'Вложенные настройки')},({close})=>firstHint==='icon'
            ?h(S.DsIconButton,{icon:'check',label:'Закрыть панель',onClick:close})
            :firstHint==='tooltip'?h(S.DsTooltip,{content:'Завершить настройку панели'},h(S.DsButton,{onClick:close},'Закрыть панель'))
            :h(S.DsButton,{onClick:close},'Закрыть панель'))));
    }
    D.createRoot(document.getElementById('fixture')).render(h(Fixture));
  },{theme,appearance,density,initialDialog,firstHint});
}

test('tooltip preserves description, hover transit, Escape and scoped colors',async({page})=>{
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
    await page.setViewportSize({width:390,height:800});await mount(page,theme,appearance,density);
    const trigger=page.getByRole('button',{name:'Справка',exact:true});
    await trigger.focus();await expect(page.getByRole('tooltip')).toHaveText('Дополнительная информация');
    await expect(trigger).toHaveAccessibleDescription('Постоянное описание Дополнительная информация');
    await page.keyboard.press('Escape');await expect(page.getByRole('tooltip')).toHaveCount(0);
    await expect(trigger).toHaveAccessibleDescription('Постоянное описание');
    await page.getByRole('button',{name:'Следующее действие'}).focus();
    await trigger.hover();await page.getByRole('tooltip').hover();await expect(page.getByRole('tooltip')).toBeVisible();
    const tip=page.getByRole('tooltip');
    expect(await tip.evaluate(el=>el.matches(':popover-open'))).toBe(true);
    expect(await tip.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(await trigger.evaluate(el=>{const s=document.createElement('span');s.style.background='var(--ds-surface-inverse)';el.after(s);const color=getComputedStyle(s).backgroundColor;s.remove();return color}));
    await page.getByRole('button',{name:'Следующее действие'}).hover();await expect(tip).toHaveCount(0);
  }
});

test('focused tooltip consumes Escape before trigger and ancestor handlers',async({page})=>{
  await mount(page);
  const trigger=page.getByRole('button',{name:'Справка',exact:true}),ancestor=page.locator('[data-overlay-fixture]');
  await trigger.focus();await expect(page.getByRole('tooltip')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('tooltip')).toHaveCount(0);
  await expect(trigger).toHaveAttribute('data-escapes','1');await expect(trigger).toHaveAttribute('data-escape-prevented','true');await expect(ancestor).not.toHaveAttribute('data-escapes');
  await page.keyboard.press('Escape');await expect(trigger).toHaveAttribute('data-escapes','2');await expect(trigger).toHaveAttribute('data-escape-prevented','false');await expect(ancestor).toHaveAttribute('data-escapes','1');
});

test('popover focuses content, exits with Tab, closes outside and restores only on explicit close',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [390,1280])for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
    await page.setViewportSize({width,height:800});await mount(page,theme,appearance,density);
    const trigger=page.getByRole('button',{name:'Открыть настройки'}),panel=page.getByRole('dialog',{name:'Настройки',exact:true});
    await trigger.click();await expect(page.getByRole('textbox',{name:'Название'})).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded','true');await expect(panel).not.toHaveAttribute('aria-modal','true');
    expect(await panel.evaluate(el=>el.matches(':popover-open'))).toBe(true);
    const rect=await panel.boundingBox();expect(rect.x).toBeGreaterThanOrEqual(0);expect(rect.x+rect.width).toBeLessThanOrEqual(width);
    await page.getByRole('textbox',{name:'Название'}).fill('Volvo');
    await page.getByRole('button',{name:'Готово'}).click();await expect(panel).toHaveCount(0);await expect(trigger).toBeFocused();
    await trigger.click();await page.keyboard.press('Shift+Tab');await expect(trigger).toBeFocused();await expect(panel).toHaveCount(0);
    await trigger.click();await page.getByRole('button',{name:'Готово'}).focus();await page.keyboard.press('Tab');
    await expect(page.getByRole('button',{name:'Следующее действие'})).toBeFocused();await expect(panel).toHaveCount(0);
    await trigger.click();await page.getByRole('button',{name:'Следующее действие'}).click();await expect(panel).toHaveCount(0);await expect(page.getByRole('button',{name:'Следующее действие'})).toBeFocused();
    await trigger.click();await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);await expect(trigger).toBeFocused();
    await trigger.click();await page.getByRole('button',{name:'Удалить панель'}).click();await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('Escape closes tooltip, popover and parent dialog one layer at a time',async({page})=>{
  await mount(page);await page.getByRole('button',{name:'Открыть диалог'}).click();
  await page.getByRole('button',{name:'Вложенные настройки'}).click();
  await expect(page.getByRole('button',{name:'Закрыть панель'})).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Вложенная панель',exact:true})).toHaveCount(0);
  await expect(page.getByRole('dialog',{name:'Внешний диалог',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Вложенные настройки'})).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button',{name:'Открыть настройки'}).click();await page.getByRole('button',{name:'Справка в панели'}).focus();
  await expect(page.getByRole('tooltip')).toBeVisible();await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);await expect(page.getByRole('dialog',{name:'Настройки',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('initially open popover survives parent autofocus and closes before its dialog',async({page})=>{
  await mount(page,'DEFAULT','light','cozy',true);
  await expect(page.getByRole('button',{name:'Закрыть панель'})).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Вложенная панель',exact:true})).toHaveCount(0);
  await expect(page.getByRole('dialog',{name:'Внешний диалог',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('initial focus tooltip closes before its popover, including defaultOpen inside a dialog',async({page})=>{
  for(const firstHint of ['tooltip','icon'])for(const initialDialog of [false,true]){
    await mount(page,'DEFAULT','light','cozy',initialDialog,firstHint);
    if(!initialDialog){await page.getByRole('button',{name:'Открыть диалог'}).click();await page.getByRole('button',{name:'Вложенные настройки'}).click()}
    const panel=page.getByRole('dialog',{name:'Вложенная панель',exact:true});
    const parent=page.getByRole('dialog',{name:'Внешний диалог',exact:true});
    for(let attempt=0;attempt<2;attempt++){
      if(attempt)await page.getByRole('button',{name:'Вложенные настройки'}).click();
      await expect(page.getByRole('button',{name:'Закрыть панель'})).toBeFocused();
      await expect(page.getByRole('tooltip')).toBeVisible();
      await page.keyboard.press('Escape');await expect(page.getByRole('tooltip')).toHaveCount(0);
      await expect(panel).toBeVisible();await expect(parent).toBeVisible();
      await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);await expect(parent).toBeVisible();
    }
    await page.keyboard.press('Escape');await expect(parent).toHaveCount(0);
  }
});

test('catalog iframe keeps filter popover open and usable at 390px in every mode',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
    await page.goto(served.url+`/index.html?card=DsPopover&theme=${theme}&appearance=${appearance}&density=${density}`);
    const frame=page.frameLocator('#preview'),trigger=frame.getByRole('button',{name:'Фильтр',exact:true});
    await trigger.click();
    const panel=frame.getByRole('dialog',{name:'Фильтр объектов'}),checkbox=panel.getByRole('checkbox',{name:'Только активные'});
    await expect(panel).toBeVisible();await expect(checkbox).toBeFocused();
    await page.keyboard.press('Space');await expect(checkbox).toBeChecked();
    await panel.getByRole('button',{name:'Готово'}).click();await expect(panel).toHaveCount(0);await expect(trigger).toBeFocused();
    await expect(frame.getByText('Показаны только активные объекты.',{exact:true})).toBeVisible();
    await trigger.click();await expect(checkbox).toBeChecked();await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);
  }
});
