/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:43
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-06 19:52:56
 * @LastEditTime: 2023-03-31 16:03:03
 */
module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.js', '.jsx'],
    },
    'import/internal-regex': ['^@src/', '^@components/'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  parser: '@typescript-eslint/parser', // 解析器
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
    project: './tsconfig.json',
    // typescript-eslint specific options
    warnOnUnsupportedTypeScriptVersion: true,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'prettier'],
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    // 'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index', 'unknown'],
        ],
        pathGroups: [
          {
            pattern: '@ahooksjs/**',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@**/**',
            group: 'internal',
            position: 'after',
          },
        ],
      },
    ],
    // off or warning
    'react/function-component-definition': 'off',
    'no-restricted-globals': 'off',
    'consistent-return': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'import/prefer-default-export': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unstable-nested-components': 'off',
    '@typescript-eslint/indent': 'off',
    // 代码格式化相关
    '@typescript-eslint/brace-style': 'off',
    // 函数必须定义返回类型
    ' @typescript-eslint/explicit-module-boundary-types': 'off',
    // 强制click和 onKeyUp, onKeyDown, onKeyPress 其中一个一同使用
    'jsx-a11y/click-events-have-key-events': 'off',
    // HTML 语义
    'jsx-a11y/no-static-element-interactions': 'off',
    // jsx 不允许使用扩展运算符
    'react/jsx-props-no-spreading': 'off',
    'react/destructuring-assignment': 'off',
    // 不允许 any
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    // 可选参数需要配置默认参数
    'react/require-default-props': 'off',
    // optional package
    'import/no-extraneous-dependencies': 'off',
    // promise then 2个参数 catch 1个参数
    '@typescript-eslint/no-floating-promises': 'off',
    'import/no-cycle': 'warn',
    'import/no-extraneous-dependencies': 'warn',
    'import/extensions': 'off',
    // 默认参数放置函数最后
    '@typescript-eslint/default-param-last': 'warn',
    // 以后要修复的
    // 变量命名问题
    '@typescript-eslint/naming-convention': 'warn',
    // 嵌套三元表达式
    'no-nested-ternary': 'warn',
    'no-plusplus': 'warn',
    'no-param-reassign': 'warn',
    // // 条件表达式不合适
    '@typescript-eslint/no-unused-expressions': 'warn',
    // // 相同的变量名已经在外层作用域定义
    '@typescript-eslint/no-shadow': 'warn',
    // // 变量使用在定义之前
    '@typescript-eslint/no-use-before-define': 'warn',
    'no-case-declarations': 'warn',
    'no-debugger': 'warn',
    // error
    '@typescript-eslint/no-unused-vars': 'error',
    // 注释右侧加一个空格
    'spaced-comment': ['warn', 'always'],
    'no-inline-comments': ['warn', { ignorePattern: 'webpackChunkName:\\s.+' }],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          // message并未全部支持，Toast不支持
          // {
          //   name: 'antd',
          //   importNames: ['message'],
          //   message: '使用 src/utils/Toast 替代 message',
          // },
          {
            name: 'react',
            importNames: ['React'],
            message: '不要直接使用 React。eg. import {memo} from "react"',
          },
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    '/*.js',
    '/sdk-template/*',
    '/src/sdks_v2/*',
    '/src/sdks/*',
    '/src/components/formily/packages/*',
    'src/views/carbonFootprint/',
    'src/views/carbonproduct/',
    'src/views/workbench/productList.tsx',
    'rsbuild.config.ts',
    'src/components/tiptap-extension/*',
    'src/components/tiptap-icons/*',
    'src/components/tiptap-node/*',
    'src/components/tiptap-templates/*',
    'src/components/tiptap-ui/*',
    'src/components/tiptap-ui-primitive/*',
    'src/lib/*',
    'src/hooks/use-cursor-visibility.ts',
    'src/hooks/use-menu-navigation.ts',
    'src/hooks/use-mobile.ts',
    'src/hooks/use-tiptap-editor.ts',
    'src/hooks/use-window-size.ts',
  ],
};
