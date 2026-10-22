import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {serveRoot} from '../../tools/baseline/render.mjs';
import {expectPreviewFits} from './helpers/preview-layout.js';

test('iconography dictionary, actions and navigation work in four scopes at narrow and wide widths', async ({page}) => {
  const served = await serveRoot(siteRoot());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    for (const [theme, appearance, density] of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']]) {
      for (const width of [1440,390]) {
        await page.setViewportSize({width,height:900});
        await page.goto(`${served.url}/index.html?card=DsIconography&theme=${theme}&appearance=${appearance}&density=${density}`);
        const frame = page.frameLocator('#preview');
        await expect(frame.getByRole('button',{name:'Добавить объект',exact:true})).toBeVisible();
        await frame.getByRole('button',{name:'Добавить объект',exact:true}).press('Enter');
        await expect(frame.locator('#ready-example')).toContainText('Объектов: 2');
        await expect(frame.locator('body')).toHaveAttribute('data-ds-appearance','light');
        await expect(frame.locator('#ready-example')).toHaveAttribute('data-ds-appearance',appearance);
        await expect(frame.locator('#ready-example')).toHaveAttribute('data-ds-density',density);
        await expectPreviewFits(page);
        const search = frame.getByRole('textbox',{name:'Найти иконку',exact:true});
        await search.fill('удалить');
        await expect(frame.locator('.glyph')).toHaveCount(1);
        await expect(frame.locator('.glyph code')).toHaveText('delete');
        await search.fill('does-not-exist');
        await expect(frame.locator('#icon-dictionary')).toContainText('Совпадений нет');
        await search.fill('');
        const contents=page.locator('.page-contents');
        await expect(contents).toHaveCount(1);
        if(width===390)await contents.locator('summary').click();
        await contents.getByRole('link',{name:'Размер и плотность',exact:true}).press('Enter');
        await expect(page).toHaveURL(/#sizes$/);
        await expect(frame.locator('#sizes')).toBeFocused();
        await expect(frame.locator('#sizes')).toBeInViewport();
        await expectPreviewFits(page);
        expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
      }
    }
    expect(errors).toEqual([]);
  } finally {
    served.server.closeAllConnections();
    await new Promise(resolve => served.server.close(resolve));
  }
});
