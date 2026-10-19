import ts from 'typescript';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const typeRoots=[fileURLToPath(new URL('../../node_modules/@types',import.meta.url))];
const slash=path=>path.replaceAll('\\','/');
const exported=node=>node.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword);
const readSource=path=>ts.createSourceFile(path,readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true,path.endsWith('.jsx')?ts.ScriptKind.JSX:ts.ScriptKind.JS);
function implementations(root){
 const result=new Map(),seen=new Set();
 const visit=(path,names=null)=>{
  const key=path+JSON.stringify(names);if(seen.has(key))return;seen.add(key);
  const source=readSource(path);
  const register=(local,node,isExport)=>{
   const publicNames=names?names.filter(n=>n.local===local).map(n=>n.name):isExport?[local]:[];
   for(const name of publicNames.filter(name=>name.startsWith('Ds'))){
    if(result.has(name))throw Error(`${path}: duplicate public component ${name}`);
    result.set(name,{node,source,path});
   }
  };
  for(const statement of source.statements){
   if(ts.isExportDeclaration(statement)&&statement.moduleSpecifier){
    const target=join(dirname(path),statement.moduleSpecifier.text);
    if(!existsSync(target))throw Error(`${slash(relative(root,path))}: missing export ${statement.moduleSpecifier.text}`);
    const selected=statement.exportClause&&ts.isNamedExports(statement.exportClause)?statement.exportClause.elements.map(e=>({local:e.propertyName?.text??e.name.text,name:e.name.text})):null;
    const next=names?(selected?selected.flatMap(item=>names.filter(outer=>outer.local===item.name).map(outer=>({local:item.local,name:outer.name}))):names):selected;
    visit(target,next);continue;
   }
   if(ts.isFunctionDeclaration(statement)&&statement.name)register(statement.name.text,statement,exported(statement));
   if(ts.isVariableStatement(statement))for(const declaration of statement.declarationList.declarations){
    const init=declaration.initializer;
    const wrapped=init&&ts.isCallExpression(init)&&ts.isPropertyAccessExpression(init.expression)&&init.expression.expression.getText(source)==='React'&&init.expression.name.text==='forwardRef'?init.arguments[0]:null;
    const implementation=wrapped??init;
    if(ts.isIdentifier(declaration.name)&&implementation&&(ts.isArrowFunction(implementation)||ts.isFunctionExpression(implementation)))register(declaration.name.text,implementation,exported(statement));
   }
  }
 };
 visit(join(root,'components/src/index.js'));
 return result;
}
function declarationFiles(root){
 const result=[];
 const visit=path=>{for(const entry of readdirSync(path,{withFileTypes:true})){if(['src','lib','node_modules'].includes(entry.name))continue;const file=join(path,entry.name);if(entry.isDirectory())visit(file);else if(file.endsWith('.d.ts'))result.push(file);}};
 visit(join(root,'components'));return result;
}
function literal(node){
 return ts.isStringLiteral(node)||ts.isNumericLiteral(node)||[ts.SyntaxKind.TrueKeyword,ts.SyntaxKind.FalseKeyword,ts.SyntaxKind.NullKeyword].includes(node.kind)
  ||(ts.isPrefixUnaryExpression(node)&&ts.isNumericLiteral(node.operand))
  ||(ts.isArrayLiteralExpression(node)&&node.elements.every(literal))
  ||(ts.isObjectLiteralExpression(node)&&node.properties.every(p=>ts.isPropertyAssignment(p)&&(!ts.isComputedPropertyName(p.name)||literal(p.name.expression))&&literal(p.initializer)));
}
function validateDefaults({root,files,program,options,defaults}){
 if(!defaults.length)return;
 const path=slash(join(root,'__aurora_api_defaults__.ts')),ranges=[];let text='';
 for(const[index,entry]of defaults.entries()){
  const module='./'+slash(relative(root,entry.path)).replace(/\.d\.ts$/,'');
  text+=`import type {${entry.name} as Component${index}} from ${JSON.stringify(module)};\n`;
  const start=text.length;
  text+=`const value${index}: Parameters<typeof Component${index}>[0][${JSON.stringify(entry.prop)}] = ${entry.value};\n`;
  ranges.push({start,end:text.length,entry});
 }
 const host=ts.createCompilerHost(options),read=host.readFile.bind(host),exists=host.fileExists.bind(host),source=host.getSourceFile.bind(host);
 host.readFile=file=>file===path?text:read(file);host.fileExists=file=>file===path||exists(file);
 host.getSourceFile=(file,language,onError,newFile)=>file===path?ts.createSourceFile(file,text,language,true):source(file,language,onError,newFile);
 const checked=ts.createProgram([...files,path],options,host,program);
 const errors=ts.getPreEmitDiagnostics(checked);
 if(errors.length)throw Error(errors.map(d=>{
  const entry=d.file?.fileName===path?ranges.find(r=>d.start>=r.start&&d.start<r.end)?.entry:null;
  return `${entry?entry.name+'.'+entry.prop+': default incompatible with prop type':slash(d.file?.fileName??root)}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`;
 }).join('\n'));
}
function forwarded(node,source,path,seen=new Set()){
 const parameter=node.parameters[0];if(!parameter||!ts.isObjectBindingPattern(parameter.name))return false;
 const rest=parameter.name.elements.find(e=>e.dotDotDotToken)?.name.text;if(!rest)return false;
 const aliases=new Set(),attributes=new Set([rest]);
 const walkAlias=n=>{
  if(ts.isVariableDeclaration(n)&&n.initializer){
   if(ts.isCallExpression(n.initializer)&&ts.isIdentifier(n.initializer.expression)&&n.initializer.expression.text==='usePress'&&n.initializer.arguments.some(a=>ts.isIdentifier(a)&&a.text===rest)){
    if(ts.isIdentifier(n.name))aliases.add(n.name.text);
    if(ts.isObjectBindingPattern(n.name))for(const binding of n.name.elements)if((binding.propertyName?.text??binding.name.text)==='rest'&&ts.isIdentifier(binding.name))attributes.add(binding.name.text);
   }
   if(ts.isIdentifier(n.name)&&ts.isObjectLiteralExpression(n.initializer)&&n.initializer.properties.some(p=>ts.isSpreadAssignment(p)&&ts.isIdentifier(p.expression)&&attributes.has(p.expression.text)))attributes.add(n.name.text);
  }
  ts.forEachChild(n,walkAlias);
 };
 ts.forEachChild(node,walkAlias);
 const throughWrapper=name=>{
  for(const statement of source.statements){
   if(!ts.isImportDeclaration(statement)||!statement.moduleSpecifier.text.startsWith('.'))continue;
   const imports=statement.importClause?.namedBindings;
   if(!imports||!ts.isNamedImports(imports))continue;
   const imported=imports.elements.find(item=>item.name.text===name);if(!imported)continue;
   const target=join(dirname(path),statement.moduleSpecifier.text),exportName=imported.propertyName?.text??name,key=target+':'+exportName;
   if(seen.has(key)||!existsSync(target))return false;
   const nextSeen=new Set(seen);nextSeen.add(key);const nextSource=readSource(target);
   for(const item of nextSource.statements){
    if(!exported(item))continue;
    if(ts.isFunctionDeclaration(item)&&item.name?.text===exportName)return forwarded(item,nextSource,target,nextSeen);
    if(ts.isVariableStatement(item))for(const declaration of item.declarationList.declarations){
     if(declaration.name.getText(nextSource)!==exportName)continue;
     const init=declaration.initializer;
     const wrapped=init&&ts.isCallExpression(init)&&ts.isPropertyAccessExpression(init.expression)&&init.expression.expression.getText(nextSource)==='React'&&init.expression.name.text==='forwardRef'?init.arguments[0]:init;
     if(wrapped&&(ts.isFunctionExpression(wrapped)||ts.isArrowFunction(wrapped)))return forwarded(wrapped,nextSource,target,nextSeen);
    }
   }
  }
  return false;
 };
 let found=false;
 const visit=n=>{
  if((ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n))&&ts.isIdentifier(n.tagName)&&(/^[a-z]/.test(n.tagName.text)||throughWrapper(n.tagName.text))){
   for(const attribute of n.attributes.properties)if(ts.isJsxSpreadAttribute(attribute)){
    const expr=attribute.expression;
    if(ts.isIdentifier(expr)&&attributes.has(expr.text))found=true;
    if(ts.isPropertyAccessExpression(expr)&&ts.isIdentifier(expr.expression)&&aliases.has(expr.expression.text)&&expr.name.text==='rest')found=true;
   }
  }
  ts.forEachChild(n,visit);
 };
 visit(node);return found;
}
export function extractApi({root}){
 const files=declarationFiles(root),options={target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,strict:true,types:['react'],typeRoots,skipLibCheck:false,noEmit:true},program=ts.createProgram(files,options),defaults=[];
 const diagnostics=ts.getPreEmitDiagnostics(program);
 if(diagnostics.length)throw Error(diagnostics.map(d=>`${slash(d.file?.fileName??root)}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`).join('\n'));
 const checker=program.getTypeChecker(),contracts=new Map();
 for(const path of files){const source=program.getSourceFile(path);for(const statement of source.statements){
  if(!exported(statement))continue;
  const nodes=ts.isFunctionDeclaration(statement)?[statement]:ts.isVariableStatement(statement)?statement.declarationList.declarations:[];
  for(const node of nodes){
   const signature=checker.getTypeAtLocation(node).getCallSignatures()[0];
   if(!signature||!node.name||!ts.isIdentifier(node.name))continue;
   if(contracts.has(node.name.text))throw Error(`${path}: duplicate declaration ${node.name.text}`);
   const parameter=signature.parameters[0];
   contracts.set(node.name.text,{node,path,parameterType:parameter?checker.getTypeOfSymbolAtLocation(parameter,node):null});
  }
 }}
 const publicFunctions=implementations(root),docs=[];
 for(const[name,implementation]of publicFunctions){
  const contract=contracts.get(name);if(!contract)throw Error(`${slash(relative(root,implementation.path))}: ${name}: missing declaration`);
  const parameter=implementation.node.parameters[0];
  if(!parameter||!ts.isObjectBindingPattern(parameter.name)||!contract.parameterType)throw Error(`${name}: unsupported props signature`);
  const bindings=new Map(parameter.name.elements.filter(e=>!e.dotDotDotToken).map(e=>[e.propertyName?.text??e.name.text,e]));
  const refParameter=implementation.node.parameters[1];
  if(refParameter&&ts.isIdentifier(refParameter.name)&&refParameter.name.text==='ref')bindings.set('ref',refParameter);
  const properties=checker.getPropertiesOfType(contract.parameterType);
  const declared=new Set(properties.map(p=>p.name));
  for(const nameOfProp of bindings.keys())if(!declared.has(nameOfProp))throw Error(`${slash(relative(root,contract.path))}: ${name}.${nameOfProp}: missing prop declaration`);
  const forwarding=forwarded(implementation.node,implementation.source,implementation.path);
  const props=properties.map(symbol=>{
   const binding=bindings.get(symbol.name),declaration=symbol.valueDeclaration??symbol.declarations?.[0];
   const native=slash(declaration?.getSourceFile().fileName??'').includes('/@types/react/');
   if(!binding&&!(forwarding&&native))throw Error(`${slash(relative(root,contract.path))}: ${name}.${symbol.name}: documented prop is absent from implementation`);
   const defaultValue=binding?.initializer?.getText(implementation.source)??null;
   const defaultTag=symbol.getJsDocTags(checker).find(tag=>tag.name==='default');
   const defaultDescription=defaultTag?ts.displayPartsToString(defaultTag.text??[]):null;
   if(binding?.initializer&&!literal(binding.initializer)&&!defaultDescription)throw Error(`${name}.${symbol.name}: computed default requires @default explanation`);
   if(binding?.initializer&&literal(binding.initializer)&&defaultDescription){
    const annotation=ts.createSourceFile('default.ts',`const value=${defaultDescription}`,ts.ScriptTarget.Latest,true).statements[0]?.declarationList?.declarations[0]?.initializer;
    if(annotation&&literal(annotation)&&annotation.getText().replaceAll('"',"'")!==defaultValue.replaceAll('"',"'"))throw Error(`${name}.${symbol.name}: @default differs from implementation`);
   }
   if(binding?.initializer&&literal(binding.initializer))defaults.push({name,prop:symbol.name,value:defaultValue,path:contract.path});
   const resolved=checker.getTypeOfSymbolAtLocation(symbol,contract.node),nonNullable=checker.getNonNullableType(resolved);
   const constraint=nonNullable.isTypeParameter()?checker.getBaseConstraintOfType(nonNullable):null;
   const type=constraint?checker.typeToString(constraint,undefined,ts.TypeFormatFlags.NoTruncation|ts.TypeFormatFlags.InTypeAlias):native&&binding?checker.typeToString(resolved,undefined,ts.TypeFormatFlags.NoTruncation):declaration?.type?ts.createPrinter().printNode(ts.EmitHint.Unspecified,declaration.type,declaration.getSourceFile()):checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol,contract.node),undefined,ts.TypeFormatFlags.NoTruncation);
   return{name:symbol.name,type,required:!(symbol.flags&ts.SymbolFlags.Optional),description:ts.displayPartsToString(symbol.getDocumentationComment(checker)),defaultValue,defaultDescription,forwarded:!binding};
  });
  docs.push({name,sourcePath:slash(relative(root,implementation.path)),declarationPath:slash(relative(root,contract.path)),description:ts.displayPartsToString(checker.getSymbolAtLocation(contract.node.name).getDocumentationComment(checker)),props,forwardsNativeAttributes:forwarding});
 }
 for(const[name,contract]of contracts)if(name.startsWith('Ds')&&!publicFunctions.has(name))throw Error(`${slash(relative(root,contract.path))}: documented component ${name} is not exported`);
 validateDefaults({root,files,program,options,defaults});
 return docs.sort((a,b)=>a.name.localeCompare(b.name));
}
