import React from 'react';

/* Строки интерфейса системы. Компоненты не держат текст у себя: берут его из
   словаря через useDsStrings(), а явный проп (label, actionLabel, …) по-прежнему
   побеждает. Приложение подставляет свой язык одним провайдером у корня:
   <DsStringsProvider strings={dsStringsEn}> — или свой частичный словарь поверх
   русского (недостающие ключи берутся из dsStringsRu). Источник переводов для
   Crowdin — dsStringsEn, как у en.json продукта. */

const ruPlural=(n,[one,few,many])=>{const a=Math.abs(n)%100,b=a%10;
  return a>10&&a<20?many:b===1?one:b>=2&&b<=4?few:many};
const enPlural=(n,[one,many])=>n===1?one:many;

export const dsStringsRu={
  close:'Закрыть',remove:'Убрать',removeItem:l=>'Убрать: '+l,clear:'Очистить',clearAll:'Очистить все',
  search:'Поиск',filters:'Фильтры',loading:'Загрузка',back:'Назад',noData:'Нет данных',
  apply:'Применить',undo:'Отменить',
  select:'Выбрать',selectItem:n=>'Выбрать «'+n+'»',selectAllIn:t=>'Выбрать все в «'+t+'»',
  selectAllObjects:'Выбрать все объекты',clearSelection:'Снять выделение',
  expand:t=>'Развернуть «'+t+'»',collapse:t=>'Свернуть «'+t+'»',
  tree:{selected:(selected,total)=>'Выбрано '+selected+' из '+total},
  unread:n=>n+' '+ruPlural(n,['непрочитанное','непрочитанных','непрочитанных']),
  objects:n=>n+' '+ruPlural(n,['объект','объекта','объектов']),
  online:'На связи',
  state:{moving:'Движение',parked:'Стоянка',offline:'Нет связи',invalid:'Некорректные данные',alarm:'Тревога',nodata:'Нет данных'},
  freshness:{live:'Данные в реальном времени',recent:'Данные нескольких минут',late:'Данные нескольких часов',none:'Сообщений не было'},
  signal:{good:'Сигнал хороший',weak:'Слабый сигнал',none:'Нет сигнала'},
  filter:{contains:'Содержит…',from:'От',to:'До',asc:'По возрастанию',desc:'По убыванию'},
  table:{sort:(label,dir)=>label+': сортировать '+(dir==='asc'?'по возрастанию':'по убыванию'),selectPage:'Выбрать все строки на странице',pageSelected:n=>'Выбраны все '+n+' на странице.',
    selectAllResults:n=>'Выбрать все '+n,allSelected:n=>'Выбраны все '+n+' '+ruPlural(n,['результат','результата','результатов'])+'.',
    clearSelection:'Снять выбор'},
  bulk:{toolbar:n=>'Действия для выбранных: '+n,selected:'Выбрано:',allSelected:n=>'Выбраны все '+n,deselectAll:'Снять выбор',selectAll:n=>'Выбрать все '+n},
  pagination:{label:'Пагинация',page:n=>'Страница '+n,rows:'Строк на странице',range:(f,t,l)=>f+'–'+t+' из '+l,first:'Первая страница',prev:'Предыдущая страница',
    next:'Следующая страница',last:'Последняя страница'},
  duration:{days:'Дни',hours:'Часы',minutes:'Минуты',d:'д',h:'ч',m:'м'},
  chart:{zoom:'Зум',data:'Данные',invalid:'Показать / скрыть некорректные данные',settings:'Настройки',reset:'Сбросить',download:'Скачать'},
  score:{label:'Оценка',bad:'Плохо',norm:'Норма',good:'Хорошо',best:'ЛУЧШИЙ'},
  toast:{label:'Уведомления'},
  layout:{skip:'К содержимому',left:'Левая панель',right:'Правая панель'},
  tabs:{nav:'Разделы'},
  stepper:{label:'Этапы задачи',position:(n,total)=>'Шаг '+n+' из '+total,current:'текущий',completed:'завершён',upcoming:'предстоит',disabled:'недоступен'},
};

export const dsStringsEn={
  close:'Close',remove:'Remove',removeItem:l=>'Remove: '+l,clear:'Clear',clearAll:'Clear all',
  search:'Search',filters:'Filters',loading:'Loading',back:'Back',noData:'No data',
  apply:'Apply',undo:'Undo',
  select:'Select',selectItem:n=>'Select “'+n+'”',selectAllIn:t=>'Select all in “'+t+'”',
  selectAllObjects:'Select all objects',clearSelection:'Clear selection',
  expand:t=>'Expand “'+t+'”',collapse:t=>'Collapse “'+t+'”',
  tree:{selected:(selected,total)=>'Selected '+selected+' of '+total},
  unread:n=>n+' unread',
  objects:n=>n+' '+enPlural(n,['object','objects']),
  online:'Online',
  state:{moving:'Moving',parked:'Parked',offline:'No connection',invalid:'Invalid data',alarm:'Alarm',nodata:'No data'},
  freshness:{live:'Data is live',recent:'Data is a few minutes old',late:'Data is hours old',none:'Never reported'},
  signal:{good:'Good signal',weak:'Weak signal',none:'No signal'},
  filter:{contains:'Contains…',from:'From',to:'To',asc:'Ascending',desc:'Descending'},
  table:{sort:(label,dir)=>label+': sort '+(dir==='asc'?'ascending':'descending'),selectPage:'Select all rows on this page',pageSelected:n=>'All '+n+' on this page are selected.',
    selectAllResults:n=>'Select all '+n,allSelected:n=>'All '+n+' '+enPlural(n,['result','results'])+' are selected.',
    clearSelection:'Clear selection'},
  bulk:{toolbar:n=>'Actions for selected: '+n,selected:'Selected:',allSelected:n=>'All '+n+' selected',deselectAll:'Clear selection',selectAll:n=>'Select all '+n},
  pagination:{label:'Pagination',page:n=>'Page '+n,rows:'Rows per page',range:(f,t,l)=>f+'–'+t+' of '+l,first:'First page',prev:'Previous page',next:'Next page',last:'Last page'},
  duration:{days:'Days',hours:'Hours',minutes:'Minutes',d:'d',h:'h',m:'m'},
  chart:{zoom:'Zoom',data:'Data',invalid:'Show / hide invalid data',settings:'Settings',reset:'Reset',download:'Download'},
  score:{label:'Score',bad:'Poor',norm:'Fair',good:'Good',best:'THE BEST'},
  toast:{label:'Notifications'},
  layout:{skip:'Skip to content',left:'Left panel',right:'Right panel'},
  tabs:{nav:'Sections'},
  stepper:{label:'Task steps',position:(n,total)=>'Step '+n+' of '+total,current:'current',completed:'completed',upcoming:'upcoming',disabled:'unavailable'},
};

const DsStringsContext=React.createContext(null);
function dsMergeStrings(base,over){
  if(!over)return base;
  const out={...base};
  for(const k of Object.keys(over)){const v=over[k];
    out[k]=v&&typeof v==='object'&&!Array.isArray(v)&&base[k]&&typeof base[k]==='object'?{...base[k],...v}:v}
  return out;
}
/** Словарь строк для поддерева. Вложенные провайдеры накладываются друг на друга. */
export function DsStringsProvider({strings,children}){
  const parent=React.useContext(DsStringsContext)||dsStringsRu;
  const value=React.useMemo(()=>dsMergeStrings(parent,strings),[parent,strings]);
  return <DsStringsContext.Provider value={value}>{children}</DsStringsContext.Provider>;
}
export function useDsStrings(){return React.useContext(DsStringsContext)||dsStringsRu}
