/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-07-13 10:39:06
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-01-08 17:55:43
 */
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-css-modules',
    'stylelint-config-rational-order',
    'stylelint-config-prettier',
  ].map(function (key) {
    return require.resolve(key);
  }),
  plugins: [
    'stylelint-order',
    'stylelint-declaration-block-no-ignored-properties',
  ].map(function (key) {
    return require.resolve(key);
  }),
  customSyntax: 'postcss-less',
  rules: {
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    'plugin/declaration-block-no-ignored-properties': true,
  },
};
