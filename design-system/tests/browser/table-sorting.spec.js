import {catalogueCards, siteRoot} from '../helpers/browser-snapshot.mjs';
import {test,expect} from '@playwright/test';
import {serveRoot} from '../../tools/baseline/render.mjs';

test('table owns sorting guidance and legacy links preserve preview settings',async({page},testInfo)=>{
  const cards=catalogueCards();
  expect(cards.some(card=>card.id==='DsSorting')).toBe(false);
  const served=await serveRoot(siteRoot());
  try{
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
      await page.goto(`${served.url}/index.html?card=DsSorting&theme=${theme}&appearance=${appearance}&density=${density}`);
      await expect(page.locator('#title')).toHaveText('Table');
      await expect(page.locator('nav a[data-id="DsSorting"]')).toHaveCount(0);
      const frame=page.frameLocator('#preview');
      for(const [axis,value] of Object.entries({theme,appearance,density}))await expect(frame.locator('html')).toHaveAttribute(`data-ds-${axis}`,value);
      const table=frame.getByRole('table',{name:'Объекты с сортировкой'});
      const name=table.locator('th').filter({hasText:'Объект'});
      const group=table.locator('th').filter({hasText:'Группа'});
      await expect(name).toHaveAttribute('aria-sort','ascending');
      const iconGap=await name.getByRole('button').evaluate(button=>{
        const text=button.querySelector('[data-ds-table-text]').getBoundingClientRect();
        const icon=button.lastElementChild.getBoundingClientRect();
        return icon.left-text.right;
      });
      expect(iconGap).toBeGreaterThanOrEqual(3);
      expect(iconGap).toBeLessThanOrEqual(5);
      await expect(table.locator('tbody tr').first()).toContainText('GAZ Next');
      await name.getByRole('button').press('Enter');
      await expect(name).toHaveAttribute('aria-sort','descending');
      await expect(table.locator('tbody tr').first()).toContainText('Volvo FH16');
      await name.getByRole('button').press('Space');
      await expect(name).toHaveAttribute('aria-sort','ascending');
      await group.getByRole('button').click();
      await expect(group).toHaveAttribute('aria-sort','ascending');
      await expect(name).toHaveAttribute('aria-sort','none');
      const details=page.locator('#card-description details').filter({hasText:'Технические подробности сортировки'});
      await expect(details).not.toHaveAttribute('open','');
      await details.locator('summary').press('Enter');
      await expect(details).toHaveAttribute('open','');
      await details.locator('summary').press('Enter');
      await page.setViewportSize({width:390,height:900});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
      await page.screenshot({path:testInfo.outputPath(`sorting-${theme}-${appearance}.png`),fullPage:true});
      await page.setViewportSize({width:1440,height:1000});
    }
    await page.goto(`${served.url}/design-system/components/DsSorting/preview.html?theme=RED2&appearance=dark&density=compact`);
    await expect(page.locator('#title')).toHaveText('Table');
    await expect(page.locator('#theme')).toContainText('RED2');
    await expect(page.locator('#appearance')).toContainText('Тёмное');
    await page.goto(`${served.url}/docs/cards/DsSorting.html`);
    await expect(page.getByRole('heading',{name:'Правила сортировки',exact:true})).toBeVisible();
  }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
