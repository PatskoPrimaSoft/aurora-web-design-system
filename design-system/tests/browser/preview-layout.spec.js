import {test,expect} from '@playwright/test';
import {expectPreviewFits} from './helpers/preview-layout.js';

test('preview layout waits for adaptation but rejects persistent overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.setContent('<div style="width:350px"><iframe id="preview" style="border:0;width:700px" srcdoc="<body style=margin:0><div style=width:600px>Content</div></body>"></iframe></div>');
  await expect(page.frameLocator('#preview').locator('body')).toBeVisible();
  await expect(expectPreviewFits(page,{timeout:150})).rejects.toThrow();
  await page.evaluate(()=>{
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const frame=document.querySelector('iframe');frame.style.width='350px';
      frame.contentDocument.querySelector('div').style.width='100%';
    }));
  });
  await expectPreviewFits(page);
  await page.frameLocator('#preview').locator('div').evaluate(node=>node.style.width='600px');
  await expect(expectPreviewFits(page,{timeout:150})).rejects.toThrow();
});
