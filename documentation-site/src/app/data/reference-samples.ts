// Display labels and example data moved from the article templates without changing their values.
export const radiusSamples = [
  {
    token: '--ds-radius-xs',
    description: '4 px · Небольшие внутренние элементы',
  },
  {
    token: '--ds-radius-sm',
    description: '6 px · Мелкие блоки',
  },
  {
    token: '--ds-radius-md',
    description: '8 px · Кнопки, поля, меню',
  },
  {
    token: '--ds-radius-lg',
    description: '12 px · Панели и контейнеры',
  },
  {
    token: '--ds-radius-xl',
    description: '16 px · Диалоги',
  },
  {
    token: '--ds-radius-pill',
    description: '999 px · Капсулы',
  },
  {
    token: '--ds-radius-circle',
    description: '50% · Круг при равных сторонах',
  },
] as const;

export const shadowSamples = [
  {
    token: '--ds-shadow-xs',
    description: 'Бегунок переключателя, выбранный сегмент',
  },
  {
    token: '--ds-shadow-sm',
    description: 'Шапка над прокрученным содержимым',
  },
  {
    token: '--ds-shadow-md',
    description: 'Меню и всплывающие элементы',
  },
  {
    token: '--ds-shadow-lg',
    description: 'Диалог и парящая панель действий',
  },
  {
    token: '--ds-shadow-map',
    description: 'Контролы поверх карты',
  },
] as const;

export const statusTones = ['neutral', 'info', 'success', 'warning', 'danger'] as const;

export const chartSeries = [
  {
    label: 'series-1',
    token: '--ds-series-1',
  },
  {
    label: 'series-2',
    token: '--ds-series-2',
  },
  {
    label: 'series-3',
    token: '--ds-series-3',
  },
  {
    label: 'series-4',
    token: '--ds-series-4',
  },
  {
    label: 'series-5',
    token: '--ds-series-5',
  },
  {
    label: 'series-6',
    token: '--ds-series-6',
  },
  {
    label: 'series-7',
    token: '--ds-series-7',
  },
  {
    label: 'series-8',
    token: '--ds-series-8',
  },
] as const;

export const speedRows = [
  {
    time: '08:00',
    maz: 24,
    volvo: 40,
  },
  {
    time: '09:00',
    maz: 48,
    volvo: 56,
  },
  {
    time: '10:00',
    maz: 62,
    volvo: 48,
  },
  {
    time: '11:00',
    maz: null,
    volvo: 64,
  },
  {
    time: '12:00',
    maz: 54,
    volvo: 72,
  },
  {
    time: '13:00',
    maz: 76,
    volvo: 60,
  },
  {
    time: '14:00',
    maz: 60,
    volvo: 44,
  },
] as const;

export const neutralPalette = [
  {
    token: '--ds-n-0',
    hex: '#ffffff',
  },
  {
    token: '--ds-n-25',
    hex: '#fbfcfd',
  },
  {
    token: '--ds-n-50',
    hex: '#f6f7f9',
  },
  {
    token: '--ds-n-100',
    hex: '#eef0f4',
  },
  {
    token: '--ds-n-200',
    hex: '#e2e5ec',
  },
  {
    token: '--ds-n-300',
    hex: '#cdd2dc',
  },
  {
    token: '--ds-n-400',
    hex: '#a7aebd',
  },
  {
    token: '--ds-n-500',
    hex: '#7e8697',
  },
  {
    token: '--ds-n-600',
    hex: '#5e6676',
  },
  {
    token: '--ds-n-700',
    hex: '#454c5a',
  },
  {
    token: '--ds-n-800',
    hex: '#2d3340',
  },
  {
    token: '--ds-n-900',
    hex: '#1d222c',
  },
  {
    token: '--ds-n-950',
    hex: '#12151c',
  },
] as const;

export const themeRoles = [
  {
    token: '--ds-brand',
    description: 'Заливка главного действия и выбранного контрола.',
  },
  {
    token: '--ds-on-brand',
    description: 'Текст и иконка на брендовой заливке.',
  },
  {
    token: '--ds-brand-subtle',
    description: 'Мягкая брендовая подложка.',
  },
  {
    token: '--ds-brand-border',
    description: 'Граница брендового блока.',
  },
  {
    token: '--ds-brand-text',
    description: 'Брендовый текст и ссылки на поверхности.',
  },
  {
    token: '--ds-accent',
    description: 'Акцентная заливка с подписью.',
  },
  {
    token: '--ds-accent-on',
    description: 'Текст и иконка на акцентной заливке.',
  },
  {
    token: '--ds-accent-subtle',
    description: 'Мягкая акцентная подложка.',
  },
  {
    token: '--ds-accent-mark',
    description: 'Акцентная метка или точка.',
  },
  {
    token: '--ds-accent-mark-on',
    description: 'Подпись на акцентной метке.',
  },
] as const;
