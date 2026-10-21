import knownToken from './rules/known-token.js';
import noLiteralColor from './rules/no-literal-color.js';
import noRem from './rules/no-rem.js';
import focusFromTokens from './rules/focus-from-tokens.js';
import shadowTokenOnly from './rules/shadow-token-only.js';
import noDeprecatedToken from './rules/no-deprecated-token.js';

export default [knownToken, noLiteralColor, noRem, focusFromTokens, shadowTokenOnly, noDeprecatedToken];
