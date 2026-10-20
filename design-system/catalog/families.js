export const families=[
 {id:'buttons',title:'Кнопки и иконки',cards:['DsButton','DsIconButton','DsFab','DsIcon'],aliases:['button','кнопка','иконка','примитивы']},
 {id:'selection',title:'Поля и выбор',cards:['DsField','DsSelect','DsCheckbox','DsRadioGroup','DsSwitch','DsDatePicker','DsTimePicker','DsDateTimePicker','DsDateRangePicker','DsDuration'],aliases:['selection','form','формы','checkbox','чекбокс']},
 {id:'navigation',title:'Навигация',cards:['DsAppHeader','DsUserMenu','DsLink','DsBreadcrumbs','DsMenu','DsTabs','DsStepper','DsPagination'],aliases:['header','шапка','navigation']},
 {id:'data',title:'Данные и фильтры',cards:['DsTable','DsListRow','DsTreeRow','DsChip','DsChipGroup','DsFilterMenu','DsBulkActionsBar','DsLozenge','DsStateIcon'],aliases:['data','filter','фильтр','таблица']},
 {id:'layout',title:'Контейнеры и окна',cards:['DsPageLayout','DsPanel','DsDialog','DsPopover'],aliases:['layout','раскладка','диалог','панель']},
 {id:'feedback',title:'Обратная связь',cards:['DsBanner','DsEmptyState','DsSkeleton','DsSpinner','DsProgressBar','DsTooltip','DsToast','DsToastStack'],aliases:['feedback','загрузка','уведомления']},
 {id:'charts',title:'Графики',cards:['DsChart','DsSparkline','DsScoreBar'],aliases:['chart','график']},
];
export const familyFor=id=>families.find(family=>family.cards.includes(id))??null;

export const foundationSections=[
 {title:'Общие правила',cards:['DsAccessibility','DsContent']},
 {title:'Визуальный язык',cards:['DsType','DsNeutrals','DsShape','DsStatus']},
 {title:'Режимы интерфейса',cards:['DsAppearance','DsDensity']},
 {title:'Состояния контролов',cards:['DsHover','DsFocus','DsMotion']},
 {title:'Компоновка и данные',cards:['DsSpacing','DsBreakpoints','DsSortingMenu','DsCharts']},
 {title:'Бренд и темы',cards:['DsBrandThemes','DsBrandPick','BrandLogoLockup']},
];
export const foundationSectionFor=card=>['2 · Основы','4 · Бренд (общее)'].includes(card.group)
 ? foundationSections.find(section=>section.cards.includes(card.id))??null:null;

function sectionsFor(cards,definitions,fallback){
 const known=new Set(definitions.flatMap(section=>section.cards));
 const sections=definitions.map(section=>({title:section.title,items:section.cards.map(id=>cards.find(card=>card.id===id)).filter(Boolean)}));
 sections.push({title:fallback,items:cards.filter(card=>!known.has(card.id))});
 return sections.filter(section=>section.items.length);
}
export function navigationGroups(cards){
 const definitions=[
  {id:'start',title:'Начало',groups:['1 · Начало'],order:['overview']},
  {id:'foundations',title:'Основы',groups:['2 · Основы','4 · Бренд (общее)'],sections:foundationSections,fallback:'Другие основы'},
  {id:'components',title:'Компоненты',prefix:'5 · Компоненты',sections:families,fallback:'Другие компоненты'},
  {id:'map',title:'Карта',groups:['6 · Карта'],order:['IconsMapAssets','IconsArrows','MapTrack']},
  {id:'screens',title:'Примеры экранов',groups:['7 · Эталонные экраны'],order:['AppShell','Monitoring','Admin']},
  {id:'migration',title:'Миграция',groups:['3 · Миграция'],order:['DsBreakpointsDecisions']},
 ];
 const assigned=new Set(),result=[];
 for(const definition of definitions){
  const items=cards.filter(card=>definition.prefix?card.group.startsWith(definition.prefix):definition.groups.includes(card.group));
  items.forEach(card=>assigned.add(card.id));
  const sections=definition.sections?sectionsFor(items,definition.sections,definition.fallback):sectionsFor(items,[{cards:definition.order}],undefined);
  if(items.length)result.push({id:definition.id,title:definition.title,sections});
 }
 for(const card of cards.filter(card=>!assigned.has(card.id))){
  const title=card.group.replace(/^\d+ · /,'');
  let group=result.find(group=>group.id==='extra:'+card.group);
  if(!group){group={id:'extra:'+card.group,title,sections:[{items:[]}]};result.push(group);}
  group.sections[0].items.push(card);
 }
 return result;
}
