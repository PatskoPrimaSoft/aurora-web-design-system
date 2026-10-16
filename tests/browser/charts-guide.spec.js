import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {buildCatalogue} from '../../tools/catalog/build.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
test('chart guide keeps series stable, exposes data and follows example scopes',async({page},testInfo)=>{
  await buildCatalogue({root,outDir:root+'/site'});
  const served=await serveRoot(root+'/site');
  try{
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
      for(const width of [1440,390]){
        await page.setViewportSize({width,height:1000});
        await page.goto(served.url+'/index.html?card=DsCharts&theme='+theme+'&appearance='+appearance+'&density='+density);
        const frame=page.frameLocator('#preview'),scene=frame.locator('#ready-interface');
        await expect(page.locator('.page-contents')).toHaveCount(1);
        await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
        for(const [axis,value] of Object.entries({theme,appearance,density}))await expect(scene).toHaveAttribute('data-ds-'+axis,value);
        const maz=scene.getByRole('button',{name:'МАЗ 5440 км/ч',exact:true});
        const first=scene.locator('path[stroke="var(--ds-series-1)"]'),second=scene.locator('path[stroke="var(--ds-series-2)"]');
        await expect(first).toHaveCount(2);
        await expect(second).toHaveCount(1);
        await expect(second).toHaveCSS('stroke-dasharray','6px, 4px');
        await maz.press('Enter');
        await expect(maz).toHaveAttribute('aria-pressed','false');
        await expect(first).toHaveCount(0);
        await expect(second).toHaveCount(1);
        await maz.press('Space');
        await expect(first).toHaveCount(2);
        const data=frame.locator('#chart-data');
        await data.locator('summary').press('Enter');
        await expect(data.getByRole('row')).toHaveCount(8);
        await expect(data.getByRole('row').filter({hasText:'11:00'})).toContainText('Нет данных');
        await data.locator('summary').press('Enter');
        const reference=frame.locator('#chart-reference');
        await expect(reference).not.toHaveAttribute('open','');
        await reference.locator('summary').press('Enter');
        await expect(frame.locator('#series-palette .swatch')).toHaveCount(8);
        await reference.locator('summary').press('Enter');
        for(const id of ['chart-types','chart-integration']){
          const disclosure=frame.locator('#'+id);
          await expect(disclosure).not.toHaveAttribute('open','');
          await disclosure.locator('summary').press('Enter');
          await expect(disclosure).toHaveAttribute('open','');
          await disclosure.locator('summary').press('Enter');
        }
        const code=page.locator('#card-description details');
        await code.locator('summary').press('Enter');
        await expect(code.getByRole('button',{name:'Копировать код',exact:true})).toBeVisible();
        await code.locator('summary').press('Enter');
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
        expect(await frame.locator('html').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
        expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
        if(theme==='DEFAULT'&&appearance==='light')await page.screenshot({path:testInfo.outputPath('charts-'+width+'.png'),fullPage:true});
        if(width===390)await page.locator('.page-contents summary').click();
        await page.locator('.page-contents').getByRole('link',{name:'Краткая памятка',exact:true}).click();
        await expect(frame.locator('#choosing')).toBeFocused();
        await page.reload();
        await expect(frame.locator('#choosing')).toBeInViewport();
      }
    }
    await page.goto(served.url+'/index.html?card=DsCharts&compare=1');
    await expect(page.locator('#viewports iframe')).toHaveCount(4);
    await expect(page.locator('.page-contents')).toHaveCount(1);
    for(let i=0;i<4;i++)await expect(page.frameLocator('#preview-'+i).locator('#ready-interface svg')).toHaveCount(1);
  }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
