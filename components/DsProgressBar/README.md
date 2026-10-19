## Правила применения

- Показывайте прогресс длительной операции: импорт, экспорт, синхронизация. Для короткого ожидания используйте DsSpinner, для места загружаемого содержимого — DsSkeleton.
- label описывает операцию. value и max выражаются в одинаковых единицах; ноль — начало, max — завершение. Компонент ограничивает конечное значение диапазоном 0…max; некорректный max заменяется на 100.
- Без value, с null или неконечным значением показывается неопределённый прогресс без aria-valuenow. Не придумывайте проценты, если сервер не сообщает объём работы.
- valueText уточняет состояние, например «320 из 500 объектов», и доступен скринридеру. Показывайте важное состояние текстом, не только цветом.
- Компонент не является live region: частые обновления процентов не перебивают пользователя. Завершение или ошибку объявляет отдельное сообщение приложения; ошибка не означает 100% прогресса.
- tone="success" используйте после успешного завершения. Полоса не заменяет DsScoreBar для оценки или визуализацию данных.
- При prefers-reduced-motion неопределённая полоса статична. Ширину и внешние отступы задаёт родитель.

## Пример кода

```jsx
import * as React from 'react';
import * as S from '@primasoftllc/design-system';

export function Example(){
const [value,setValue]=React.useState(0),[running,setRunning]=React.useState(false);
React.useEffect(()=>{if(!running)return;const timer=setInterval(()=>setValue(current=>Math.min(500,current+125)),400);return()=>clearInterval(timer);},[running]);
React.useEffect(()=>{if(value===500)setRunning(false);},[value]);
return <div style={{display:'grid',gap:16}}><S.DsProgressBar label="Экспорт объектов" value={value} max={500} valueText={value+' из 500 объектов'} tone={value===500?'success':'primary'}/><S.DsButton disabled={running} onClick={()=>{setValue(0);setRunning(true);}}>Начать экспорт</S.DsButton><p role="status" style={{margin:0}}>{value===500?'Экспорт завершён.':''}</p></div>;
}
```
