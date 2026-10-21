import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {serveRoot} from '../../tools/baseline/render.mjs';
const scopes=[['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']];
test('status guide supports semantic tones, surfaces and navigation in every scope',async({page},testInfo)=>{
  const served=await serveRoot(siteRoot());
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try{
    for(const [theme,appearance,density] of scopes) for(const width of [1440,390]){
      await page.setViewportSize({width,height:900});
      await page.goto(`${served.url}/index.html?card=DsStatus&theme=${theme}&appearance=${appearance}&density=${density}`);
      const frame=page.frameLocator('#preview'),contents=page.locator('.page-contents');
      await expect(contents.locator('a')).toHaveCount(7);
      await expect(frame.locator('main > section > h2')).toHaveText(['Статусы в интерфейсе','Краткая памятка','Статус в разных компонентах','Правила применения','Справочник токенов']);
      const selector=frame.getByLabel('Пример статуса');
      await selector.focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');
      await expect(selector).toHaveValue('info');
      for(const [tone,label] of [['neutral','В очереди'],['info','Маршрут обновлён'],['success','Отчёт готов'],['warning','Топливо заканчивается'],['danger','Не удалось сохранить']]){
        await selector.selectOption(tone);
        await expect(frame.locator('#surface-demo [data-example-lozenge]')).toHaveText(label);
        await expect(frame.locator('#surface-demo [data-ds-banner] h3')).toHaveText(label);
        await expect(frame.locator('#surface-demo [data-ds-toast-body]')).toHaveText(label);
        expect(await frame.locator('#surface-demo').evaluate((node,tone)=>{
          const badge=node.querySelector('[data-example-lozenge] > span'),toast=node.querySelector('[data-ds-toast]');
          const probe=document.createElement('span');node.append(probe);
          const resolve=token=>{probe.style.color=`var(--ds-${token})`;return getComputedStyle(probe).color;};
          const correct=getComputedStyle(badge).color===resolve(tone+'-fg')&&getComputedStyle(toast).color===resolve('fg-on-inverse');
          probe.remove();return correct;
        },tone)).toBe(true);
      }
      await expect(frame.locator('#surface-demo [role="status"], #surface-demo [role="alert"]')).toHaveCount(0);
      for(const id of ['status-roles','status-palette','status-custom']){
        await expect(frame.locator('#'+id)).not.toHaveAttribute('open','');
        await frame.locator('#'+id+' summary').focus();await page.keyboard.press('Enter');
        await expect(frame.locator('#'+id)).toHaveAttribute('open','');
      }
      await expect(frame.locator('#status-palette [data-status-tone]')).toHaveCount(5);
      await expect.poll(()=>page.locator('#preview').evaluate(iframe=>iframe.contentDocument.documentElement.scrollWidth<=iframe.clientWidth&&iframe.clientHeight>=iframe.contentDocument.body.scrollHeight)).toBe(true);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await frame.locator('html').evaluate(()=>document.fonts.ready);
      expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
      if(theme==='DEFAULT'&&appearance==='light'){
        await page.goto(`${served.url}/index.html?card=DsStatus&theme=${theme}&appearance=${appearance}&density=${density}`);
        await expect(frame.locator('#ready-interface')).toContainText('Отчёт сформирован');
        await expect.poll(()=>page.locator('#preview').evaluate(iframe=>iframe.clientHeight>=iframe.contentDocument.body.scrollHeight)).toBe(true);
        await page.screenshot({path:testInfo.outputPath(`status-${width}.png`),fullPage:true});
      }
      if(width===390)await contents.locator('summary').click();
      else await expect(contents).toHaveCSS('position','sticky');
      await contents.getByRole('link',{name:'Статус в разных компонентах',exact:true}).click();
      await expect(frame.locator('#surfaces')).toBeFocused();await expect(page).toHaveURL(/#surfaces$/);
      await page.reload();await expect(frame.locator('#surfaces')).toBeInViewport();
    }
    await expect(page.locator('#compare')).toHaveCount(0);await expect(page.locator('#viewports iframe')).toHaveCount(1);
    await expect(page.locator('.page-contents a')).toHaveCount(7);
    await page.locator('.page-contents summary').click();
    await page.locator('.page-contents').getByRole('link',{name:'Справочник токенов',exact:true}).click();
    await expect(page.frameLocator('#preview').locator('#reference')).toBeFocused();
    expect(errors).toEqual([]);
  }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
