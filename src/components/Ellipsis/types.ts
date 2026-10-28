/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-29 09:46:51
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-06 21:03:54
 */
import { ReactNode } from 'react';

export type Props = {
  text?: ReactNode;
  /** 宽度 */
  maxWidth?: number;
  className?: string;
};
