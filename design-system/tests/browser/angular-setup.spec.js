import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {siteRoot} from '../helpers/browser-snapshot.mjs';
import {serveRoot} from '../../tools/baseline/render.mjs';

test('Angular connection guide is readable, searchable and linkable with copyable code',async({page})=>{
 const served=await serveRoot(siteRoot()),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('response',response=>{if(response.status()>=400)errors.push(response.url());});
 try{
  await page.goto(served.url+'/index.html');
  await expect(page.locator('nav#cards h2').last()).toHaveText('UI-kit');
  const uiKit=page.locator('[data-navigation-group=ui-kit]');
  await uiKit.getByRole('link',{name:'Добавление компонентов',exact:true}).click();
  await expect(page.locator('#title')).toHaveText('Добавление компонентов');
  await expect(page.locator('#card-description')).toContainText('ng-ui-kit/src/core.ts');
  await expect(page.locator('#card-description')).toContainText('npm run check:angular');
  await uiKit.getByRole('link',{name:'Подключение Angular',exact:true}).click();
  await expect(page.locator('#title')).toHaveText('Подключение Angular');
  await expect(page.locator('#preview')).toHaveCount(0);
  await expect(page.getByRole('group',{name:'Настройки примера'})).toBeHidden();
  const guide=page.locator('#card-description');
  await expect(guide.getByRole('heading',{name:'4. Стили: angular.json',exact:true})).toBeVisible();
  await expect(guide.locator('pre').filter({hasText:'"styles"'})).toContainText('src/styles.scss');
  await expect(guide.locator('pre').filter({hasText:'export class SaveExample'})).toContainText('DsButtonComponent');
  await guide.locator('.code-copy').first().click();
  await expect(guide.locator('.code-block').first().locator('[role=status]')).toContainText(/Скопировано|скопир/);
  for(const [theme,appearance,density]of [['DEFAULT','light','cozy'],['DEFAULT','dark','compact'],['RED2','light','cozy'],['RED2','dark','compact']])for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   await page.goto(served.url+`/index.html?card=AngularSetup&theme=${theme}&appearance=${appearance}&density=${density}#10-компоненты`);
   await expect(guide.getByRole('heading',{name:'10. Компоненты',exact:true})).toBeInViewport();
   expect(await page.locator('html').getAttribute('data-ds-appearance')).toBe('light');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await expect(page.locator('.page-contents')).toHaveCount(1);
  }
  await page.locator('.page-contents summary').click();
  await page.locator('.page-contents').getByRole('link',{name:'10. Компоненты',exact:true}).click();
  await expect(guide.getByRole('heading',{name:'10. Компоненты',exact:true})).toBeFocused();
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('#search').fill('подключение angular');
  await expect(page.locator('nav a[data-id]')).toHaveCount(1);
  await expect(page.locator('nav a[data-id=AngularSetup]')).toBeVisible();
  await page.locator('#search').fill('DsButton');
  await page.locator('nav a[data-id=DsButton]').click();
  await expect(page.locator('#preview')).toHaveCount(1);
  await expect(page.getByRole('group',{name:'Настройки примера'})).toBeVisible();
  await page.goto(served.url+'/design-system/guides/angular-setup.html');
  await expect(page.getByRole('heading',{name:'Подключение Angular',exact:true})).toBeVisible();
  await expect(page.getByText('export class SaveExample',{exact:false})).toBeVisible();
  expect(errors).toEqual([]);
 }finally{served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));}
});
