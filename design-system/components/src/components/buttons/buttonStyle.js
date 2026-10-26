// A consumer's background shorthand replaces the generated ground, including an
// explicit empty/undefined value. Do not leave a generated color to overwrite it.
export function mergeButtonStyle(base,custom){
  if(custom&&Object.prototype.propertyIsEnumerable.call(custom,'background')){base={...base};delete base.backgroundColor;}
  return {...base,...custom};
}
