import{spawnSync}from'node:child_process';import{mkdtempSync,mkdirSync,readFileSync,writeFileSync,copyFileSync,readdirSync,rmSync,existsSync,realpathSync}from'node:fs';import{tmpdir}from'node:os';import{join,dirname,resolve,relative,isAbsolute}from'node:path';import{fileURLToPath}from'node:url';import{createRequire}from'node:module';import assert from'node:assert/strict';
import{serveRoot}from'../../design-system/tools/baseline/render.mjs';import{chromium,expect}from'@playwright/test';
import{assertAngularButton}from'./check-angular-button.mjs';
const toolRoot=fileURLToPath(new URL('../../',import.meta.url));
export function validateConsumerInputs(root=toolRoot){
 for(const name of ['19','base','charts','legacy']){
  const folder=join(root,'ng-ui-kit/tests/consumers/angular-'+name),pkg=JSON.parse(readFileSync(join(folder,'package.json'))),lock=JSON.parse(readFileSync(join(folder,'package-lock.json')));
  assert.equal(pkg.dependencies['@primasoftllc/design-system'],undefined,`${name}: design system must be installed from tarball after fixture lock`);
  assert.ok(!lock.packages['node_modules/@primasoftllc/design-system'],`${name}: fixture lock contains design system`);
  assert.ok(Object.entries(lock.packages).every(([path,value])=>(path===''||path.startsWith('node_modules/'))&&!value.link),`${name}: fixture lock must not link to workspace sources`);
  if(name==='base'||name==='19')assert.ok(!lock.packages['node_modules/echarts'],'base lock must not contain ECharts');
 }
}
function npmCli(){const base=dirname(process.execPath);const candidates=[process.env.npm_execpath,join(base,'node_modules/npm/bin/npm-cli.js'),join(base,'../lib/node_modules/npm/bin/npm-cli.js')].filter(Boolean);const path=candidates.find(existsSync);if(!path)throw Error('Cannot locate npm CLI; run through npm run check:angular');return path;}
function npm(args,cwd,log){const result=spawnSync(process.execPath,[npmCli(),...args],{cwd,encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,NG_CLI_ANALYTICS:'false'}});if(log)writeFileSync(log,(result.stdout??'')+(result.stderr??''));if(result.error||result.status!==0)throw Error(`${cwd}: npm ${args.join(' ')} failed (${result.status}): ${result.error?.message??result.stdout+result.stderr}`);return result.stdout;}
function copy(from,to){mkdirSync(to,{recursive:true});for(const entry of readdirSync(from,{withFileTypes:true})){if(['node_modules','dist','.angular'].includes(entry.name))continue;const source=join(from,entry.name),target=join(to,entry.name);if(entry.isDirectory())copy(source,target);else copyFileSync(source,target);}}
export async function checkAngular({root=toolRoot,tarball,workRoot,consumerNames=['19','base','charts','legacy']}={}){
 assert.ok(consumerNames.length && consumerNames.every(name=>['19','base','charts','legacy'].includes(name)), 'Unknown Angular consumer');
 validateConsumerInputs(root);
 const parent=resolve(workRoot??tmpdir());mkdirSync(parent,{recursive:true});const work=mkdtempSync(join(parent,'aurora-angular-'));const servers=[];
 const close=async()=>{for(const served of servers){served.server.closeAllConnections();await new Promise(r=>served.server.close(r));}const rel=relative(parent,resolve(work));if(rel==='..'||rel.startsWith('..')||isAbsolute(rel)||!rel.startsWith('aurora-angular-'))throw Error('Unsafe Angular consumer cleanup');rmSync(work,{recursive:true,force:true});};
 try{
  const logRoot=join(root,'.tmp/migration/angular');mkdirSync(logRoot,{recursive:true});
  if(!tarball){const packed=JSON.parse(npm(['pack','--json','--ignore-scripts','--pack-destination',work],join(root,'.tmp/package')))[0];tarball=join(work,packed.filename);}
  const result={close,work};
  for(const name of consumerNames){
   const consumer=join(work,name);copy(join(root,'ng-ui-kit/tests/consumers/angular-'+name),consumer);
   if(name==='19'||name==='base'){
    for(const file of ['button-demo.ts','button-example.ts','icon-demo.ts','icon-demo.html','fab-demo.ts','checkbox-demo.ts','spinner-demo.ts','spinner-demo.html']){
     copyFileSync(join(root,'ng-ui-kit/tests/consumers/shared',file),join(consumer,'src',file));
    }
   }
   npm(['ci','--offline','--no-audit','--no-fund'],consumer,join(logRoot,name+'-install.log'));
   npm(['install','--offline','--ignore-scripts','--no-audit','--no-fund',resolve(tarball)],consumer,join(logRoot,name+'-package.log'));
   assert.equal(realpathSync(join(consumer,'node_modules/@primasoftllc/design-system')),join(realpathSync(consumer),'node_modules/@primasoftllc/design-system'),'installed package must be a real tarball directory, not a source link');
   if(name==='base'||name==='19'){const req=createRequire(join(consumer,'package.json'));assert.throws(()=>req.resolve('echarts'),{code:'MODULE_NOT_FOUND'});assert.equal(JSON.parse(readFileSync(join(consumer,'tsconfig.json'))).compilerOptions.paths,undefined);}
   npm(['run','build'],consumer,join(logRoot,name+'-build.log'));
   const served=await serveRoot(join(consumer,'dist/browser'));servers.push(served);result[name+'Url']=served.url;result[name+'Root']=consumer;
   console.log(`angular-consumer: ${name} offline tarball install and optimized AOT build passed`);
  }
  return result;
 }catch(error){await close();throw error;}
}
export async function assertConsumers(page,consumers){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.route('**/*',route=>{const url=route.request().url();if([consumers['19Url'],consumers.baseUrl,consumers.chartsUrl,consumers.legacyUrl].some(origin=>url.startsWith(origin+'/'))||/^(data:|blob:)/.test(url))return route.continue();errors.push('external request: '+url);return route.abort();});
 for(const url of [consumers['19Url'],consumers.baseUrl]){
 await page.goto(url+'/index.html');await page.waitForSelector('app-root[data-ready]');assert.equal(await page.locator('body').getAttribute('data-ds-theme'),'RED2');assert.equal(await page.locator('#theme-toggle').locator('..').getAttribute('data-ds-density'),'compact');
 await page.locator('#theme-toggle').click();await page.waitForFunction(()=>document.body.getAttribute('data-ds-appearance')==='dark');
 await page.evaluate(()=>{localStorage.setItem('ds-appearance','dark');localStorage.setItem('ds-density','compact');});await page.reload();await page.waitForSelector('app-root[data-ready]');assert.equal(await page.locator('body').getAttribute('data-ds-appearance'),'dark');assert.equal(await page.locator('body').getAttribute('data-ds-density'),'compact');
 await assertAngularButton(page,url);
 await assertAngularIcon(page,url);
 await assertAngularFab(page,url);
 await assertAngularCheckbox(page,url);
 await assertAngularSpinner(page,url);
 }
 await page.goto(consumers.legacyUrl+'/index.html');await page.waitForFunction(()=>window.legacyCheck);assert.deepEqual(await page.evaluate(()=>[window.legacyCheck.sameService,window.legacyCheck.sameConfig,window.legacyCheck.sameInstance,window.legacyCheck.chart,window.legacyCheck.watch]),[true,true,true,true,true]);
 await page.goto(consumers.chartsUrl+'/index.html');await page.waitForFunction(()=>window.auroraCheck);assert.equal(await page.evaluate(()=>window.auroraCheck.sameTheme),true);const before=await page.evaluate(()=>window.auroraCheck.read.fg);
 await page.locator('#panel').evaluate(el=>{el.setAttribute('data-ds-theme','RED2');el.setAttribute('data-ds-appearance','light');});await page.waitForFunction(before=>window.auroraCheck.read.fg!==before,before);assert.equal(await page.locator('canvas').count(),1);
 const stopped=await page.evaluate(()=>{window.auroraCheck.stop();const n=window.auroraCheck.callbacks;document.getElementById('panel').setAttribute('data-ds-appearance','dark');return n;});await page.evaluate(()=>new Promise(r=>setTimeout(r,30)));assert.equal(await page.evaluate(()=>window.auroraCheck.callbacks),stopped);
 await page.goto(consumers.chartsUrl+'/global.html');await page.waitForFunction(()=>window.globalCheck);assert.equal(await page.evaluate(()=>window.globalCheck.registered),true);assert.ok(await page.evaluate(()=>window.globalCheck.option.color.length>0&&window.globalCheck.read.fg));assert.deepEqual(errors,[]);
}
// Exercise the public icon contract in both independently compiled Angular consumers.
export async function assertAngularIcon(page, url) {
  await page.goto(url + '/index.html');
  await page.locator('#icon-consumer').waitFor();
  await page.evaluate(() => document.fonts.ready);
  const sizes = page.locator('#icon-sizes ds-icon');
  const readSizes = () =>
    sizes.evaluateAll((icons) =>
      icons.map((icon) => ({
        width: getComputedStyle(icon).width,
        height: getComputedStyle(icon).height,
        font: getComputedStyle(icon.querySelector('span')).fontSize,
      })),
    );
  assert.deepEqual(
    await readSizes(),
    [14, 16, 20, 24].map((n) => ({ width: n + 'px', height: n + 'px', font: n + 'px' })),
  );
  const icon = page.locator('#icon-dynamic');
  assert.equal(await icon.getAttribute('aria-hidden'), 'true');
  assert.equal(await icon.getAttribute('role'), null);
  assert.equal(await icon.getAttribute('tabindex'), null);
  await page.locator('#icon-focus-before').focus();
  await page.keyboard.press('Tab');
  assert.equal(
    await page.locator('#icon-focus-after').evaluate((el) => el === document.activeElement),
    true,
  );
  assert.equal(
    await icon.evaluate((el) => getComputedStyle(el).color),
    await page.locator('#icon-ink').evaluate((el) => getComputedStyle(el).color),
  );
  const glyph = icon.locator('span');
  assert.match(
    await glyph.evaluate((el) => getComputedStyle(el).fontFamily),
    /Material Symbols Outlined/,
  );
  assert.match(
    await glyph.evaluate((el) => getComputedStyle(el).fontVariationSettings),
    /["']wght["']\s+400/,
    'icon weight is fixed by the design system',
  );
  assert.equal(
    await page.evaluate(() =>
      Array.from(document.fonts).some(
        (face) => face.family.includes('Material Symbols Outlined') && face.status === 'loaded',
      ),
    ),
    true,
    'icon font must be shipped and loaded locally',
  );
  assert.equal(await glyph.getAttribute('aria-hidden'), 'true');
  await page.locator('#icon-update').click();
  await page.waitForFunction(
    () =>
      document.getElementById('icon-dynamic').getAttribute('aria-label') === 'Направление: восток',
  );
  assert.equal(await icon.getAttribute('role'), 'img');
  assert.equal(await icon.getAttribute('aria-hidden'), null);
  assert.equal(await glyph.textContent(), 'navigation');
  assert.equal(await icon.evaluate((el) => getComputedStyle(el).width), '24px');
  assert.equal(
    await icon.evaluate((el) => getComputedStyle(el).transform),
    'matrix(0, 1, -1, 0, 0, 0)',
  );
  await page.locator('#icon-blank-label').click();
  await page.waitForFunction(
    () => document.getElementById('icon-dynamic').getAttribute('aria-hidden') === 'true',
  );
  assert.equal(await icon.getAttribute('aria-label'), null);
  assert.equal(await icon.getAttribute('role'), null);
  await page.locator('#icon-update').click();
  await page.waitForFunction(
    () => document.getElementById('icon-dynamic').getAttribute('role') === 'img',
  );
  await page.locator('#icon-clear-label').click();
  await page.waitForFunction(
    () => document.getElementById('icon-dynamic').getAttribute('aria-hidden') === 'true',
  );
  await page.locator('#icon-compact').click();
  await page.waitForFunction(
    () => document.getElementById('icon-consumer').getAttribute('data-ds-density') === 'compact',
  );
  assert.deepEqual(
    await readSizes(),
    [12, 14, 18, 20].map((n) => ({ width: n + 'px', height: n + 'px', font: n + 'px' })),
  );
  await page.locator('#icon-red-light').click();
  await page.waitForFunction(
    () => document.getElementById('icon-consumer').getAttribute('data-ds-density') === 'cozy',
  );
  assert.deepEqual(
    await readSizes(),
    [14, 16, 20, 24].map((n) => ({ width: n + 'px', height: n + 'px', font: n + 'px' })),
  );
  const before = await icon.evaluate((el) => getComputedStyle(el).color);
  await page.locator('#icon-dark').click();
  await page.waitForFunction(
    (before) => getComputedStyle(document.getElementById('icon-dynamic')).color !== before,
    before,
  );
  assert.equal(
    await icon.evaluate((el) => getComputedStyle(el).color),
    await page.locator('#icon-ink').evaluate((el) => getComputedStyle(el).color),
  );
  assert.deepEqual(
    await readSizes(),
    [12, 14, 18, 20].map((n) => ({ width: n + 'px', height: n + 'px', font: n + 'px' })),
  );
  await page.locator('#icon-unknown').click();
  await page.waitForFunction(
    () => document.querySelector('#icon-dynamic span').textContent === '__aurora_missing_symbol__',
  );
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const consumers=await checkAngular({tarball:process.argv[2]});let browser;
 try{browser=await chromium.launch();const context=await browser.newContext();const page=await context.newPage();await assertConsumers(page,consumers);console.log('angular-consumer: bootstrap, scopes, persisted settings, identities, chart updates, unsubscribe and global bridge passed');}finally{if(browser)await browser.close();await consumers.close();}
}

export async function assertAngularFab(page, url) {
  await page.goto(url + '/index.html');
  const fab = page.locator('#fab-action');
  await expect(fab).toHaveAccessibleName('Добавить объект');
  assert.equal(await fab.evaluate(el => el.getBoundingClientRect().width), 48);
  assert.equal(await fab.evaluate(el => el.getBoundingClientRect().height), 48);
  await fab.focus();
  const tip = fab.locator('[role="tooltip"]');
  await expect(tip).toBeVisible();
  await expect(fab).toHaveAttribute('aria-describedby', /fab-description ds-fab-tooltip-/);
  await page.keyboard.press('Escape');
  await expect(tip).toBeHidden();
  await expect(fab).toHaveAttribute('aria-describedby', 'fab-description');
  await page.keyboard.press('Space');
  await expect(page.locator('#fab-count')).toHaveText('1');
  await page.locator('#fab-size').click();
  assert.equal(await fab.evaluate(el => el.getBoundingClientRect().width), 40);
  await page.locator('#fab-size').click();
  assert.equal(await fab.evaluate(el => el.getBoundingClientRect().width), 56);
  await page.locator('#fab-extended').click();
  await expect(fab.locator('[data-ds-fab-label]')).toHaveText('Добавить объект');
  await fab.focus();
  await expect(tip).toBeHidden();
  await page.locator('#fab-loading').click();
  await expect(fab).toHaveAttribute('aria-busy', 'true');
  await expect(fab.locator('ds-spinner [data-ds-spinner-ring]')).toBeVisible();
  await expect(fab.locator('[data-ds-fab-spinner]')).toHaveAttribute('aria-hidden', 'true');
  assert.equal(await fab.evaluate(el => el.disabled), false);
  const spinner = fab.locator('ds-spinner');
  assert.equal(await spinner.evaluate(el => getComputedStyle(el).color),
    await fab.evaluate(el => getComputedStyle(el).color));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await spinner.locator('[data-ds-spinner-ring]')
    .evaluate(el => getComputedStyle(el).animationName), 'ds-spin');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await fab.evaluate(el => el.click());
  await expect(page.locator('#fab-count')).toHaveText('1');
  await page.locator('#fab-loading').click();
  await page.locator('#fab-disabled').click();
  await expect(fab).toBeDisabled();
  await fab.evaluate(el => el.click());
  await expect(page.locator('#fab-count')).toHaveText('1');
}

export async function assertAngularCheckbox(page, url) {
  await page.goto(url + '/index.html');
  const direct = page.locator('#checkbox-direct input');
  await expect(direct).toHaveAccessibleName('Отправка команд');
  await expect(direct).toHaveAccessibleDescription('Разрешить команды выбранным объектам');
  await expect(direct).toHaveAttribute('aria-checked', 'mixed');
  await page.locator('#checkbox-direct .description').click();
  await expect(direct).toBeChecked();
  await expect(direct).not.toHaveAttribute('aria-checked', 'mixed');
  await expect(page.locator('#checkbox-events')).toHaveText('1');
  await direct.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#checkbox-events')).toHaveText('1');
  await page.keyboard.press('Space');
  await expect(direct).not.toBeChecked();
  await page.locator('#checkbox-mixed').click();
  await expect(direct).toHaveAttribute('aria-checked', 'mixed');
  await page.keyboard.press('Tab');
  const control = page.locator('#checkbox-form input');
  await page.locator('#checkbox-set').click();
  await expect(control).toBeChecked();
  await expect(page.locator('#checkbox-form-events')).toHaveText('0');
  await control.uncheck();
  await control.check();
  await expect(page.locator('#checkbox-form-events')).toHaveText('2');
  await expect(page.locator('#checkbox-events')).toHaveText('2');
  await control.focus();
  await page.locator('#checkbox-set').focus();
  await expect(page.locator('#checkbox-form-value')).toHaveText('true / true');
  await page.locator('#checkbox-disable').click();
  await expect(control).toBeDisabled();
  await page.locator('#checkbox-reset').click();
  await expect(control).not.toBeChecked();
  await expect(control).toBeEnabled();
  await expect(page.locator('#checkbox-form-value')).toHaveText('false / false');
  await expect(page.locator('#checkbox-form-events')).toHaveText('2');
  // Cover the other mixed combination: checked=true must still become selected, not unchecked.
  await direct.click();
  await expect(direct).toBeChecked();
  await page.locator('#checkbox-mixed').click();
  await expect(direct).toBeChecked();
  await expect(direct).toHaveAttribute('aria-checked', 'mixed');
  await direct.click();
  await expect(direct).toBeChecked();
  await expect(direct).not.toHaveAttribute('aria-checked', 'mixed');
  await expect(page.locator('#checkbox-events')).toHaveText('4');
  const mark = page.locator('#checkbox-direct .mark');
  assert.equal(await mark.evaluate(el => el.getBoundingClientRect().width), 18);
  assert.equal(await page.locator('#checkbox-compact .hit').evaluate(el => el.getBoundingClientRect().height), 24);
  await expect(page.locator('#checkbox-disabled input')).toBeDisabled();
}

export async function assertAngularSpinner(page, url) {
  await page.goto(url + '/index.html');
  const spinner = page.locator('#spinner-main');
  await expect(spinner).toHaveRole('status');
  await expect(spinner).toHaveAccessibleName('Загрузка отчёта');
  const size = () =>
    spinner.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return [rect.width, rect.height];
    });
  assert.deepEqual(await size(), [20, 20]);
  await expect(spinner.locator('[data-ds-spinner-label]')).toHaveText('Загрузка отчёта');
  await page.locator('#spinner-focus-before').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#spinner-focus-after')).toBeFocused();
  await page.locator('#spinner-size').click();
  assert.deepEqual(await size(), [48, 48]);
  assert.equal(
    await spinner
      .locator('[data-ds-spinner-ring]')
      .evaluate((el) => getComputedStyle(el).borderRightWidth),
    '5px',
  );
  await page.locator('#spinner-invalid-size').click();
  assert.deepEqual(await size(), [20, 20]);
  await page.locator('#spinner-tone').click();
  assert.equal(
    await spinner.evaluate((el) => getComputedStyle(el).color),
    await spinner.evaluate((el) => {
      const probe = el.ownerDocument.createElement('span');
      probe.style.color = 'var(--ds-fg-muted)';
      el.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    }),
  );
  assert.equal(
    await page.locator('#spinner-inverse').evaluate((el) => getComputedStyle(el).color),
    await page.locator('#spinner-inverse-parent').evaluate((el) => getComputedStyle(el).color),
  );
  await page.locator('#spinner-label').click();
  await expect(spinner).toHaveAccessibleName('Обновление отчёта');
  await page.locator('#spinner-show').click();
  const delayed = page.locator('#spinner-delayed');
  await expect(delayed).not.toHaveAttribute('role', 'status');
  await expect(delayed.locator('[data-ds-spinner-ring]')).toHaveCount(0);
  const before = await delayed.boundingBox();
  assert.equal(before.width, 48);
  assert.equal(before.height, 48);
  await expect(delayed).toHaveRole('status');
  const after = await delayed.boundingBox();
  assert.equal(after.width, before.width);
  assert.equal(after.height, before.height);
  await page.locator('#spinner-delay-restart').click();
  await expect(delayed.locator('[data-ds-spinner-ring]')).toHaveCount(0);
  await page.locator('#spinner-delay-zero').click();
  await expect(delayed).toHaveRole('status');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(
    await spinner
      .locator('[data-ds-spinner-intro]')
      .evaluate((el) => getComputedStyle(el).animationName),
    'none',
  );
  assert.equal(
    await spinner
      .locator('[data-ds-spinner-ring]')
      .evaluate((el) => getComputedStyle(el).animationName),
    'ds-spin',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('#spinner-delay-restart').click();
  await page.locator('#spinner-show').click();
  await expect(delayed).toHaveCount(0);
}
