# Фокус

## Пример кода

Готовая кнопка уже показывает обводку при управлении с клавиатуры. Подключите
стили пакета и передайте обработчик действия.

```jsx
import {DsButton} from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

export function SaveButton({onSave}) {
  return <DsButton onClick={onSave}>Сохранить</DsButton>;
}
```

<details>
<summary>Полный код формы и навигации</summary>

Форма подтверждает сохранение локально. В приложении показывайте результат
после ответа сервера. Вкладки и меню используют встроенное управление с клавиатуры.

```jsx
import React from 'react';
import {DsButton, DsCheckbox, DsField, DsTabs, DsTabPanel, DsMenu} from '@primasoftllc/design-system';
import '@primasoftllc/design-system/styles.css';

function Settings(){
  const [name,setName]=React.useState('МАЗ 5440');
  const [checked,setChecked]=React.useState(false);
  const [message,setMessage]=React.useState('Изменения ещё не сохранены.');
  return <form onSubmit={e=>{e.preventDefault();setMessage('Настройки сохранены.');}} style={{display:'grid',gap:'var(--ds-gap-md)'}}>
    <DsField label="Название объекта" value={name} onChange={e=>setName(e.target.value)}/>
    <DsCheckbox label="Показывать названия" state={checked?'checked':'unchecked'} onChange={next=>setChecked(next==='checked')}/>
    <div style={{display:'flex',flexWrap:'wrap',gap:'var(--ds-gap-sm)'}}>
      <DsButton type="submit">Сохранить</DsButton>
      <DsButton type="button" tone="secondary" onClick={()=>{setName('МАЗ 5440');setChecked(false);setMessage('Изменения отменены.');}}>Отмена</DsButton>
      <DsButton disabled>Недоступно</DsButton>
    </div><p role="status">{message}</p>
  </form>;
}
function Navigation(){const [tab,setTab]=React.useState('objects');const [message,setMessage]=React.useState('Выберите действие в меню.');return <div style={{display:'grid',gap:'var(--ds-gap-md)'}}>
  <DsTabs idBase="focus-tabs" aria-label="Представление" items={[{id:'objects',label:'Объекты'},{id:'events',label:'События'}]} active={tab} onChange={setTab}/>
  <DsTabPanel idBase="focus-tabs" id="objects" active={tab==='objects'}>Объект МАЗ 5440</DsTabPanel>
  <DsTabPanel idBase="focus-tabs" id="events" active={tab==='events'}>Последнее сообщение — 14:32</DsTabPanel>
  <div><DsMenu trigger={<DsButton tone="secondary">Действия</DsButton>} items={[{id:'export',label:'Экспортировать'},{id:'copy',label:'Копировать'}]} onSelect={item=>setMessage(item.id==='export'?'Выбран экспорт.':'Выбрано копирование.')}/></div>
  <p role="status">{message}</p>
</div>;}

export function FocusExamples() {
  return <section style={{display: 'grid', gap: 24}}>
    <Settings />
    <Navigation />
  </section>;
}
```

</details>

## Дальше

- [Наведение и нажатие](../DsHover/README.md) — временная реакция на указатель и действие.
- [Кнопка](../DsButton/README.md) — готовое действие с клавиатурным фокусом.
- [Поле](../DsField/README.md) — обводка вокруг оболочки ввода.
- [Вкладки](../DsTabs/README.md) и [меню](../DsMenu/README.md) — навигация внутри группы.
