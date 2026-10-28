/*
 * @@description: formily 展示组件
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-04-28 10:04:20
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-28 10:43:53
 */
import classNames from 'classnames';
import { FC, createElement } from 'react';

import style from './index.module.less';
import { TextProps } from './types';

export const Text: FC<TextProps> = ({
  value,
  mode,
  placeholder,
  content,
  ...props
}) => {
  const tagName = mode === 'normal' || !mode ? 'div' : mode;
  return createElement(
    tagName,
    {
      ...props,
      // @ts-ignore
      className: classNames(props.className, style.text, {
        [style.placeholder]: !value,
      }),
    },
    value || placeholder || content,
  );
};
