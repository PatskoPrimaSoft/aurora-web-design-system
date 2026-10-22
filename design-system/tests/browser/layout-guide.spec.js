import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {expectPreviewFits} from './helpers/preview-layout.js';

test.use({actionTimeout:10000});

test('layout examples preserve selection, filtering, forms and navigation in four scopes',async ({page})=>{
  const served=await serveRoot(siteRoot());
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
    for(const [theme,appearance,density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]){
      for(const width of [1440,390]){
        await page.setViewportSize({width,height:900});
        await page.goto(`${served.url}/index.html?card=DsLayout&theme=${theme}&appearance=${appearance}&density=${density}`);
        const frame=page.frameLocator('#preview');
        for(const [id,label] of [['table-example','Сетка таблицы'],['form-example','Сетка формы'],['width-example','Сетка сравнения ширины']]){
          const example=frame.locator('#'+id);
          const toggle=example.getByRole('switch',{name:label,exact:true});
          await expect(toggle).toBeChecked();
          await expect(example.locator('.example-grid>.column-sheet span')).toHaveCount(12);
          await toggle.press('Space');
          await expect(example.locator('.example-grid')).toHaveAttribute('data-grid-visible','false');
          await expect(example.locator('.example-grid>.column-sheet')).toHaveCount(0);
          await toggle.press('Space');
          await expect(example.locator('.example-grid')).toHaveAttribute('data-grid-visible','true');
        }
        await expect(frame.locator('#map-example .column-sheet')).toHaveCount(0);
        await expect(frame.locator('#map-example').getByRole('switch')).toHaveCount(0);
        await expect(frame.getByRole('button',{name:'Volvo FH16',exact:true})).toBeVisible();
        await frame.getByRole('button',{name:'Volvo FH16',exact:true}).press('Enter');
        await expect(frame.locator('#map-example')).toContainText('Выбран Volvo FH16');
        await frame.getByRole('button',{name:'Выбрать Scania R450 на карте',exact:true}).click();
        await expect(frame.getByRole('button',{name:'Scania R450',exact:true})).toHaveAttribute('aria-pressed','true');
        await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
        await expect(frame.locator('#map-example')).toHaveAttribute('data-ds-appearance',appearance);
        await expect(frame.locator('#map-example')).toHaveAttribute('data-ds-density',density);
        await expectPreviewFits(page);
        const structure=frame.locator('#structure-example');
        await structure.getByRole('switch',{name:'Показать сетку',exact:true}).press('Space');
        await expect(structure.locator('.content-grid')).toHaveAttribute('data-guides','true');
        await expect(structure.locator('.frame-nav .guides')).toHaveCount(0);
        await expect(structure.locator('.content-grid .guides span')).toHaveCount(4);
        for(const id of ['anatomy-example','spans-example','centering-example']){
          await expect(frame.locator('#'+id+' .column-sheet span')).toHaveCount(12);
          const diagram=frame.locator('#'+id);
          const gap=width===390?(density==='cozy'?8:6):(density==='cozy'?16:12);
          await expect(diagram.locator('.column-sheet')).toHaveCSS('column-gap',gap+'px');
          await expect(diagram.locator('.grid-canvas')).toHaveCSS('padding-left',(density==='cozy'?16:12)+'px');
          await expect(diagram.locator(width===390?'.grid-token-narrow':'.grid-token-wide')).toBeVisible();
          await expect(diagram.locator(width===390?'.grid-token-narrow':'.grid-token-wide')).toContainText(width===390?'--ds-gap-sm':'--ds-gap-md');
          if(id!=='anatomy-example')await expect(diagram.locator('.span-stack')).toHaveCSS('row-gap',(density==='cozy'?16:12)+'px');
        }
        await expect(frame.locator('#spans-example .span-row')).toHaveCount(4);
        await expect(frame.locator('[data-span-row="6-6"] .span-block')).toHaveCount(2);
        await expect(frame.locator('[data-span-row="4-4-4"] .span-block')).toHaveCount(3);
        const geometry=await frame.locator('#centering-example').evaluate(figure=>{
          const columns=figure.querySelector('.column-sheet').getBoundingClientRect();
          return [...figure.querySelectorAll('.span-block')].map(block=>{
            const box=block.getBoundingClientRect();
            return {span:Number(block.dataset.centeredSpan),centerDelta:Math.abs((box.left+box.right-columns.left-columns.right)/2),fits:box.left>=columns.left-1&&box.right<=columns.right+1,width:box.width};
          });
        });
        expect(geometry.every(block=>block.centerDelta<1&&block.fits)).toBe(true);
        expect(geometry[0].width).toBeLessThan(geometry[1].width);
        expect(geometry[1].width).toBeLessThan(geometry[2].width);
        const comparison=frame.locator('#width-example');
        const expectGridAlignment=async(example,selector)=>{
          await expect.poll(()=>example.evaluate((host,selector)=>{
            const columns=host.querySelector('.example-grid>.column-sheet').getBoundingClientRect();
            const content=host.querySelector(selector).getBoundingClientRect();
            return Math.abs(columns.left-content.left)<1&&Math.abs(columns.right-content.right)<1;
          },selector)).toBe(true);
        };
        await expectGridAlignment(comparison,'.width-form');
        await expectGridAlignment(frame.locator('#form-example'),'.settings');
        const limited=await comparison.locator('.width-surface').evaluate(element=>element.getBoundingClientRect().width);
        await comparison.getByRole('button',{name:'На всю ширину',exact:true}).press('Enter');
        await expect(comparison.locator('.width-surface')).toHaveAttribute('data-policy','fluid');
        const fluid=await comparison.locator('.width-surface').evaluate(element=>element.getBoundingClientRect().width);
        await expectGridAlignment(comparison,'.width-form');
        expect(fluid).toBeGreaterThanOrEqual(limited);
        if(width===1440)expect(fluid).toBeGreaterThan(limited);
        await comparison.getByRole('button',{name:'Карта',exact:true}).click();
        await expect(comparison.getByRole('img',{name:'Схема карты для сравнения ширины',exact:true})).toBeVisible();
        await expect(comparison.locator('.column-sheet')).toHaveCount(0);
        await expect(comparison.getByRole('switch')).toHaveCount(0);
        await expect(comparison).toContainText('Карта использует всё доступное место.');
        await comparison.getByRole('button',{name:'Ограниченная',exact:true}).click();
        await expect(comparison).toContainText('Карта ограничена');
        await expectPreviewFits(page);
        await frame.getByRole('textbox',{name:'Поиск в таблице',exact:true}).fill('Volvo');
        await expect(frame.locator('#table-example')).toContainText('Найдено объектов: 1');
        await frame.getByRole('switch',{name:'Только на связи',exact:true}).press('Space');
        await expect(frame.getByRole('switch',{name:'Только на связи',exact:true})).toBeChecked();
        await expect(frame.locator('#table-example')).toContainText('Объекты не найдены');
        await frame.getByRole('textbox',{name:'Название автопарка',exact:true}).fill('Тестовый автопарк');
        await frame.getByRole('button',{name:'Сохранить настройки',exact:true}).press('Enter');
        await expect(frame.locator('#form-example')).toContainText('Настройки примера сохранены локально.');
        await frame.getByRole('button',{name:'Сбросить',exact:true}).click();
        await expect(frame.getByRole('textbox',{name:'Название автопарка',exact:true})).toHaveValue('Основной автопарк');
        const contents=page.locator('.page-contents');
        if(width===390)await contents.locator('summary').click();
        await contents.getByRole('link',{name:'Назначьте владельца прокрутки',exact:true}).press('Enter');
        await expect(page).toHaveURL(/#scroll$/);
        await expect(frame.locator('#scroll')).toBeFocused();
        await expect(frame.locator('#scroll')).toBeInViewport();
        await expectPreviewFits(page);
        expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
      }
    }
    expect(errors).toEqual([]);
  }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
