import React from 'react';

/** Обычная ссылка: браузер сохраняет переход, скачивание и открытие в новой вкладке. */
export const DsLink=React.forwardRef(function DsLink({href,target,rel,children,style,...props},ref){
  const safeRel=target?.toLowerCase()==='_blank'
    ? [...new Set([...(rel||'').split(/\s+/).filter(token=>token&&token.toLowerCase()!=='opener'),'noopener','noreferrer'])].join(' ')
    : rel;
  return <a {...props} ref={ref} href={href} target={target} rel={safeRel} data-ds-link=""
    style={{overflowWrap:'anywhere',...style}}>{children}</a>;
});
