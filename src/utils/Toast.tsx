/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-28 17:23:00
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-28 18:59:25
 */
// eslint-disable-next-line no-restricted-imports
import { combineClassName } from '@utils/index';
// eslint-disable-next-line no-restricted-imports
import { message } from 'antd';
import { ReactNode } from 'react';

import login from './login.module.scss';

type ToastType = 'success' | 'error' | 'warn' | 'info' | 'warning';

export const Toast = async (
  type: ToastType,
  content: ReactNode,
  /** 秒 */
  times?: number,
) => {
  // antd v5 将 warn 改为 warning
  if (type === 'warn') {
    type = 'warning';
  }
  await message[type]({
    content: content ?? '未知问题',
    className: combineClassName(login.toast, login[`toast_${type}`]),
    duration: times,
  });
};
