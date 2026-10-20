import { test, expect } from '@playwright/test';
import { buildCatalogue } from '../../tools/catalog/build.mjs';
import { serveRoot } from '../../tools/baseline/render.mjs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
test('disabled selection stays legible and mixed selection selects all with the keyboard', async ({ page }, testInfo) => {
  await buildCatalogue({ root, outDir: `${root}/site` });
  const served = await serveRoot(`${root}/site`);
  try {
    for (const [theme, appearance, density] of [['DEFAULT', 'light', 'cozy'], ['DEFAULT', 'dark', 'compact'], ['RED2', 'light', 'cozy'], ['RED2', 'dark', 'compact']]) {
      const query = `theme=${theme}&appearance=${appearance}&density=${density}`;
      await page.goto(`${served.url}/design-system/components/DsCheckbox/preview.html?${query}`);
      await page.getByRole('region',{name:'Обычный выбор',exact:true}).waitFor();
      const checks = await page.locator('#root').evaluate(root => {
        const luminance = color => {
          const values = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => {
            v /= 255;
            return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
          });
          return .2126 * values[0] + .7152 * values[1] + .0722 * values[2];
        };
        const contrast = (a, b) => {
          const x = luminance(a), y = luminance(b);
          return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
        };
        // The disabled column must preserve all three glyphs: tick, dash and radio dot.
        const rows = [...root.querySelectorAll('tbody tr')];
        const disabled = rows.map(row => row.querySelector('td:last-child [aria-hidden="true"]'));
        return disabled.filter(Boolean).map(box => {
          const surface = getComputedStyle(box.closest('[data-ds-example-demo]')||document.body).backgroundColor;
          const css = getComputedStyle(box), mark = box.firstElementChild;
          const ink = mark && getComputedStyle(mark);
          const markColor = ink?.backgroundColor === 'rgba(0, 0, 0, 0)' ? ink.color : ink?.backgroundColor;
          return { width: css.borderTopWidth, border: contrast(css.borderTopColor, surface), mark: mark ? contrast(markColor, css.backgroundColor) : null };
        });
      });
      expect(checks).toHaveLength(5);
      expect(checks.filter(check => check.mark !== null)).toHaveLength(3);
      for (const check of checks) {
        expect(check.width).toBe('2px');
        expect(check.border).toBeGreaterThanOrEqual(2);
        if (check.mark !== null) expect(check.mark).toBeGreaterThanOrEqual(3);
      }
      await page.screenshot({ path: testInfo.outputPath(`selection-${theme}-${appearance}.png`) });
      const mixed = page.getByRole('checkbox', { name: 'Все объекты группы' });
      const children=page.getByRole('group',{name:'Объекты группы',exact:true}).getByRole('checkbox');
      await expect(children).toHaveCount(3);
      await expect(children.nth(0)).toBeChecked();
      await expect(children.nth(1)).not.toBeChecked();
      await expect(mixed).toHaveJSProperty('indeterminate', true);
      await mixed.focus();
      await page.keyboard.press('Space');
      await expect(mixed).toBeChecked();
      await expect(mixed).toHaveJSProperty('indeterminate', false);
      for(const child of await children.all())await expect(child).toBeChecked();
      await page.keyboard.press('Enter');
      await expect(mixed).toBeChecked();
      await expect(mixed).toBeFocused();
      expect(await mixed.evaluate(input=>getComputedStyle(input.nextElementSibling).outlineStyle)).toBe('solid');
      await page.keyboard.press('Space');
      await expect(mixed).not.toBeChecked();
      for(const child of await children.all())await expect(child).not.toBeChecked();
      await children.first().focus();await page.keyboard.press('Space');
      await expect(mixed).toHaveJSProperty('indeterminate',true);
      const week=page.getByRole('radio',{name:'Неделя',exact:true});
      const day=page.getByRole('radio',{name:'Сутки',exact:true});
      await week.focus();await page.keyboard.press('ArrowLeft');
      await expect(day).toBeChecked();await expect(week).not.toBeChecked();
      await page.keyboard.press('ArrowRight');
      await expect(week).toBeChecked();await expect(day).not.toBeChecked();
      await expect(page.getByRole('radio',{name:'Радио: выбран',exact:true})).toBeChecked();
      await expect(page.getByRole('checkbox',{name:'Изменение параметров',exact:true})).toHaveAccessibleDescription('Недоступно для вашей роли');
      const bare=page.getByRole('checkbox',{name:'Выбрать строку',exact:true});
      expect(await bare.evaluate(el=>el.nextElementSibling.getBoundingClientRect().width)).toBe(24);
      await bare.focus();await page.keyboard.press('Space');await expect(bare).toBeChecked();
      const unchecked=page.getByRole('checkbox',{name:'Чекбокс: не выбран',exact:true});
      await unchecked.locator('..').hover();
      const hover=await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--ds-border-control-hover').trim());
      // Resolve the token through an element to compare normalized browser colors.
      const expectedHover=await page.evaluate(value=>{const el=document.createElement('span');el.style.color=value;document.body.append(el);const color=getComputedStyle(el).color;el.remove();return color},hover);
      await expect.poll(()=>unchecked.evaluate(el=>getComputedStyle(el.nextElementSibling.firstElementChild).borderColor)).toBe(expectedHover);
      await unchecked.focus();await page.keyboard.press('Space');await expect(unchecked).not.toBeChecked();
      await page.setViewportSize({width:390,height:560});
      expect(await page.evaluate(()=>document.body.scrollWidth)).toBeLessThanOrEqual(390);
      expect(await page.locator('[data-ds-example-demo]').evaluateAll(demos=>demos.every(node=>node.scrollHeight<=node.clientHeight+1&&node.scrollWidth<=node.clientWidth+1))).toBe(true);
      await page.screenshot({path:testInfo.outputPath(`selection-mobile-${theme}-${appearance}.png`)});
      await page.setViewportSize({width:1180,height:800});
    }
  } finally {
    served.server.closeAllConnections();
    await new Promise(resolve => served.server.close(resolve));
  }
});

test('native selection does not submit forms or activate table and tree rows',async({page})=>{
  await buildCatalogue({root,outDir:`${root}/site`});
  const served=await serveRoot(`${root}/site`);
  try {
    await page.goto(`${served.url}/design-system/components/DsCheckbox/preview.html`);
    await page.evaluate(()=>{
      const {React,ReactDOM}=window,h=React.createElement,S=window.AuroraWebDesignSystem_96e210;
      window.selectionEvents={submit:0,open:0,expand:0,select:0};
      const events=window.selectionEvents;
      const host=document.createElement('div');host.id='integration';document.body.append(host);
      function App(){
        const [state,setState]=React.useState('indeterminate');
        return h('form',{onSubmit:e=>{e.preventDefault();events.submit++}},
          h(S.DsCheckbox,{label:'Form selection',state,onChange:setState}),
          h(S.DsTable,{columns:[{key:'name',label:'Name'}],rows:[{id:1,name:'Row'}],selectable:true,
            onRowClick:()=>events.open++,onToggleRow:()=>events.select++}),
          h('div',null,h(S.DsListRow,{title:'Object',onClick:()=>events.open++}),h(S.DsCheckbox,{ariaLabel:'Select Object',state:'unchecked',onChange:()=>events.select++})),
          h(S.DsTreeRow,{title:'Tree',select:'indeterminate',onToggle:()=>events.expand++,onSelectChange:()=>events.select++}));
      }
      ReactDOM.flushSync(()=>ReactDOM.createRoot(host).render(h(App)));
    });
    const form=page.getByRole('checkbox',{name:'Form selection',exact:true});
    await form.locator('..').click();await expect(form).toBeChecked();
    await form.focus();await page.keyboard.press('Enter');await expect(form).toBeChecked();
    const controls=page.locator('#integration input[type="checkbox"]');
    // Form checkbox, table header, table row, object row, tree row.
    await expect(controls).toHaveCount(5);
    for(const index of [2,3,4]){
      const control=controls.nth(index);
      await control.locator('..').click();
      await control.focus();await page.keyboard.press('Space');
    }
    expect(await page.evaluate(()=>window.selectionEvents)).toEqual({submit:0,open:0,expand:0,select:6});
  }finally{
    served.server.closeAllConnections();await new Promise(resolve=>served.server.close(resolve));
  }
});
