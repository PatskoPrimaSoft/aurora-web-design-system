export const families=[
 {id:'selection',title:'Выбор',cards:['DsCheckbox'],aliases:['selection','checkbox','чекбокс']},
 {id:'charts',title:'Графики',cards:['DsCharts','DsChart','DsChartLegend','DsChartTooltip','DsSparkline','DsScoreBar'],aliases:['chart','график']},
 {id:'header',title:'Шапка',cards:['DsAppHeader','DsUserMenu'],aliases:['header','навигация']},
];
export const familyFor=id=>families.find(family=>family.cards.includes(id))??null;

export const foundationSections = [
  { title: 'Визуальный язык', cards: ['DsType', 'DsNeutrals', 'DsShape', 'DsStatus'] },
  { title: 'Режимы интерфейса', cards: ['DsBrandThemes', 'DsAppearance', 'DsDensity'] },
  { title: 'Состояния контролов', cards: ['DsHover', 'DsFocus'] },
  { title: 'Компоновка и данные', cards: ['DsBreakpoints', 'DsSorting', 'DsSortingMenu', 'DsCharts'] },
  { title: 'Настройка бренда', cards: ['DsBrandPick'] },
];

export const foundationSectionFor = card => card.group === '2 · Основы'
  ? foundationSections.find(section => section.cards.includes(card.id)) ?? null
  : null;
