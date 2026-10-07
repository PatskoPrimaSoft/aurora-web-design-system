export const families=[
 {id:'selection',title:'Выбор',cards:['DsCheckbox'],aliases:['selection','checkbox','чекбокс']},
 {id:'charts',title:'Графики',cards:['DsCharts','DsChart','DsChartLegend','DsChartTooltip','DsSparkline','DsScoreBar'],aliases:['chart','график']},
 {id:'header',title:'Шапка',cards:['DsAppHeader','DsUserMenu'],aliases:['header','навигация']},
];
export const familyFor=id=>families.find(family=>family.cards.includes(id))??null;
