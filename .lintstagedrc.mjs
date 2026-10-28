/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-07-08 11:55:47
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-01-17 15:09:23
 */
export default {
  '*.{ts,tsx,js,jsx}': [
    'prettier --write',
    'eslint --fix --quiet --rule "no-console: error" --rule "no-debugger:error"',
  ],
};
