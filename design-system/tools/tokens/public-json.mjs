export function publicTokens(source) {
  const result = structuredClone(source);
  delete result.runtime;
  for (const group of result.type.groups) for (const style of group.styles)
    result.type.families[style.name] = `${style.fontWeight} ${style.fontSize}/${style.lineHeight} ${result.type.families[group.family]}`;
  return result;
}
export const serializePublicTokens = source => JSON.stringify(publicTokens(source), null, 2) + '\n';
