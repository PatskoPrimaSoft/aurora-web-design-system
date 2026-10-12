// Keep component assertions inside the demo, apart from link and code controls.
export function exampleDemo(frame,title){
  return frame.getByRole('region',{name:title,exact:true}).locator('[data-ds-example-demo]');
}
