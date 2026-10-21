/**
 * Готовый конфиг системы. Потребитель пишет в `.stylelintrc.json`:
 *
 *   { "extends": "@primasoftllc/design-system/stylelint-config" }
 *
 * Пороги и исключения меняются в приложении поверх этого конфига — но каждое
 * исключение должно быть видно в дифе, поэтому здесь их нет.
 */
export default {
  plugins: ['./index.js'],
  rules: {
    'aurora/known-token': true,
    'aurora/no-literal-color': true,
    'aurora/no-rem': true,
    'aurora/focus-from-tokens': true,
    'aurora/shadow-token-only': true,
    'aurora/no-deprecated-token': [true, { severity: 'warning' }],
  },
};
