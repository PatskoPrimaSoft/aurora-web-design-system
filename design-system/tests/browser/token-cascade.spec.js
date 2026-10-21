import {preparedBaseline} from '../helpers/browser-snapshot.mjs';
import { test, expect } from '@playwright/test';
import { serveRoot, SCOPES } from '../../tools/baseline/render.mjs';
import { buildDist } from '../../../tools/build.js';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { readTokenModel } from '../../tools/tokens/model.mjs';
import { renderTokenCss } from '../../tools/tokens/css.mjs';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const clean = props => Object.fromEntries(Object.entries(props).filter(([n]) => !n.startsWith('--ds-_')).map(([n,v]) => [n, v.trim().toLowerCase().replace(/\s+/g,' ')]));
test('current tokens resolve identically in flat and nested scopes across eight combinations', async ({ page }) => {
  const baseline = preparedBaseline();
  const current = buildDist({ root });
  const fixture = readFileSync(`${baseline.root}/tests/fixtures/cascade.html`, 'utf8');
  const served = await serveRoot(baseline.root, new Map());
  const read = async css => {
    await page.goto(`${served.url}/tests/fixtures/cascade.html`);
    await page.waitForSelector('#out');
    if (css) { await page.locator('link[rel="stylesheet"]').evaluateAll(nodes => nodes.forEach(n => n.remove())); await page.addStyleTag({ content: css }); }
    return page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[id^="c-"],[id^="n-"],[id^="bare-"]')].map(el => {
      const s=getComputedStyle(el); return [el.id,Object.fromEntries([...s].filter(n=>n.startsWith('--')).map(n=>[n,s.getPropertyValue(n)]))];
    })));
  };
  try {
    const fresh=await read(current.styles);
    const contexts={
      'c-default-light':['DEFAULT','light','cozy'],'c-default-dark':['DEFAULT','dark','compact'],
      'c-red2-light':['RED2','light','cozy'],'c-red2-dark':['RED2','dark','compact'],
      'n-dark-in-light':['DEFAULT','dark','cozy'],'n-red2-in-default':['RED2','light','cozy'],
      'n-compact-in-red2':['RED2','light','compact'],'n-red2-light-in-dark':['RED2','light','cozy'],
      'bare-compact':['DEFAULT','light','compact']
    };
    const flattened={};
    for(const scope of SCOPES) {
      await page.goto(`${served.url}/tests/fixtures/cascade.html`);
      await page.locator('link[rel="stylesheet"]').evaluateAll(nodes=>nodes.forEach(n=>n.remove()));await page.addStyleTag({content:current.styles});
      const get=() => page.evaluate(scope => {
        const el=document.documentElement;for(const [k,v]of Object.entries(scope))el.setAttribute(`data-ds-${k}`,v);
        const s=getComputedStyle(el);return Object.fromEntries([...s].filter(n=>n.startsWith('--')).map(n=>[n,s.getPropertyValue(n)]));
      },scope);
      const want=clean(await get());
      flattened[`${scope.theme}.${scope.appearance}.${scope.density}`]=want;
      expect(Object.keys(want).length).toBeGreaterThan(100);
      expect(want['--ds-control-h']).toBe(scope.density==='compact'?'30px':'36px');
    }
    for(const [id,scope]of Object.entries(contexts))expect(clean(fresh[id]),id).toEqual(flattened[scope.join('.')]);
  } finally {await new Promise(resolve=>served.server.close(resolve));}
});
test('deep independent scopes, local brand and typography aliases remain live', async ({ page }) => {
  const { styles } = buildDist({root});
  await page.setContent(`<style>${styles}</style><div data-ds-theme="RED2" data-ds-appearance="dark"><div data-ds-theme="DEFAULT"><div data-ds-appearance="light"><div data-ds-theme="RED2"><div id="deep" data-ds-appearance="dark" data-ds-density="compact"></div></div></div></div></div><div id="local" data-ds-theme="RED2" style="--ds-brand:#123456"></div>`);
  const values = await page.evaluate(() => {
    const get=(id,prop)=>getComputedStyle(document.getElementById(id)).getPropertyValue(prop).trim();
    document.documentElement.style.setProperty('--ds-weight-regular','700');
    return {brand:get('deep','--ds-brand'),height:get('deep','--ds-control-h'),focus:get('local','--ds-focus-color'),body:get('deep','--ds-type-body')};
  });
  expect(values.brand).toBe('#b9b6b7');expect(values.height).toBe('30px');expect(values.focus).toBe('#123456');expect(values.body).toMatch(/^700 /);
});
test('changing a brand changes frozen values and dependent focus', async ({page}) => {
  const source=JSON.parse(readFileSync(`${root}/design-system/tokens/source.json`));
  source.color.tokens.find(t=>t.name==='ds-brand').value['ds-appearance-light-ds-red2']='#ff00ff';
  await page.setContent(`<style>${renderTokenCss(readTokenModel(source))}</style><div id="scope" data-ds-theme="RED2"></div>`);
  const values=await page.locator('#scope').evaluate(el=>{const s=getComputedStyle(el);return [s.getPropertyValue('--ds-brand').trim(),s.getPropertyValue('--ds-focus-color').trim()];});
  expect(values).toEqual(['#ff00ff','#ff00ff']);expect(values[0]).not.toBe('#555354');
});

test('appearance aliases resolve local primitive overrides at each boundary', async ({page}) => {
  const {styles}=buildDist({root});
  await page.setContent(`<style>${styles}</style><div data-ds-appearance="dark" style="--ds-n-100:#123456"><div id="alias" data-ds-density="compact" style="--ds-n-100:#abcdef"></div></div>`);
  expect(await page.locator('#alias').evaluate(el=>getComputedStyle(el).getPropertyValue('--ds-fg').trim())).toBe('#abcdef');
});

test('brand alias chains stay live across appearance and density boundaries',async({page})=>{
  const {styles}=buildDist({root});
  await page.setContent(`<style>${styles}</style><div data-ds-theme="RED2" data-ds-appearance="light"><div id="dark" data-ds-appearance="dark"><div id="compact" data-ds-density="compact"></div></div></div>`);
  for(const id of ['dark','compact']) expect(await page.locator('#'+id).evaluate(el=>{const s=getComputedStyle(el);return ['--ds-accent','--ds-accent-mark','--ds-accent-on','--ds-accent-mark-on'].map(p=>s.getPropertyValue(p).trim());})).toEqual(['#f26a63','#f26a63','#2d1716','#2d1716']);
});
