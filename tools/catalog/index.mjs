import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function readCards(root) {
  const paths = ['overview.html', ...readdirSync(join(root, 'components'), { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(root, 'components', d.name, 'preview.html')))
    .map(d => `components/${d.name}/preview.html`).sort()];
  const ids = new Set();
  return paths.map(previewPath => {
    const html = readFileSync(join(root, previewPath), 'utf8');
    const raw = /<!--\s*@dsCard\s+([\s\S]*?)-->/.exec(html)?.[1];
    if (!raw) throw new Error(`${previewPath}: missing @dsCard`);
    const attrs = Object.fromEntries([...raw.matchAll(/(\w+)=(?:"([^"]*)"|'([^']*)'|([^\s]+))/g)].map(m => [m[1], m[2] ?? m[3] ?? m[4]]));
    if(attrs.layout&&!['preview','component'].includes(attrs.layout))throw new Error(`${previewPath}: invalid layout ${attrs.layout}`);
    if(attrs.status&&attrs.status!=='deprecated')throw new Error(`${previewPath}: invalid status ${attrs.status}`);
    const id = attrs.id ?? (previewPath === 'overview.html' ? 'overview' : previewPath.split('/')[1]);
    if (!/^[\w-]+$/.test(id) || ids.has(id)) throw new Error(`${previewPath}: invalid or duplicate card id ${id}`);
    ids.add(id);
    const size = attrs.viewport?.match(/^(\d+)x(\d+)$/);
    const viewport = { width: size ? Number(size[1]) : 1180, height: size ? Number(size[2]) : Number(attrs.height ?? 900) };
    if ((attrs.viewport && !size) || !Object.values(viewport).every(n => Number.isInteger(n) && n > 0 && n <= 6000)) throw new Error(`${previewPath}: invalid viewport`);
    const readme = `components/${id}/README.md`;
    return { id, title: attrs.name ?? id, group: attrs.group ?? '1 · Начало', subtitle: (attrs.subtitle ?? '').replaceAll('{{cardCount}}',String(paths.length)), aliases:(attrs.aliases??'').split('|').map(value=>value.trim()).filter(Boolean), previewPath,
      readmePath: existsSync(join(root, readme)) ? readme : null, declarationPaths: [], viewport,
      layout: attrs.layout??'preview', status: attrs.status??null,
      scopeMode: attrs.scopeMode ?? (/data-ds-(?:appearance|theme)=/.test(html) ? 'local' : 'inherit') };
  });
}
