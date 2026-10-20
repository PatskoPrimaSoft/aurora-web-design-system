import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {readFileSync} from 'node:fs';

test('documented layout CSS switches columns at 960px without losing content',async({page})=>{
  const readme=readFileSync(new URL('../../design-system/components/DsBreakpoints/README.md',import.meta.url),'utf8');
  const css=readme.match(/```css\r?\n([\s\S]*?)```/)[1].replace(/^@import[^\n]+/m,'');
  await page.setContent(`<style>:root{--ds-gap-md:16px}${css}</style><div class="workspace"><div class="object-list">Объекты</div><div class="object-details">МАЗ 5440 · полуприцеп-рефрижератор · AB 1234-7</div></div>`);
  for(const [width,sideBySide] of [[320,false],[360,false],[390,false],[719,false],[720,false],[959,false],[960,true],[1139,true],[1140,true],[1440,true]]) {
    await page.setViewportSize({width,height:900});
    const list=await page.locator('.object-list').boundingBox(),details=await page.locator('.object-details').boundingBox();
    expect(details.x>list.x+list.width).toBe(sideBySide);
    await expect(page.locator('.object-details')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  }
});

test('breakpoint guide preserves selection and actions when switching layout in every mode',async({page},testInfo)=>{
  const served=await serveRoot(siteRoot());
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try {
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]) {
      for(const width of [320,360,390,1440]) {
        await page.setViewportSize({width,height:900});
        await page.goto(`${served.url}/index.html?card=DsBreakpoints&theme=${theme}&appearance=${appearance}&density=${density}`);
        const frame=page.frameLocator('#preview'),scene=frame.locator('#responsive-example');
        const single=frame.getByRole('button',{name:'Одна колонка',exact:true});
        await expect(single).toHaveAttribute('aria-pressed','true');
        await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
        for(const [axis,value] of [['theme',theme],['appearance',appearance],['density',density]]) await expect(scene).toHaveAttribute('data-ds-'+axis,value);
        const objects=scene.getByRole('group',{name:'Выбор объекта'});
        const first=objects.getByRole('button',{name:'МАЗ 5440',exact:true});
        const second=objects.getByRole('button',{name:'Volvo FH16',exact:true});
        await second.focus();await page.keyboard.press('Enter');
        await expect(scene.getByRole('heading',{name:'Volvo FH16',exact:true})).toBeVisible();
        await scene.getByRole('button',{name:'Обновить',exact:true}).click();
        await expect(scene.getByRole('status')).toHaveText('Данные Volvo FH16 обновлены.');
        const wide=frame.getByRole('button',{name:'Две колонки',exact:true});
        await wide.focus();await page.keyboard.press('Enter');
        await expect(wide).toHaveAttribute('aria-pressed','true');
        await expect(second).toHaveAttribute('aria-pressed','true');
        await expect(scene.getByRole('status')).toHaveText('Данные Volvo FH16 обновлены.');
        const listBounds=await scene.locator('.object-list').boundingBox(),detailBounds=await scene.locator('.object-details').boundingBox();
        if(width===320) expect(detailBounds.y).toBeGreaterThan(listBounds.y+listBounds.height);
        else expect(detailBounds.x).toBeGreaterThan(listBounds.x+listBounds.width);
        expect(await objects.locator('[data-ds-button-label]').evaluateAll(labels=>labels.every(label=>label.scrollWidth<=label.clientWidth))).toBe(true);
        if(theme==='DEFAULT'&&appearance==='light') {
          await frame.locator('#in-interface').evaluate(el=>el.scrollIntoView());
          await page.screenshot({path:testInfo.outputPath(`breakpoints-wide-${width}.png`)});
        }
        await first.click();await expect(scene.getByRole('heading',{name:'МАЗ 5440',exact:true})).toBeVisible();
        await single.click();
        const stackedList=await scene.locator('.object-list').boundingBox(),stackedDetails=await scene.locator('.object-details').boundingBox();
        expect(stackedDetails.y).toBeGreaterThan(stackedList.y+stackedList.height);
        expect((await scene.boundingBox()).width).toBeLessThanOrEqual(390);
        const checklist=frame.locator('#breakpoints-checklist');
        await expect(checklist).not.toHaveAttribute('open','');
        await checklist.locator('summary').focus();await page.keyboard.press('Enter');
        await expect(checklist.getByText(/Сравните соседние ширины/)).toBeVisible();
        await checklist.locator('summary').click();
        const reference=frame.locator('#breakpoints-reference');
        await expect(reference).not.toHaveAttribute('open','');
        await reference.locator('summary').focus();await page.keyboard.press('Enter');
        await expect(reference.getByRole('table')).toBeVisible();
        await expect.poll(()=>page.locator('#preview').evaluate(el=>({height:el.clientHeight>=el.contentDocument.body.scrollHeight,width:el.contentDocument.documentElement.scrollWidth<=el.clientWidth}))).toEqual({height:true,width:true});
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
        expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
        await reference.locator('summary').click();
        if(theme==='DEFAULT'&&appearance==='light') {
          await frame.locator('#in-interface').evaluate(el=>el.scrollIntoView());
          await page.screenshot({path:testInfo.outputPath(`breakpoints-${width}.png`)});
        }
        await expect(page.locator('.page-contents')).toHaveCount(1);
        if(width<640) await page.locator('.page-contents summary').click();
        await page.locator('.page-contents').getByRole('link',{name:'Для собственной разметки',exact:true}).click();
        await expect(frame.locator('#reference')).toBeFocused();
        await page.reload();await expect(frame.locator('#reference')).toBeInViewport();
      }
    }
    await page.goto(`${served.url}/index.html?card=DsBreakpoints&compare=1`);
    await expect(page.locator('#viewports iframe')).toHaveCount(1);
    await expect(page.locator('.page-contents')).toHaveCount(1);
    for(let i=0;i<1;i++) await expect(page.frameLocator('#preview').getByRole('button',{name:'Одна колонка',exact:true})).toBeVisible();
    expect(errors).toEqual([]);
  } finally {served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
