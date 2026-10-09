import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,readdirSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractApi} from '../tools/docs/api.mjs';
import {renderMarkdown,renderProps,renderComponentProps} from '../tools/docs/markdown.mjs';
import {renderTokenReference} from '../tools/docs/tokens.mjs';
import {readTokenModel} from '../tools/tokens/model.mjs';
const fixture=fileURLToPath(new URL('./fixtures/api/',import.meta.url));
const api=extractApi({root:fixture}),demo=api.find(c=>c.name==='DsDemo');
assert.equal(api.length,3,'helpers must not become components');
assert.equal(api.find(c=>c.name==='DsArrow').props[0].type,'number');
assert.equal(demo.forwardsNativeAttributes,true);
assert.equal(demo.props.find(p=>p.name==='tone').defaultValue,"'primary'");
assert.match(demo.props.find(p=>p.name==='tone').type,/primary.*secondary/s);
assert.equal(demo.props.find(p=>p.name==='children').required,true);
assert.match(demo.props.find(p=>p.name==='children').type,/ReactNode/);
assert.match(demo.props.find(p=>p.name==='onSelect').type,/value: string/);
assert.equal(demo.props.find(p=>p.name==='count').defaultValue,'Math.max(1, DEFAULT_SIZE)');
assert.match(demo.props.find(p=>p.name==='count').defaultDescription,/Минимум/);
function copy(from,to){mkdirSync(to,{recursive:true});for(const entry of readdirSync(from,{withFileTypes:true})){const a=join(from,entry.name),b=join(to,entry.name);if(entry.isDirectory())copy(a,b);else copyFileSync(a,b);}}
for(const [transform,expected] of [
 [s=>s.replace('props: DsDemoProps','props: MissingProps'),/MissingProps/],
 [s=>s.replace('tone?:', 'unsupported?: boolean; tone?:'),/DsDemo.*unsupported/],
 [s=>s.replace('@default Минимум один элемент, значение DEFAULT_SIZE ограничивается снизу.','Описание без объяснения default.'),/DsDemo.*count.*default/],
 [s=>s.replace('/** Цветовой вариант. */',"/** @default 'secondary' */"),/DsDemo.*tone.*default/],
]){
 const root=mkdtempSync(join(tmpdir(),'aurora-api-'));
 try{copy(fixture,root);const path=join(root,'components/Contracts/Contracts.d.ts');writeFileSync(path,transform(readFileSync(path,'utf8')));assert.throws(()=>extractApi({root}),expected);}finally{rmSync(root,{recursive:true,force:true});}
}
const actualRoot=fileURLToPath(new URL('../',import.meta.url)),actual=extractApi({root:actualRoot});
assert.ok(!actual.some(c=>c.name==='DsHeaderChip'));
assert.ok(!actual.find(c=>c.name==='DsAppHeader').props.some(p=>p.name==='user'));
assert.equal(actual.find(c=>c.name==='DsCheckbox').declarationPath,'components/DsCheckbox/DsCheckbox.d.ts');
assert.ok(!actual.some(c=>['DsCheck','DsCheckButton','DsSelectBox'].includes(c.name)));
assert.ok(actual.find(c=>c.name==='DsTabPanel').props.some(p=>p.name==='idBase'));
assert.equal(actual.find(c=>c.name==='DsField').forwardsNativeAttributes,true);
assert.match(actual.find(c=>c.name==='DsField').props.find(p=>p.name==='as').type,/input.*select.*textarea/);
assert.equal(actual.find(c=>c.name==='DsButton').forwardsNativeAttributes,true);
assert.match(renderProps({...demo,description:'<script>alert(1)</script>'}),/&lt;script&gt;/);
const buttonApi=actual.find(c=>c.name==='DsButton');
assert.ok(buttonApi.props.some(p=>p.name==='form'&&p.forwarded),'native form attributes remain in extracted contract');
for(const render of [renderProps,renderComponentProps]){
 const html=render(buttonApi);
 assert.ok(html.includes('<code>loading</code>'),'own button props remain documented');
 assert.ok(!html.includes('<code>form</code>'),'inherited native props do not expand the component table');
 assert.match(html,/native attributes/);
}

const componentProps=renderComponentProps(demo);
assert.match(componentProps,/<h2[^>]*>Параметры<\/h2>/);
assert.match(componentProps,/aria-label="Параметры DsDemo"/);
assert.match(componentProps,/<code>children<\/code>.*Обязательный/s);
assert.ok(!componentProps.includes('Исходник:')&&!componentProps.includes('Default')&&!componentProps.includes('Обязателен</th>'));
assert.match(renderComponentProps({...demo,props:[{...demo.props[0],description:'<script>bad</script>'}]}),/&lt;script&gt;bad&lt;\/script&gt;/);
assert.equal(renderComponentProps({...demo,props:[]}), '');
assert.equal((renderComponentProps({...demo,props:[{...demo.props[0],defaultValue:"'var(--ds-control-h)'",defaultDescription:'var(--ds-control-h)'}]}).match(/var\(--ds-control-h\)/g)??[]).length,1,'default annotation must not repeat its value');
const scratch=mkdtempSync(join(tmpdir(),'aurora-markdown-'));
try{
 writeFileSync(join(scratch,'README.md'),'# Title\n\n<script>alert(1)</script>\n\n[Demo](demo.md#props)\n\n```ts\nconst x = 3;\n```\n\n![Remote](https://example.com/picture.png)');
 const rendered=renderMarkdown({root:scratch,path:'README.md',knownRoutes:new Map([['demo.md','/api/components/DsDemo.html']])});
 assert.ok(!rendered.html.includes('<script>'));assert.ok(!rendered.html.includes('<img'));assert.match(rendered.html,/language-ts/);assert.match(rendered.html,/\/api\/components\/DsDemo.html#props/);assert.match(rendered.text,/const x = 3/);
}finally{rmSync(scratch,{recursive:true,force:true});}
const model=readTokenModel(JSON.parse(readFileSync(join(actualRoot,'tokens/source.json'),'utf8'))),reference=renderTokenReference(model);
assert.equal(reference.entries.length,model.names.length);assert.deepEqual(reference.entries.find(e=>e.name==='--ds-brand').aliases,model.aliases['--ds-brand']);
console.log('docs-api: unions, callbacks, ReactNode, shared files and invalid contracts passed');
