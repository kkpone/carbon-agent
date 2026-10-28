/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-25 11:36:38
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-25 18:26:31
 */
import { ReactNode } from 'react';

import { ProductListInfoData } from '../../Compare/types';

export type CompareDetailProps = {
  contrastStatus?: string;
  contrast?: number;
  detail?: ProductListInfoData;
  primaryColor?: string;
  changeProdBtn: ReactNode;
  /** 右侧的数据不展示标题和分割线 */
  isRight?: boolean;
};
