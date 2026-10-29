import AxeBuilder from '@axe-core/playwright';

export async function pageViolations(page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const remaining = [];
  for (const violation of violations) {
    const nodes = [];
    for (const node of violation.nodes) {
      // Temporary yellow review markers are removed with their placeholders.
      // Ignore only their colour contrast; keep all other accessibility checks.
      const temporaryContrast =
        violation.id === 'color-contrast' &&
        node.target.length === 1 &&
        typeof node.target[0] === 'string' &&
        (await page
          .locator(node.target[0])
          .evaluate((element) =>
            Boolean(element.closest('.migration-placeholder[data-migration-placeholder]')),
          ));
      if (!temporaryContrast) nodes.push(node);
    }
    if (nodes.length)
      remaining.push({ id: violation.id, targets: nodes.map((node) => node.target) });
  }
  return remaining;
}
