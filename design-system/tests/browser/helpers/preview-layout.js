import {expect} from '@playwright/test';

// ResizeObserver and iframe layout settle on different animation frames.
// Poll the geometry; a persistent overflow must still fail the assertion.
export async function expectPreviewFits(page, options = {}) {
  await expect.poll(() => page.locator('#preview').evaluate(frame => {
    const document = frame.contentDocument;
    if (!document?.body) return false;
    const bounds = frame.getBoundingClientRect();
    return bounds.width <= frame.parentElement.clientWidth + 1
      && bounds.right <= window.innerWidth + 1
      && document.defaultView.innerWidth === frame.clientWidth
      && document.body.scrollWidth <= document.body.clientWidth;
  }), options).toBe(true);
}
