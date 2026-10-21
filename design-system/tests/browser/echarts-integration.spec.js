import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
const root=fileURLToPath(new URL('../../../',import.meta.url));

test('ECharts integration preserves series selection, theme, sizing and legacy routes',async({page})=>{
  const served=await serveRoot(siteRoot());
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try{
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
      for(const width of [1440,390]){
        await page.setViewportSize({width,height:1000});
        await page.goto(served.url+`/index.html?card=DsChart&theme=${theme}&appearance=${appearance}&density=${density}`);
        const frame=page.frameLocator('#preview'),plot=frame.locator('#echarts-plot');
        await expect(page.locator('h1')).toHaveText('Интеграция ECharts');
        await expect(page.locator('.page-contents')).toHaveCount(1);
        await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
        await expect(plot.locator('svg')).toHaveCount(1);
        await expect(plot.getByText('Лимит 90 км/ч',{exact:true})).toBeVisible();
        for(const id of ['legend-details','tooltip-details']){
          const details=frame.locator('#'+id);
          await expect(details).not.toHaveAttribute('open','');
          await details.locator('summary').press('Enter');
          await expect(details).toHaveAttribute('open','');
          await details.locator('summary').press('Enter');
        }
        const button=frame.getByRole('button',{name:'МАЗ 5440 км/ч'});
        await button.press('Enter');await expect(button).toHaveAttribute('aria-pressed','false');
        await plot.evaluate(el=>document.documentElement.setAttribute('data-ds-appearance',document.documentElement.dataset.dsAppearance==='light'?'dark':'light'));
        await expect.poll(()=>plot.evaluate(el=>echarts.getInstanceByDom(el).getOption().legend[0].selected['МАЗ 5440'])).toBe(false);
        await expect.poll(()=>plot.evaluate(el=>echarts.getInstanceByDom(el).getOption().textStyle.color===dsEChartsTheme(el).textStyle.color)).toBe(true);
        await button.press('Space');await expect(button).toHaveAttribute('aria-pressed','true');
        await plot.evaluate(el=>echarts.getInstanceByDom(el).dispatchAction({type:'showTip',seriesIndex:1,dataIndex:2}));
        await expect(plot.getByText('Volvo FH16').last()).toBeVisible();
        await expect(plot.getByText('48 км/ч').last()).toBeVisible();
        await plot.evaluate(el=>echarts.getInstanceByDom(el).dispatchAction({type:'hideTip'}));
        await frame.locator('#chart-data summary').press('Enter');
        await expect(frame.locator('#chart-data tbody tr')).toHaveCount(7);
        await expect(frame.locator('#chart-data tbody tr').nth(3)).toContainText('Нет данных');
        await frame.locator('#chart-data summary').press('Enter');
        expect(await frame.locator('html').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
        expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
        if(width===390)await page.locator('.page-contents summary').click();
        await page.locator('.page-contents').getByRole('link',{name:'Легенда',exact:true}).click();
        await expect(frame.locator('#legend')).toBeFocused();
      }
    }
    for(const old of ['DsChartLegend','DsChartTooltip']){
      await page.goto(served.url+'/index.html?card='+old);
      await expect(page.locator('h1')).toHaveText('Интеграция ECharts');
      await expect(page.locator('nav a[data-id="'+old+'"]')).toHaveCount(0);
      await page.goto(served.url+'/api/components/'+old+'.html');
      await expect(page.getByRole('heading',{level:1}).first()).toHaveText(old);
    }
    await page.goto(served.url+'/index.html?card=DsChart&compare=1');
    await expect(page.locator('#viewports iframe')).toHaveCount(1);
    for(let i=0;i<1;i++)await expect(page.frameLocator('#preview').locator('#echarts-plot svg')).toHaveCount(1);
    for(const name of ['DsSparkline','DsScoreBar'])await expect(page.locator('nav a[data-id="'+name+'"]')).toHaveCount(1);
    // Execute the copyable documentation as a consumer, independently of the preview script.
    const readme=readFileSync(root+'/design-system/components/DsChart/README.md','utf8');
    const markup=readme.match(/```html\n([\s\S]*?)\n```/)[1];
    const source=readme.match(/```js\n([\s\S]*?)\n```/)[1];
    const bundle=await build({stdin:{contents:source,resolveDir:root+'/.tmp/package',loader:'js'},bundle:true,write:false,format:'iife',loader:{'.css':'empty'}});
    await page.route('**/copied-chart.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="ru"><head><link rel="stylesheet" href="/dist/styles.css"></head><body>'+markup+'<script>'+bundle.outputFiles[0].text+'</script></body></html>'}));
    await page.goto(served.url+'/copied-chart.html');
    await expect(page.locator('#echarts-plot svg')).toHaveCount(1);
    await expect(page.getByText('Лимит 90 км/ч',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:'МАЗ 5440 км/ч'}).press('Enter');
    await expect(page.getByRole('button',{name:'МАЗ 5440 км/ч'})).toHaveAttribute('aria-pressed','false');
    await page.locator('#chart-data summary').press('Enter');
    await expect(page.locator('#data-rows tr')).toHaveCount(7);
    expect(errors).toEqual([]);
  }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
