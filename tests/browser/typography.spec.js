import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {serveRoot} from '../../tools/baseline/render.mjs';

const scopes = [['DEFAULT', 'light', 'cozy'], ['DEFAULT', 'dark', 'compact'], ['RED2', 'light', 'cozy'], ['RED2', 'dark', 'compact']];

test('typography stays readable and reveals full text with the keyboard in every scope', async ({page}, testInfo) => {

  const served = await serveRoot(siteRoot());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    for (const [theme, appearance, density] of scopes) {
      for (const width of [1440, 390]) {
        await page.setViewportSize({width, height: 900});
        await page.goto(`${served.url}/index.html?card=DsType&theme=${theme}&appearance=${appearance}&density=${density}`);
        const frame = page.frameLocator('#preview');
        const contents = page.locator('.page-contents');
        await expect(contents).toHaveCount(1);
        await expect(contents.locator('a')).toHaveText([
          'Типографика в интерфейсе', 'Краткая памятка', 'Читаемость и доступность',
          'Числа и телеметрия', 'Справочник ролей', 'Шрифты', 'Настройка собственного стиля',
          'Пример кода', 'Дальше',
        ]);
        await expect(frame.locator('.contents')).toHaveCount(0);
        if (width === 1440) {
          await expect(contents).toHaveCSS('position', 'sticky');
          const contentsBox = await contents.boundingBox();
          const previewBox = await page.locator('#preview').boundingBox();
          expect(contentsBox.x).toBeGreaterThanOrEqual(previewBox.x + previewBox.width);
          await expect(contents.locator('details')).toHaveAttribute('open', '');
        } else {
          await expect(contents.locator('details')).not.toHaveAttribute('open', '');
          await contents.locator('summary').click();
        }
        await expect(frame.getByRole('heading', {level: 2})).toHaveText([
          'Типографика в интерфейсе', 'Краткая памятка', 'Читаемость и доступность',
          'Числа и телеметрия', 'Справочник ролей', 'Шрифты', 'Настройка собственного стиля',
        ]);
        if (theme === 'DEFAULT' && appearance === 'light') {
          await page.screenshot({path: testInfo.outputPath(`typography-top-${width}.png`)});
        }
        const disclosure = frame.locator('#full-name summary');
        await expect(disclosure).toBeVisible();
        await expect(frame.locator('#full-name')).not.toHaveAttribute('open', '');
        await disclosure.focus();
        await page.keyboard.press('Enter');
        await expect(frame.locator('#full-name')).toHaveAttribute('open', '');
        await expect(frame.locator('#full-name p')).toBeVisible();
        await expect(frame.locator('#full-name p')).toHaveText('МАЗ 5440 · полуприцеп-рефрижератор · AB 1234-7');
        await page.keyboard.press('Space');
        await expect(frame.locator('#full-name')).not.toHaveAttribute('open', '');
        await expect.poll(() => page.locator('#preview').evaluate(iframe => ({
          fits: iframe.clientHeight >= iframe.contentDocument.body.scrollHeight,
          width: iframe.contentDocument.documentElement.scrollWidth <= iframe.clientWidth,
        }))).toEqual({fits: true, width: true});
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(frame.locator('[data-type-role]')).toHaveCount(9);
        await expect(frame.locator('[data-type-role="display"] .role-sample')).toHaveCSS('font-size', '30px');
        await expect(frame.locator('[data-type-role="body"] .role-sample')).toHaveCSS('font-size', '14px');
        await expect(frame.locator('[data-type-role="mono"] .role-sample')).toHaveCSS('font-family', /JetBrains Mono/);
        await contents.getByRole('link', {name: 'Шрифты', exact: true}).focus();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/#fonts$/);
        await expect(frame.locator('#fonts')).toBeFocused();
        await expect(frame.locator('#fonts')).toBeInViewport();
        await expect(contents.getByRole('link', {name: 'Шрифты', exact: true, includeHidden: true})).toHaveAttribute('aria-current', 'location');
        if (width === 390) await expect(contents.locator('details')).not.toHaveAttribute('open', '');
        await page.reload();
        await expect(frame.locator('#fonts')).toBeInViewport();
        await frame.locator('html').evaluate(() => document.fonts.ready);
        expect((await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
        if (theme === 'DEFAULT' && appearance === 'light') {
          await page.screenshot({path: testInfo.outputPath(`typography-${width}.png`)});
        }
      }
    }
    await expect(page.locator('#compare')).toHaveCount(0);
    await expect(page.locator('#viewports iframe')).toHaveCount(1);
    await expect(page.locator('.page-contents a')).toHaveCount(9);
    await page.locator('.page-contents summary').click();
    await page.locator('.page-contents').getByRole('link', {name: 'Числа и телеметрия', exact: true}).click();
    await expect(page.frameLocator('#preview').locator('#numbers')).toBeFocused();
    await expect(page.frameLocator('#preview').locator('#numbers')).toBeInViewport();
    for (let index = 0; index < 1; index++) {
      await expect.poll(() => page.locator('#preview').evaluate(iframe =>
        iframe.contentDocument.documentElement.scrollWidth <= iframe.clientWidth && iframe.clientHeight >= iframe.contentDocument.body.scrollHeight
      )).toBe(true);
    }
    await expect(page.locator('#card-description').getByRole('button', {name: 'Копировать код'})).toHaveCount(1);
    await page.locator('#card-description').getByRole('link', {name: 'Смена типографической системы'}).click();
    await expect(page.getByRole('heading', {name: 'Смена типографической системы', exact: true})).toBeVisible();
    await page.goBack();
    await expect(page.locator('#compare')).toHaveCount(0);
    await page.frameLocator('#preview').getByRole('link', {name: 'Открыть таблицу'}).click();
    await expect(page.locator('#title')).toHaveText('Table');
    await expect(page.locator('#theme')).toContainText('RED2');
    await expect(page.locator('#appearance')).toContainText('Тёмное');
    await expect(page.locator('#density')).toContainText('Компактная');
    expect(errors).toEqual([]);
  } finally {
    served.server.closeAllConnections();
    await new Promise(resolve => served.server.close(resolve));
  }
});
