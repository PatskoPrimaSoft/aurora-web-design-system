# Сортировка вне таблицы

## Пример кода

Готовое меню и полностью загруженный список. Выбор применяется целиком;
«Сбросить порядок» возвращает порядок «Дате добавления · Сначала новые».

<details>
<summary>Показать полный код работающего примера</summary>

```jsx
import React from 'react';
import {DsFilterMenu, DsButton, DsListRow} from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';
const OPTIONS=[
  {value:'added',label:'Дате добавления',asc:'Сначала старые',desc:'Сначала новые'},
  {value:'name',label:'Названию',asc:'А → Я',desc:'Я → А'},
  {value:'speed',label:'Скорости',asc:'Сначала меньше',desc:'Сначала больше'}
];
const OBJECTS=[
  {id:1,name:'МАЗ 5440',added:Date.parse('2026-10-11'),speed:62,state:'moving'},
  {id:2,name:'Volvo FH16',added:Date.parse('2026-10-14'),speed:0,state:'parked'},
  {id:3,name:'ГАЗ Next',added:Date.parse('2026-10-12'),speed:41,state:'moving'},
  {id:4,name:'Renault T',added:Date.parse('2026-10-13'),speed:18,state:'moving'}
];
export function ObjectList(){
  const [order,setOrder]=React.useState({key:'added',dir:'desc'});
  const option=OPTIONS.find(item=>item.value===order.key);
  const summary=option.label+' · '+option[order.dir];
  const sorted=[...OBJECTS].sort((a,b)=>{
    const difference=order.key==='name'?a.name.localeCompare(b.name,'ru'):a[order.key]-b[order.key];
    return difference*(order.dir==='asc'?1:-1)||a.id-b.id;
  });
  return <div style={{display:'grid',gap:'var(--ds-gap-md)'}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'var(--ds-gap-sm)',flexWrap:'wrap'}}>
      <h3 style={{margin:0}}>Объекты · {sorted.length}</h3>
      <DsFilterMenu label="Сортировать по" type="sort-by" value={order} options={OPTIONS} width={300}
        onApply={setOrder} onClear={()=>setOrder({key:'added',dir:'desc'})}
        trigger={<DsButton tone="secondary" icon="sort" aria-haspopup="dialog" aria-label={'Сортировка: '+summary}>Сортировка</DsButton>}/>
    </div>
    <p style={{margin:0,font:'var(--ds-type-caption)',color:'var(--ds-fg-muted)'}} role="status">{summary}</p>
    <ul aria-label="Объекты с сортировкой" style={{listStyle:'none',padding:0,margin:0}}>
      {sorted.map(item=><li key={item.id}><DsListRow as="div" title={item.name} subtitle={item.speed+' км/ч · Добавлен '+new Date(item.added).toLocaleDateString('ru-RU',{timeZone:'UTC'})} state={item.state}/></li>)}
    </ul>
  </div>;
}
```

</details>

## Дальше

- [DsFilterMenu](../DsFilterMenu/README.md) — параметры меню и работа с черновиком.
- [Таблица](../DsTable/README.md) — сортировка заголовками столбцов.
- [Плотность интерфейса](../DsDensity/README.md) — размеры строк и отступы.
