import {expect} from '@playwright/test';

export async function chooseCatalogueScope(page, axis, value) {
  await expect(page.locator('#' + axis)).toHaveAttribute('aria-haspopup', 'menu');
  await page.locator('#' + axis).click();
  const label = {light:'Светлое',dark:'Тёмное',cozy:'Обычная',compact:'Компактная'}[value] || value;
  await page.getByRole('menuitemradio', {name:label, exact:true}).click();
}
