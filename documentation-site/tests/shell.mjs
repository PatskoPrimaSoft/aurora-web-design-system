import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function checkShell({ page, url, modes, browser }) {
  for (const [theme, appearance, density] of modes) {
    const query = `?theme=${theme}&appearance=${appearance}&density=${density}`;
    await page.goto(url + 'foundations/typography' + query);
    await expect(page.locator('h1')).toHaveText('Типографика');
    const disclosure = page.locator('#full-name details');
    await expect(disclosure).not.toHaveAttribute('open');
    await disclosure.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(disclosure).toHaveAttribute('open');
    await expect(disclosure.locator('.content p')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(disclosure).not.toHaveAttribute('open');
    await page.evaluate(() => document.fonts.ready);
    const headings = await page.locator('article h2[id], article h3[id]').allTextContents();
    assert.deepEqual(headings.slice(-2), ['Пример кода', 'Дальше']);
    await expect(page.locator('aurora-code-block code')).toContainText(
      'font: var(--ds-type-title)',
    );
    await expect(page.locator('.related-links a')).toHaveCount(3);
    assert.equal(
      await page.locator('.related-links').evaluate((el) => getComputedStyle(el).paddingLeft),
      '40px',
    );
    assert.equal(
      await page
        .locator('.related-links li')
        .nth(1)
        .evaluate((el) => getComputedStyle(el).marginTop),
      '0px',
    );
    for (const link of await page.locator('.related-links a').all()) {
      await expect(link).toHaveAttribute(
        'href',
        /foundations\/(colors|density)|documents\/typography-migration/,
      );
    }
    await expect(page.locator('.page-contents a')).toHaveText(headings.map((text) => text.trim()));
    const accessibility = await new AxeBuilder({ page }).analyze();
    assert.deepEqual(
      accessibility.violations.map((item) => item.id),
      [],
      `${query}: accessibility`,
    );
    await page.locator('.page-contents').getByRole('link', { name: 'Шрифты', exact: true }).click();
    await expect(page.locator('#fonts')).toBeFocused();
    await expect(page.locator('.page-contents a[aria-current="location"]')).toHaveText('Шрифты');
    await page.locator('#catalog-main').evaluate((el) => el.scrollTo(0, 0));
    await expect(page.locator('.page-contents a[aria-current="location"]')).toHaveText(
      headings[0].trim(),
    );
    await page.locator('.page-contents').getByRole('link', { name: 'Шрифты', exact: true }).click();
    await expect(page.locator('.page-contents a[aria-current="location"]')).toHaveText('Шрифты');
    await expect(page.locator('#fonts')).toBeFocused();
    await page.locator('#catalog-main').evaluate((el) => el.scrollTo(0, 0));
    await expect(page.locator('.page-contents a[aria-current="location"]')).toHaveText(
      headings[0].trim(),
    );
    await page.locator('.page-contents a').last().hover();
    assert.notEqual(
      await page
        .locator('.page-contents a')
        .last()
        .evaluate((el) => getComputedStyle(el).backgroundColor),
      await page
        .locator('.page-contents a[aria-current="location"]')
        .evaluate((el) => getComputedStyle(el).backgroundColor),
      'Hover and current section must have different backgrounds',
    );
    await page.locator('#catalog-main').evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await expect(page.locator('.page-contents a[aria-current="location"]')).toHaveText(
      headings.at(-1).trim(),
    );
    await expect(page).toHaveURL(/#fonts$/); // Scrolling highlights a section without rewriting its URL.
    await page.reload();
    await expect(page.locator('#fonts')).toBeFocused();
    await expect(page.locator('.page-contents a[aria-current="location"]')).toHaveText('Шрифты');
    await expect(page.locator('#catalog-navigation a[aria-current="page"]')).toHaveText(
      'Типографика',
    );
    await page.goto(url + 'components/icon' + query);
    await expect(page.locator('.demo')).toHaveAttribute('data-ds-appearance', appearance);
    await expect(page.locator('.demo')).toHaveAttribute('data-ds-theme', theme);
    await expect(page.locator('.demo')).toHaveAttribute('data-ds-density', density);
    await expect(page.getByRole('img', { name: 'Поиск', exact: true })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    assert.ok(await page.evaluate(() => document.fonts.check('20px "Material Symbols Outlined"')));
    if (appearance === 'dark') {
      assert.notEqual(
        await page.locator('.demo').evaluate((el) => getComputedStyle(el).backgroundColor),
        await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor),
      );
    }
  }
  const visibleCode = page.locator('aurora-code-block').first();
  const collapsibleCode = page.locator('aurora-code-block').nth(1);
  await expect(visibleCode.locator('pre')).toBeVisible();
  await expect(visibleCode.locator('.language')).toHaveText('HTML');
  await expect(collapsibleCode.locator('.language')).toHaveText('TypeScript');
  assert.equal(
    await visibleCode.locator('code').textContent(),
    '<ds-icon name="search" label="Поиск"></ds-icon>\n',
  );
  assert.ok(await visibleCode.locator('.hljs-name').count());
  assert.notEqual(
    await visibleCode
      .locator('.hljs-name')
      .first()
      .evaluate((el) => getComputedStyle(el).color),
    await visibleCode.locator('code').evaluate((el) => getComputedStyle(el).color),
    'Highlighting must apply token colours, not just insert span elements',
  );
  await expect(collapsibleCode.locator('details')).not.toHaveAttribute('open');
  await collapsibleCode.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(collapsibleCode.locator('.hide-code')).toBeVisible();
  const source = await collapsibleCode.locator('code').textContent();
  assert.ok(
    source.includes('\n\n@Component({\n  selector:'),
    'Code must retain blank lines and indentation',
  );
  assert.equal(
    await collapsibleCode.locator('pre').evaluate((el) => getComputedStyle(el).whiteSpace),
    'pre',
  );
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.__copiedCode = text;
        },
      },
    });
  });
  await collapsibleCode.getByRole('button', { name: 'Копировать код' }).click();
  await expect(collapsibleCode.getByRole('status')).toHaveText('Скопировано');
  assert.equal(await page.evaluate(() => window.__copiedCode), source);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('Clipboard unavailable');
        },
      },
    });
  });
  await visibleCode.getByRole('button', { name: 'Копировать код' }).click();
  await expect(visibleCode.getByRole('status')).toContainText('Скопируйте выделенный код вручную');
  const selected = await page.evaluate(() => window.getSelection().toString());
  const original = await visibleCode.locator('code').textContent();
  // Native selection may omit the final line break; it must include all code characters.
  assert.ok(selected === original || selected + '\n' === original);
  const codeAccessibility = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    codeAccessibility.violations.map((item) => item.id),
    [],
    'code block accessibility',
  );
  await collapsibleCode.locator('summary').click();
  await expect(collapsibleCode.locator('pre')).not.toBeVisible();
  await page.getByRole('combobox', { name: 'Бренд демонстраций' }).selectOption('DEFAULT');
  await expect(page.locator('.demo')).toHaveAttribute('data-ds-theme', 'DEFAULT');
  await page.getByRole('combobox', { name: 'Оформление демонстраций' }).selectOption('light');
  await expect(page.locator('.demo')).toHaveAttribute('data-ds-appearance', 'light');
  await page.getByRole('combobox', { name: 'Плотность демонстраций' }).selectOption('cozy');
  await expect(page.locator('.demo')).toHaveAttribute('data-ds-density', 'cozy');
  await expect(page).toHaveURL(/density=cozy/);
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Плотность демонстраций' })).toHaveValue('cozy');
  await page.goto(url + 'components/icon?theme=unknown&appearance=unknown&density=unknown');
  await expect(page.locator('.demo')).toHaveAttribute('data-ds-theme', 'DEFAULT');
  await expect(page.locator('.demo')).toHaveAttribute('data-ds-appearance', 'light');
  await expect(page.locator('.demo')).toHaveAttribute('data-ds-density', 'cozy');
  await page.goto(url + 'components');
  await expect(page.locator('h1')).toHaveText('Компоненты');
  await page.locator('#catalog-main').getByRole('link', { name: 'Button', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Button');
  await expect(page.locator('.placeholder')).toBeVisible();
  await page.goto(url + 'foundations/colors');
  await expect(page.locator('h1')).toHaveText('Нейтральные цвета');
  await expect(page.locator('#contrast-values td')).toHaveCount(12);
  await page.goto(url + 'missing-page');
  await expect(page.locator('h1')).toHaveText('Страница не найдена');
  await page.getByRole('link', { name: 'Aurora Design — главная' }).click();
  await expect(page.locator('h1')).toHaveText('Прочитать первым');
  await expect(page.locator('#catalog-navigation h2')).toHaveText([
    'Начало',
    'Основы',
    'Angular UI kit',
    'Миграция',
  ]);
  await expect(page.locator('.page-contents a')).toHaveCount(4);
  await page.getByRole('searchbox').fill('Типографика');
  await expect(page.locator('#catalog-navigation nav a')).toHaveCount(1);
  await expect(page.locator('#catalog-navigation h2')).toHaveText(['Основы']);
  await page.getByRole('searchbox').fill('');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Меню', exact: true }).click();
  await page
    .locator('#catalog-navigation')
    .getByRole('link', { name: 'Типографика', exact: true })
    .click();
  await expect(page.locator('#catalog-navigation')).not.toBeVisible();
  await expect(page.locator('.page-contents details')).not.toHaveAttribute('open');
  await page.getByText('На этой странице', { exact: true }).click();
  // A heading edit must update the TOC without maintaining a second list.
  await page.locator('#fonts').evaluate((el) => {
    el.textContent = 'Шрифты — проверка';
  });
  await expect(
    page.locator('.page-contents').getByRole('link', { name: 'Шрифты — проверка', exact: true }),
  ).toBeVisible();
  const mobileAccessibility = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    mobileAccessibility.violations.map((item) => item.id),
    [],
    'mobile accessibility',
  );
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.equal(await page.locator('iframe').count(), 0);
  const touchContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const touchPage = await touchContext.newPage();
  await touchPage.goto(url);
  await touchPage.getByText('На этой странице', { exact: true }).click();
  await touchPage.locator('.page-contents a').last().tap();
  await expect(touchPage.locator('#check')).toBeFocused();
  await touchPage.locator('#catalog-main').evaluate((el) => el.scrollTo(0, 0));
  await expect(touchPage.locator('.page-contents a[aria-current="location"]')).toHaveCount(1);
  await expect(touchPage.locator('.page-contents a[aria-current="location"]')).toHaveText(
    'Собирайте интерфейс из готовых компонентов',
  );
  assert.notEqual(
    await touchPage
      .locator('.page-contents a')
      .last()
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    await touchPage
      .locator('.page-contents a[aria-current="location"]')
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    'A tapped link must not retain the current-section background after scrolling up',
  );
  await touchContext.close();
}
